const fs = require('fs');
const path = require('path');

// Directory to search
const testDir = path.join(__dirname, 'src', '__tests__');

// Patterns to look for
const skipPatterns = [
  'it.skip(',
  'describe.skip(',
  'test.skip(',
];

// Function to search for skipped tests in a file
function findSkippedTests(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const skippedTests = [];

  lines.forEach((line, index) => {
    for (const pattern of skipPatterns) {
      if (line.includes(pattern)) {
        skippedTests.push({
          file: filePath,
          line: index + 1,
          content: line.trim()
        });
        break;
      }
    }
  });

  return skippedTests;
}

// Function to recursively search directories
function searchDirectory(dir) {
  const files = fs.readdirSync(dir);
  let results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(searchDirectory(filePath));
    } else if (file.endsWith('.test.ts') || file.endsWith('.test.js')) {
      const skippedTests = findSkippedTests(filePath);
      results = results.concat(skippedTests);
    }
  }

  return results;
}

// Run the search
const skippedTests = searchDirectory(testDir);

// Print results
console.log(`Found ${skippedTests.length} skipped tests:`);
skippedTests.forEach(test => {
  console.log(`${test.file}:${test.line} - ${test.content}`);
});

// Group by file for easier processing
const fileGroups = {};
skippedTests.forEach(test => {
  if (!fileGroups[test.file]) {
    fileGroups[test.file] = [];
  }
  fileGroups[test.file].push(test);
});

console.log('\nFiles with skipped tests:');
for (const file in fileGroups) {
  console.log(`${file} - ${fileGroups[file].length} skipped tests`);
}
