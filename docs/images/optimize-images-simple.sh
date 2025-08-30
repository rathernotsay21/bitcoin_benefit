#!/bin/bash

# Simple Image Optimization Script for Next.js - macOS Compatible
# Converts images to WebP, archives originals, and renames to web-friendly format

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
PROCESSED_FILE="$SCRIPT_DIR/.processed_images"
LOG_FILE="$SCRIPT_DIR/.conversion_log"
QUALITY=85
MAX_WIDTH=2048

# Simple logging without colors for maximum compatibility
log_info() { echo "[INFO] $1"; }
log_success() { echo "[SUCCESS] $1"; }
log_warning() { echo "[WARNING] $1"; }
log_error() { echo "[ERROR] $1" >&2; }

# Check dependencies
check_dependencies() {
    local missing=""
    
    if ! command -v cwebp &> /dev/null; then
        missing="$missing webp"
    fi
    
    if ! command -v identify &> /dev/null; then
        missing="$missing imagemagick"
    fi
    
    if [ -n "$missing" ]; then
        log_error "Missing required dependencies:$missing"
        echo ""
        echo "To install on macOS:"
        echo "  brew install webp imagemagick"
        echo ""
        if [ "$1" = "watch" ] && ! command -v fswatch &> /dev/null; then
            echo "For watch mode, also install:"
            echo "  brew install fswatch"
            echo ""
        fi
        exit 1
    fi
    
    if [ "$1" = "watch" ] && ! command -v fswatch &> /dev/null; then
        log_error "Watch mode requires fswatch"
        echo "To install: brew install fswatch"
        exit 1
    fi
}

# Setup directories
setup_directories() {
    mkdir -p "$ARCHIVE_DIR"
    mkdir -p "$ARCHIVE_DIR/$(date +%Y-%m)"
    touch "$PROCESSED_FILE"
    touch "$LOG_FILE"
}

# Convert filename to web-friendly format
sanitize_filename() {
    local filename="$1"
    local name="${filename%.*}"
    
    # Convert to lowercase and replace non-alphanumeric with hyphens
    name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//;s/-$//')
    
    # Handle empty result
    [ -z "$name" ] && name="image"
    
    echo "$name"
}

# Get file size
get_file_size() {
    local file="$1"
    stat -f%z "$file" 2>/dev/null || echo "0"
}

# Process a single image
process_image() {
    local image_path="$1"
    local filename=$(basename "$image_path")
    local extension="${filename##*.}"
    local name="${filename%.*}"
    
    # Skip WebP files
    local ext_lower=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
    if [ "$ext_lower" = "webp" ]; then
        return 0
    fi
    
    # Skip if already processed
    if grep -Fxq "$filename" "$PROCESSED_FILE" 2>/dev/null; then
        log_info "Already processed: $filename"
        return 0
    fi
    
    log_info "Processing: $filename"
    
    # Create web-friendly filename
    local sanitized_name=$(sanitize_filename "$name")
    local webp_filename="${sanitized_name}.webp"
    local webp_path="$SCRIPT_DIR/$webp_filename"
    
    # Handle filename conflicts
    local counter=1
    while [ -f "$webp_path" ]; do
        webp_filename="${sanitized_name}-${counter}.webp"
        webp_path="$SCRIPT_DIR/$webp_filename"
        ((counter++))
    done
    
    # Archive original
    local archive_path="$ARCHIVE_DIR/$(date +%Y-%m)/$filename"
    counter=1
    while [ -f "$archive_path" ]; do
        archive_path="$ARCHIVE_DIR/$(date +%Y-%m)/${name}_${counter}.${extension}"
        ((counter++))
    done
    
    cp "$image_path" "$archive_path"
    log_success "Archived: $filename"
    
    # Convert to WebP
    if cwebp -q $QUALITY "$image_path" -o "$webp_path" 2>/dev/null; then
        # Calculate size reduction
        local original_size=$(get_file_size "$archive_path")
        local new_size=$(get_file_size "$webp_path")
        local reduction=0
        
        if [ "$original_size" -gt 0 ]; then
            reduction=$(( (original_size - new_size) * 100 / original_size ))
        fi
        
        # Remove original
        rm "$image_path"
        
        log_success "Created: $webp_filename (${reduction}% smaller)"
        
        # Log it
        echo "$filename" >> "$PROCESSED_FILE"
        echo "$(date '+%Y-%m-%d %H:%M:%S') | $filename -> $webp_filename | ${reduction}% reduction" >> "$LOG_FILE"
    else
        log_error "Failed to convert: $filename"
        mv "$archive_path" "$image_path"
        return 1
    fi
}

# Process all images
process_all_images() {
    log_info "Scanning for images..."
    
    local count=0
    local extensions="jpg jpeg png gif bmp tiff JPG JPEG PNG GIF BMP TIFF"
    
    for ext in $extensions; do
        for image in "$SCRIPT_DIR"/*."$ext"; do
            if [ -f "$image" ]; then
                process_image "$image"
                ((count++))
            fi
        done
    done
    
    if [ $count -eq 0 ]; then
        log_info "No images found to process"
    else
        log_success "Processed $count image(s)"
    fi
}

# Watch for new images
watch_directory() {
    log_info "Watching for new images. Press Ctrl+C to stop."
    
    fswatch -0 --event Created --event MovedTo \
            -e ".*\.webp$" -e ".*archive.*" \
            "$SCRIPT_DIR" | while read -d "" event; do
        
        # Check if it's an image file
        case "${event##*.}" in
            jpg|jpeg|png|gif|bmp|tiff|JPG|JPEG|PNG|GIF|BMP|TIFF)
                if [ -f "$event" ]; then
                    echo ""
                    log_info "New file: $(basename "$event")"
                    sleep 0.5  # Wait for file to be fully written
                    process_image "$event"
                fi
                ;;
        esac
    done
}

# Show help
show_help() {
    cat << EOF
Image Optimization Script for Next.js

Usage: $(basename "$0") [OPTIONS]

OPTIONS:
    -w    Watch directory for new images
    -h    Show this help

FEATURES:
    - Converts images to WebP format
    - Archives originals in /archive/YYYY-MM/
    - Creates web-friendly filenames
    - Monitors folder for new images (with -w)

EXAMPLES:
    $(basename "$0")       # Process all images once
    $(basename "$0") -w    # Watch for new images

EOF
}

# Main
main() {
    case "${1:-}" in
        -w|--watch)
            echo "==================================="
            echo "    Image Optimizer for Next.js    "
            echo "==================================="
            echo "Quality: $QUALITY | Max width: ${MAX_WIDTH}px"
            echo ""
            
            check_dependencies watch
            setup_directories
            process_all_images
            echo ""
            watch_directory
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo "==================================="
            echo "    Image Optimizer for Next.js    "
            echo "==================================="
            echo "Quality: $QUALITY | Max width: ${MAX_WIDTH}px"
            echo ""
            
            check_dependencies
            setup_directories
            process_all_images
            ;;
    esac
}

# Run
main "$@"