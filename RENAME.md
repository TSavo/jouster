# Project Rename: GHITracker → Jouster

This document summarizes the changes made to rename the project from "GHITracker" to "Jouster".

## Changes Made

1. **Package Information**
   - Updated package.json to use the name "jouster"
   - Updated description to include the subtitle "Stick it to your failing tests"

2. **Documentation**
   - Updated README.md with new project name and subtitle
   - Created comprehensive documentation in the docs/ directory
   - Created examples in the docs/examples/ directory
   - Updated specs/test-failure-issue-tracking.md with new project name

3. **Source Code**
   - Updated src/index.ts with new project name and subtitle
   - Updated src/jest/issue-tracker-reporter.ts with new project name and subtitle

4. **Configuration**
   - Created a Config class in src/config.ts to improve configuration handling
   - Added tests for the Config class in src/__tests__/config.test.ts

## Documentation Structure

```
docs/
├── README.md                 # Main documentation index
├── getting-started.md        # Getting started guide
├── core-concepts.md          # Core concepts explanation
├── usage-guide.md            # Usage guide
├── templating.md             # Templating guide
├── advanced-features.md      # Advanced features guide
├── api-reference.md          # API reference
├── troubleshooting.md        # Troubleshooting guide
├── contributing.md           # Contributing guide
└── examples/                 # Examples directory
    ├── README.md             # Examples index
    ├── basic-example.md      # Basic example
    ├── custom-templates.md   # Custom templates example
    ├── custom-hooks.md       # Custom hooks example
    └── custom-plugins.md     # Custom plugins example
```

## Next Steps

1. **Complete Documentation**
   - Fill in any missing documentation files
   - Add more examples

2. **Update Tests**
   - Ensure all tests pass with the new project name
   - Add tests for any new functionality

3. **Update Build Process**
   - Update any build scripts to use the new project name

4. **Update CI/CD**
   - Update any CI/CD configurations to use the new project name

5. **Release**
   - Create a new release with the new project name
   - Update the npm package
