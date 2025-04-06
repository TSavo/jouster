const fs = require('fs');
const path = require('path');

// Directories to move to src
const dirsToMove = ['github', 'issues', 'jest', 'storage', 'types', 'utils'];

// Function to create directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to copy a file
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
  console.log(`Copied: ${source} -> ${destination}`);
}

// Function to move a directory
function moveDirectory(sourceDir, destDir) {
  ensureDirectoryExists(destDir);
  
  // Get all files in the source directory
  const files = fs.readdirSync(sourceDir);
  
  // Process each file
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    // Check if it's a directory
    if (fs.statSync(sourcePath).isDirectory()) {
      // Recursively move the subdirectory
      moveDirectory(sourcePath, destPath);
    } else {
      // Copy the file
      copyFile(sourcePath, destPath);
    }
  }
}

// Move each directory to src
for (const dir of dirsToMove) {
  if (fs.existsSync(dir)) {
    const sourceDir = path.join(__dirname, dir);
    const destDir = path.join(__dirname, 'src', dir);
    
    console.log(`Moving directory: ${sourceDir} -> ${destDir}`);
    moveDirectory(sourceDir, destDir);
  }
}

// Move index.ts to src if it exists
const indexPath = path.join(__dirname, 'index.ts');
if (fs.existsSync(indexPath)) {
  const destPath = path.join(__dirname, 'src', 'index.ts');
  copyFile(indexPath, destPath);
}

console.log('Files moved successfully!');
