#!/usr/bin/env node

/**
 * Script to run the end-to-end tests for the test issue tracker
 * 
 * This script:
 * 1. Checks if GitHub CLI is available
 * 2. Sets the RUN_E2E_TESTS environment variable
 * 3. Runs the E2E tests
 */

const { spawnSync } = require('child_process');
const path = require('path');

// Check if GitHub CLI is available
const ghCheck = spawnSync('gh', ['--version'], { encoding: 'utf8', shell: true });

if (ghCheck.error || ghCheck.status !== 0) {
  console.error('GitHub CLI is not available. Please install it to run E2E tests.');
  console.error('See https://cli.github.com/ for installation instructions.');
  process.exit(1);
}

console.log('GitHub CLI is available. Running E2E tests...');

// Run the E2E tests
const result = spawnSync('npx', ['jest', '--config=src/test-issue-tracker/jest.config.js', 'src/test-issue-tracker/__tests__/e2e'], {
  env: {
    ...process.env,
    RUN_E2E_TESTS: 'true'
  },
  stdio: 'inherit',
  shell: true
});

process.exit(result.status);
