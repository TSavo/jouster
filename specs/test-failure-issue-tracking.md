# Jouster: Stick it to your failing tests Specification

## Overview
A system that tracks test failures by creating GitHub issues when tests fail and automatically closing them when tests pass. The system uses a local JSON file to maintain the mapping between test files and GitHub issues, minimizing GitHub API calls.

## Core Components

### 1. Local Mapping Database
- **File**: `test-issue-mapping.json`
- **Purpose**: Maps test identifiers to GitHub issue numbers
- **Structure**:
  ```json
  {
    "testIdentifiers": {
      "path/to/test.test.ts:TestSuiteName:testName": {
        "issueNumber": 123,
        "status": "open",
        "lastFailure": "2023-06-15T10:30:00Z",
        "lastUpdate": "2023-06-16T09:15:00Z"
      }
    }
  }
  ```
- **Persistence**: Written to disk only when changes occur

### 2. Custom Jest Reporter
- **Purpose**: Captures test results and manages issue creation/closure
- **Integration**: Added to Jest configuration when tracking is enabled

### 3. GitHub CLI Interface
- **Purpose**: Interacts with GitHub to create/close issues
- **Dependency**: Uses existing `gh` CLI tool

## Workflow

### Command Line Options
```
npm test -- --track-issues        # Track and close existing issues
npm test -- --generate-issues     # Create new issues for failures + track/close
```

### Process Flow

1. **Initialization**:
   - Load mapping database if it exists
   - Create empty mapping if not found
   - Verify GitHub CLI is available

2. **Test Execution**:
   - Run Jest tests normally
   - Collect results via custom reporter

3. **Issue Management** (after all tests complete):
   - **For failing tests**:
     - If test has an existing open issue:
       - Update the last failure timestamp
     - If test has an existing closed issue (regression):
       - Reopen the issue with a comment
       - Update the mapping status to open
     - If test has no existing issue:
       - Create a new GitHub issue
       - Add entry to mapping database

   - **For passing tests**:
     - If test has an existing open issue:
       - Close the GitHub issue
       - Update mapping status to "closed"
     - If test still fails:
       - No GitHub API call needed (issue already exists)

4. **Persistence**:
   - Write updated mapping to disk if any changes occurred

## GitHub API Usage Optimization

### Minimizing API Calls
1. **Create Issues Only When Necessary**:
   - Only with explicit `--generate-issues` flag
   - Only for tests that don't already have issues

2. **Close Issues Only When Status Changes**:
   - Only close issues when a test transitions from failing to passing
   - Use mapping to track current status

3. **No Updates to Existing Issues**:
   - Don't update existing issues for tests that continue to fail
   - Avoids unnecessary API calls

4. **Batch Operations**:
   - Group issue creation/closure operations
   - Execute in a single batch after all tests complete

### GitHub CLI Commands
- **Create Issue**:
  ```
  gh issue create --title "Test Failure: [test name]" --body "[details]" --label "test-failure"
  ```
- **Close Issue**:
  ```
  gh issue close [issue-number] --comment "Test now passing"
  ```
- **No Status Checks**:
  - Trust local mapping for issue status
  - Avoid `gh issue view` calls to check status

## Issue Content

### Issue Title
```
Test Failure: [test name] in [file path]
```

### Issue Body
```
## Test Failure Details

**File**: [file path]
**Test**: [test name]
**First Failure**: [timestamp]

### Error Message
```
[error message]
```

### Stack Trace
```
[stack trace]
```

## Labels
- `test-failure`: Applied to all test failure issues
- `flaky-test`: Optional, for tests that fail intermittently

## Edge Cases

### Handling Renamed Tests
- Treated as new tests (old issue remains, new issue created if needed)
- Manual cleanup may be required for old issues

### Flaky Tests
- Basic implementation: treat like any other test
- Future enhancement: detect patterns of flakiness

### Deleted Tests
- Mapping entries for deleted tests remain in database
- Optional cleanup tool to close issues for tests that no longer exist

## Performance Considerations

### Large Test Suites
- Only failing tests impact performance
- Mapping database size proportional to number of failing tests, not total tests
- File operations only when mapping changes

### Parallel Test Execution
- Reporter collects all results before processing
- Issue management happens after all tests complete

## Security and Access

### GitHub Authentication
- Relies on existing GitHub CLI authentication
- No additional credentials needed

### Repository Access
- Uses current repository context from GitHub CLI
- No cross-repository operations

## Implementation Guidelines

1. Create custom Jest reporter that implements this specification
2. Implement a single workflow that handles both issue creation and closure
3. Implement mapping database with atomic file writes
4. Add minimal GitHub CLI wrapper that handles errors and retries
5. Use a templating engine for rich, detailed issue content

## Templating System

The system should use a templating engine (such as Handlebars) to generate rich, detailed content for GitHub issues and comments. The templates should include:

1. **For Issue Creation**:
   - Explicit reproduction instructions with commands to run the test
   - Debugging tips and commands for troubleshooting
   - Test details (name, file path, duration, suite)
   - Jest-specific information (matcher details, expected vs. actual values)
   - Error messages and stack traces
   - Git information (branch, commit, author)
   - Environment information (Node version, OS)
   - Code snippets from the failing test with line numbers
   - Possible causes of the failure with automated analysis

2. **For Issue Closure**:
   - Verification instructions to confirm the fix
   - Resolution information (commit, author, time)
   - Duration the test was failing
   - Test details
   - Jest-specific information

3. **For Issue Reopening (Regression)**:
   - Explicit reproduction instructions with commands to run the test
   - Debugging tips and commands for troubleshooting
   - Regression information (commit, author, time)
   - Duration the test was passing
   - Current error with detailed information
   - Jest-specific information (matcher details, expected vs. actual values)
   - Stack trace and code snippets
   - Diff since last fix
   - Possible causes with automated analysis

## Usage

The system is designed to be used with a single command:

```bash
npm run test:with-tracking
```

This command will:
1. Run all tests in the test suite
2. Create GitHub issues for any failing tests that don't already have issues
3. Close GitHub issues for any tests that are now passing
4. Reopen existing issues for any tests that are failing again (regression)
5. Ensure proper error handling for GitHub API failures
