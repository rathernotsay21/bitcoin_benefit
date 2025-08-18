# Bitcoin Benefit - System Commands (macOS/Darwin)

## macOS-Specific Commands

### File Operations
```bash
# List files (with colors on macOS)
ls -la

# Find files (macOS find)
find . -name "*.ts" -type f

# Search in files (using ripgrep if available, otherwise grep)
rg "pattern" src/
grep -r "pattern" src/

# Copy files
cp -R source/ destination/

# Move/rename files
mv oldname newname
```

### Process Management
```bash
# List processes
ps aux | grep node

# Kill process by PID
kill -9 <PID>

# Kill processes by name
pkill -f "next"
```

### Network & Development
```bash
# Check port usage
lsof -i :3000

# Open in default browser (macOS)
open http://localhost:3000

# Open current directory in Finder
open .

# Open VS Code (if installed)
code .
```

### Git Operations
```bash
# Standard Git commands work the same
git status
git add .
git commit -m "message"
git push origin main

# Check Git configuration
git config --list
```

### Node.js & npm
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Check global packages
npm list -g --depth=0
```

### System Information
```bash
# System info
uname -a
sw_vers

# Disk usage
df -h

# Memory usage
top -l 1 | grep PhysMem
```

### Development Utilities
```bash
# Watch files for changes
fswatch src/ | while read; do npm test; done

# Create symbolic links
ln -s /path/to/source /path/to/link

# Environment variables
echo $NODE_ENV
export NODE_ENV=development
```