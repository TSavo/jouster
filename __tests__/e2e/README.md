# Test Issue Tracker E2E Tests

These end-to-end tests demonstrate the full workflow of the test issue tracker system.

## Prerequisites

1. GitHub CLI (`gh`) must be installed and authenticated
2. You must have permission to create and delete issues in the repository

## What the Tests Do

The E2E test performs the following steps:

1. Creates a temporary test file with a failing test
2. Runs the test with `--generate-issues` to create a GitHub issue
3. Verifies the issue was created both locally and on GitHub
4. Fixes the test to make it pass
5. Runs the test with `--track-issues` to close the issue
6. Verifies the issue was closed both locally and on GitHub
7. Cleans up by deleting the issue and temporary files

## Running the Tests

To run the E2E tests:

```bash
npm run test:issue-tracker:e2e
```

## Important Notes

- These tests create and delete real GitHub issues
- They are skipped by default unless the `RUN_E2E_TESTS` environment variable is set to `true`
- The tests clean up after themselves, but if they fail, you may need to manually delete the created issue
- The tests use a temporary directory and mapping file that are deleted after the tests complete
