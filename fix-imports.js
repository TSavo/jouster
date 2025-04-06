const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTypeScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      // Skip node_modules and dist directories
      if (file !== 'node_modules' && file !== 'dist') {
        findTypeScriptFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix imports from './src/...' to '../...'
  if (content.includes('./src/')) {
    content = content.replace(/from ['"]\.\/src\//g, 'from \'../');
    modified = true;
  }
  
  // Fix imports from '../types' to './types'
  if (filePath.includes('src/') && !filePath.includes('src/types/') && content.includes('../types')) {
    content = content.replace(/from ['"]\.\.\/types['"]/g, 'from \'./types\'');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Find all TypeScript files
const tsFiles = findTypeScriptFiles(path.join(__dirname, 'src'));

// Fix imports in each file
tsFiles.forEach(fixImportsInFile);

console.log('Imports fixed successfully!');
