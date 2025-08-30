#!/bin/bash

# Image Optimization Script for Next.js Projects
# Converts images to WebP, archives originals, and renames to web-friendly format
# Version 2.0 - Enhanced error handling and cross-platform compatibility

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
PROCESSED_FILE="$SCRIPT_DIR/.processed_images"
LOG_FILE="$SCRIPT_DIR/.conversion_log"
WATCH_MODE=false
FORCE_MODE=false
QUALITY=85
MAX_WIDTH=2048
SUPPORTED_FORMATS=(jpg jpeg png gif bmp tiff JPG JPEG PNG GIF BMP TIFF)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() { printf "${BLUE}[INFO]${NC} %s\n" "$1"; }
log_success() { printf "${GREEN}[SUCCESS]${NC} %s\n" "$1"; }
log_warning() { printf "${YELLOW}[WARNING]${NC} %s\n" "$1"; }
log_error() { printf "${RED}[ERROR]${NC} %s\n" "$1"; }
log_debug() { [ "${DEBUG:-0}" = "1" ] && printf "${MAGENTA}[DEBUG]${NC} %s\n" "$1"; }

# Detect operating system
detect_os() {
    case "$(uname -s)" in
        Darwin*)    OS="macOS";;
        Linux*)     OS="Linux";;
        *)          OS="Unknown";;
    esac
    log_debug "Detected OS: $OS"
}

# Get file size in a cross-platform way
get_file_size() {
    local file="$1"
    if [[ "$OS" == "macOS" ]]; then
        stat -f%z "$file" 2>/dev/null || echo "0"
    else
        stat -c%s "$file" 2>/dev/null || echo "0"
    fi
}

