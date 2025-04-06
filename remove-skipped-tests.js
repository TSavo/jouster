const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/__tests__/github/github-client.test.ts',
  'src/__tests__/index.test.ts',
  'src/__tests__/issues/issue-manager.test.ts',
  'src/__tests__/jest/issue-tracker-reporter.test.ts',
  'src/__tests__/storage/mapping-store.test.ts'
];

// Function to remove .skip from tests
function removeSkippedTests(filePath) {
  console.log(`Processing ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all instances of .skip
  const updatedContent = content
    .replace(/it\.skip\(/g, 'it(')
    .replace(/describe\.skip\(/g, 'describe(')
    .replace(/test\.skip\(/g, 'test(');
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Updated ${filePath}`);
}

// Process each file
filesToFix.forEach(file => {
  removeSkippedTests(file);
});

console.log('All skipped tests have been removed.');