# Check for required dependencies
check_dependencies() {
    local missing_deps=()
    local optional_deps=()
    
    # Required dependencies
    if ! command -v cwebp &> /dev/null; then
        missing_deps+=("webp")
    fi
    
    if ! command -v identify &> /dev/null; then
        missing_deps+=("imagemagick")
    fi
    
    # Optional dependencies for watch mode
    if [[ "$OS" == "macOS" ]]; then
        if ! command -v fswatch &> /dev/null; then
            optional_deps+=("fswatch")
        fi
    else
        if ! command -v inotifywait &> /dev/null; then
            optional_deps+=("inotify-tools")
        fi
    fi
    
    # Report missing required dependencies
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        echo ""
        echo "To install on macOS:"
        echo "  brew install webp imagemagick"
        echo ""
        echo "To install on Ubuntu/Debian:"
        echo "  sudo apt-get install webp imagemagick"
        echo ""
        exit 1
    fi
    
    # Report missing optional dependencies
    if [ ${#optional_deps[@]} -ne 0 ] && [ "$WATCH_MODE" = true ]; then
        log_error "Watch mode requires: ${optional_deps[*]}"
        echo ""
        if [[ "$OS" == "macOS" ]]; then
            echo "To install on macOS:"
            echo "  brew install fswatch"
        else
            echo "To install on Ubuntu/Debian:"
            echo "  sudo apt-get install inotify-tools"
        fi
        echo ""
        exit 1
    fi
    
    log_success "All required dependencies found"
}

# Create necessary directories and files
setup_directories() {
    # Create archive directory
    if [ ! -d "$ARCHIVE_DIR" ]; then
        mkdir -p "$ARCHIVE_DIR"
        log_info "Created archive directory: $ARCHIVE_DIR"
    fi
    
    # Create subdirectory for current month
    local archive_subdir="$ARCHIVE_DIR/$(date +%Y-%m)"
    mkdir -p "$archive_subdir"
    
    # Initialize tracking files
    [ ! -f "$PROCESSED_FILE" ] && touch "$PROCESSED_FILE"
    [ ! -f "$LOG_FILE" ] && touch "$LOG_FILE"
}

# Convert filename to web-friendly format
sanitize_filename() {
    local filename="$1"
    local name="${filename%.*}"
    
    # Convert to lowercase
    name=$(echo "$name" | tr '[:upper:]' '[:lower:]')
    
    # Replace spaces and special characters with hyphens
    name=$(echo "$name" | sed 's/[^a-z0-9-]/-/g')
    
    # Replace multiple consecutive hyphens with single hyphen
    name=$(echo "$name" | sed 's/-\+/-/g')
    
    # Remove leading and trailing hyphens
    name=$(echo "$name" | sed 's/^-//;s/-$//')
    
    # Handle empty result
    [ -z "$name" ] && name="image"
    
    echo "$name"
}

# Get image dimensions safely
get_image_info() {
    local image="$1"
    local info
    
    if info=$(identify -format "%wx%h" "$image" 2>/dev/null); then
        echo "$info"
    else
        echo "unknown"
    fi
}

# Check if file has alpha channel (transparency)
has_alpha_channel() {
    local image="$1"
    local channels
    
    if channels=$(identify -format '%[channels]' "$image" 2>/dev/null); then
        [[ "$channels" == *"a"* ]] && return 0
    fi
    return 1
}

# Process a single image
process_image() {
    local image_path="$1"
    local filename=$(basename "$image_path")
    local extension="${filename##*.}"
    local name="${filename%.*}"
    
    # Skip if already processed (unless in force mode)
    if [ "$FORCE_MODE" != "true" ] && grep -Fxq "$filename" "$PROCESSED_FILE" 2>/dev/null; then
        log_info "Skipping already processed: $filename"
        return 0
    fi
    
    # Skip if already a WebP file
    if [[ "${extension,,}" == "webp" ]]; then
        log_debug "Skipping WebP file: $filename"
        return 0
    fi
    
    # Get image info
    local dimensions=$(get_image_info "$image_path")
    if [[ "$dimensions" == "unknown" ]]; then
        log_warning "Cannot read image info for: $filename"
        return 1
    fi
    
    log_info "Processing: $filename ($dimensions)"
    
    # Create web-friendly filename
    local sanitized_name=$(sanitize_filename "$name")
    local webp_filename="${sanitized_name}.webp"
    local webp_path="$SCRIPT_DIR/$webp_filename"
    
    # Handle filename conflicts
    local counter=1
    while [ -f "$webp_path" ] && [ "$webp_path" != "$image_path" ]; do
        webp_filename="${sanitized_name}-${counter}.webp"
        webp_path="$SCRIPT_DIR/$webp_filename"
        ((counter++))
    done
    
    # Create archive path
    local archive_subdir="$ARCHIVE_DIR/$(date +%Y-%m)"
    local archive_filename="${filename}"
    local archive_path="$archive_subdir/$archive_filename"
    
    # Handle archive conflicts
    counter=1
    while [ -f "$archive_path" ]; do
        archive_filename="${name}_${counter}.${extension}"
        archive_path="$archive_subdir/$archive_filename"
        ((counter++))
    done
    
    # Archive original file
    if cp "$image_path" "$archive_path"; then
        log_success "Archived to: archive/$(date +%Y-%m)/$archive_filename"
    else
        log_error "Failed to archive: $filename"
        return 1
    fi
    
    # Prepare WebP conversion options
    local convert_options="-q $QUALITY"
    
    # Check image width for resizing
    local width=$(echo "$dimensions" | cut -d'x' -f1)
    if [[ "$width" =~ ^[0-9]+$ ]] && [ "$width" -gt "$MAX_WIDTH" ]; then
        convert_options="$convert_options -resize $MAX_WIDTH 0"
        log_info "Resizing from ${width}px to max ${MAX_WIDTH}px width"
    fi
    
    # Handle transparency for PNG files
    if [[ "${extension,,}" == "png" ]] && has_alpha_channel "$image_path"; then
        convert_options="$convert_options -alpha_q 100"
        log_info "Preserving transparency"
    fi
    
    # Convert to WebP
    if cwebp $convert_options "$image_path" -o "$webp_path" 2>/dev/null; then
        # Calculate size reduction
        local original_size=$(get_file_size "$archive_path")
        local new_size=$(get_file_size "$webp_path")
        local reduction=0
        
        if [ "$original_size" -gt 0 ]; then
            reduction=$(( (original_size - new_size) * 100 / original_size ))
        fi
        
        # Remove original file
        rm "$image_path"
        
        # Log success
        log_success "Created: $webp_filename (${reduction}% size reduction)"
        
        # Mark as processed
        echo "$filename" >> "$PROCESSED_FILE"
        
        # Log conversion details
        echo "$(date '+%Y-%m-%d %H:%M:%S') | $filename -> $webp_filename | ${original_size} -> ${new_size} bytes | ${reduction}% reduction" >> "$LOG_FILE"
        
        return 0
    else
        log_error "Failed to convert: $filename"
        # Restore from archive if conversion failed
        mv "$archive_path" "$image_path"
        return 1
    fi
}

# Process all images in directory
process_all_images() {
    log_info "Scanning for images in: $SCRIPT_DIR"
    
    local count=0
    local failed=0
    
    # Process each supported format
    for ext in "${SUPPORTED_FORMATS[@]}"; do
        for image in "$SCRIPT_DIR"/*."$ext"; do
            if [ -f "$image" ]; then
                if process_image "$image"; then
                    ((count++))
                else
                    ((failed++))
                fi
            fi
        done
    done
    
    # Report results
    if [ $count -eq 0 ] && [ $failed -eq 0 ]; then
        log_info "No images found to process"
    else
        [ $count -gt 0 ] && log_success "Successfully processed $count image(s)"
        [ $failed -gt 0 ] && log_warning "Failed to process $failed image(s)"
    fi
}

# Watch directory for new images
watch_directory() {
    log_info "Starting watch mode. Press Ctrl+C to stop."
    echo ""
    
    if [[ "$OS" == "macOS" ]] && command -v fswatch &> /dev/null; then
        log_info "Using fswatch for monitoring"
        
        # Create regex pattern for supported formats
        local pattern=""
        for ext in "${SUPPORTED_FORMATS[@]}"; do
            pattern="${pattern}|.*\\.${ext}$"
        done
        pattern="${pattern#|}"  # Remove leading |
        
        fswatch -0 -e ".*\\.webp$" -e ".*archive.*" \
                --event Created --event MovedTo \
                -i "$pattern" \
                "$SCRIPT_DIR" | while read -d "" event; do
            if [ -f "$event" ]; then
                log_info "New file detected: $(basename "$event")"
                sleep 0.5  # Brief wait for file to be fully written
                process_image "$event"
                echo ""
            fi
        done
        
    elif command -v inotifywait &> /dev/null; then
        log_info "Using inotifywait for monitoring"
        
        while true; do
            inotifywait -q -e create -e moved_to --format "%w%f" "$SCRIPT_DIR" | while read filepath; do
                # Check if file matches supported formats
                for ext in "${SUPPORTED_FORMATS[@]}"; do
                    if [[ "$filepath" == *."$ext" ]] && [[ ! "$filepath" == *"archive"* ]]; then
                        if [ -f "$filepath" ]; then
                            log_info "New file detected: $(basename "$filepath")"
                            sleep 0.5  # Brief wait for file to be fully written
                            process_image "$filepath"
                            echo ""
                        fi
                        break
                    fi
                done
            done
        done
    else
        log_error "No file watching tool available for $OS"
        exit 1
    fi
}

# Show usage information
show_usage() {
    cat << EOF
${CYAN}Image Optimization Script for Next.js Projects${NC}
Version 2.0

${YELLOW}Usage:${NC} $(basename "$0") [OPTIONS]

${YELLOW}OPTIONS:${NC}
    ${GREEN}-w, --watch${NC}      Watch directory for new images
    ${GREEN}-f, --force${NC}      Reprocess all images (ignore processed list)
    ${GREEN}-q, --quality${NC}    Set WebP quality (1-100, default: 85)
    ${GREEN}-m, --max-width${NC}  Maximum width in pixels (default: 2048)
    ${GREEN}-c, --clean${NC}      Clean up archives older than 30 days
    ${GREEN}-s, --stats${NC}      Show statistics about processed images
    ${GREEN}-d, --debug${NC}      Enable debug output
    ${GREEN}-h, --help${NC}       Show this help message

${YELLOW}EXAMPLES:${NC}
    $(basename "$0")                 # Process all images once
    $(basename "$0") -w              # Watch for new images
    $(basename "$0") -f -q 90        # Force reprocess with quality 90
    $(basename "$0") -s              # Show processing statistics

${YELLOW}FEATURES:${NC}
    ✓ Converts JPG, PNG, GIF, BMP, TIFF to optimized WebP
    ✓ Archives original files with date organization
    ✓ Generates web-friendly filenames (lowercase, hyphens)
    ✓ Preserves PNG transparency
    ✓ Automatic resizing for large images
    ✓ Prevents duplicate processing
    ✓ Watch mode for automatic processing
    ✓ Cross-platform support (macOS/Linux)

${YELLOW}SUPPORTED FORMATS:${NC}
    ${SUPPORTED_FORMATS[*]}

EOF
}

# Show statistics
show_stats() {
    printf "${CYAN}=== Image Optimization Statistics ===${NC}\n"
    echo ""
    
    if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ]; then
        local total_processed=$(wc -l < "$LOG_FILE" | tr -d ' ')
        printf "${GREEN}Total images processed:${NC} %s\n" "$total_processed"
        
        # Calculate total space saved
        local total_saved=0
        while IFS='|' read -r _ _ sizes reduction; do
            if [[ "$sizes" =~ ([0-9]+)\ -\>\ ([0-9]+) ]]; then
                local before="${BASH_REMATCH[1]}"
                local after="${BASH_REMATCH[2]}"
                total_saved=$((total_saved + before - after))
            fi
        done < "$LOG_FILE"
        
        if [ $total_saved -gt 0 ]; then
            local saved_mb=$((total_saved / 1024 / 1024))
            printf "${GREEN}Total space saved:${NC} %sMB\n" "$saved_mb"
        fi
        
        if [ -d "$ARCHIVE_DIR" ]; then
            local archive_size=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)
            printf "${GREEN}Archive size:${NC} %s\n" "$archive_size"
        fi
        
        local webp_count=$(find "$SCRIPT_DIR" -maxdepth 1 -name "*.webp" 2>/dev/null | wc -l | tr -d ' ')
        printf "${GREEN}Current WebP images:${NC} %s\n" "$webp_count"
        
        echo ""
        printf "${YELLOW}Recent conversions:${NC}\n"
        tail -5 "$LOG_FILE" | while IFS='|' read -r date conversion sizes reduction; do
            printf "  ${BLUE}%s${NC} |%s |%s\n" "$date" "$conversion" "$reduction"
        done
    else
        log_info "No statistics available. Process some images first."
    fi
}

# Clean old archives
clean_archives() {
    log_info "Cleaning archives older than 30 days..."
    
    local count=0
    if [ -d "$ARCHIVE_DIR" ]; then
        # Count files before deletion
        count=$(find "$ARCHIVE_DIR" -type f -mtime +30 2>/dev/null | wc -l | tr -d ' ')
        
        # Delete old files
        find "$ARCHIVE_DIR" -type f -mtime +30 -delete 2>/dev/null
        
        # Remove empty directories
        find "$ARCHIVE_DIR" -type d -empty -delete 2>/dev/null
    fi
    
    if [ $count -gt 0 ]; then
        log_success "Removed $count old archive file(s)"
    else
        log_info "No old archives to clean"
    fi
}

# Signal handling for clean exit
cleanup() {
    echo ""
    log_info "Shutting down..."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main execution
main() {
    # Detect OS first
    detect_os
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -w|--watch)
                WATCH_MODE=true
                shift
                ;;
            -f|--force)
                FORCE_MODE=true
                shift
                ;;
            -q|--quality)
                if [[ "$2" =~ ^[0-9]+$ ]] && [ "$2" -ge 1 ] && [ "$2" -le 100 ]; then
                    QUALITY="$2"
                else
                    log_error "Quality must be between 1 and 100"
                    exit 1
                fi
                shift 2
                ;;
            -m|--max-width)
                if [[ "$2" =~ ^[0-9]+$ ]] && [ "$2" -gt 0 ]; then
                    MAX_WIDTH="$2"
                else
                    log_error "Max width must be a positive number"
                    exit 1
                fi
                shift 2
                ;;
            -c|--clean)
                clean_archives
                exit 0
                ;;
            -s|--stats)
                show_stats
                exit 0
                ;;
            -d|--debug)
                DEBUG=1
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use -h or --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Header
    printf "${CYAN}Image Optimizer for Next.js${NC}\n"
    printf "${BLUE}Quality: %s | Max Width: %spx${NC}\n" "$QUALITY" "$MAX_WIDTH"
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Setup directories
    setup_directories
    
    # Process images
    if [ "$WATCH_MODE" = true ]; then
        # Process existing images first
        process_all_images
        echo ""
        # Start watching
        watch_directory
    else
        process_all_images
    fi
}

# Run main function
main "$@"