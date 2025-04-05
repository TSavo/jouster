# Contributing to Jouster

Thank you for your interest in contributing to Jouster! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)
- [Release Process](#release-process)

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to maintain a respectful and inclusive environment for everyone.

## Development Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Git

### Setup Steps

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/jouster.git
   cd jouster
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
4. Set up pre-commit hooks:
   ```bash
   npm run prepare
   # or
   yarn prepare
   ```
5. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Code Style

Jouster uses TypeScript and follows a consistent code style enforced by ESLint and Prettier. To ensure your code meets the style requirements:

1. Run the linter:
   ```bash
   npm run lint
   # or
   yarn lint
   ```
2. Fix linting issues automatically:
   ```bash
   npm run lint:fix
   # or
   yarn lint:fix
   ```
3. Format your code:
   ```bash
   npm run format
   # or
   yarn format
   ```

### Style Guidelines

- Use meaningful variable and function names
- Write clear comments for complex logic
- Follow the single responsibility principle
- Keep functions small and focused
- Use TypeScript types and interfaces
- Avoid any and explicit type assertions when possible
- Use async/await instead of raw promises
- Use const by default, let when necessary, and avoid var
- Use template literals instead of string concatenation
- Use destructuring assignment when appropriate
- Use arrow functions for callbacks
- Use optional chaining and nullish coalescing when appropriate

## Testing

Jouster has a comprehensive test suite using Jest. All new features and bug fixes should include tests.

### Running Tests

```bash
# Run all tests
npm test
# or
yarn test

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch
```

### Test Guidelines

- Write tests for all new features and bug fixes
- Aim for 100% code coverage
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests independent and isolated
- Use beforeEach and afterEach for setup and teardown
- Use describe blocks to group related tests
- Use test.each for parameterized tests

## Pull Request Process

1. Ensure your code follows the style guidelines and passes all tests
2. Update the documentation to reflect any changes
3. Add a clear description of the changes in your pull request
4. Link to any related issues
5. Request a review from a maintainer
6. Address any feedback from the review
7. Once approved, a maintainer will merge your pull request

### Pull Request Guidelines

- Keep pull requests focused on a single feature or bug fix
- Include tests for all new code
- Update documentation as needed
- Ensure all tests pass
- Ensure the build passes
- Follow the commit message guidelines
- Squash commits before merging

### Commit Message Guidelines

Jouster follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Changes that do not affect the meaning of the code (formatting, etc.)
- refactor: Code changes that neither fix a bug nor add a feature
- perf: Performance improvements
- test: Adding or fixing tests
- chore: Changes to the build process or auxiliary tools

Example:
```
feat(templates): add support for custom templates

Add support for custom templates by allowing users to specify a template directory.

Closes #123
```

## Issue Reporting

If you find a bug or have a suggestion for improvement, please create an issue on GitHub:

1. Check if the issue already exists
2. Use the issue template to provide all necessary information
3. Include steps to reproduce the issue
4. Include expected and actual behavior
5. Include screenshots or code snippets if applicable
6. Include version information

## Feature Requests

Feature requests are welcome! Please create an issue on GitHub:

1. Check if the feature request already exists
2. Use the feature request template to provide all necessary information
3. Describe the feature in detail
4. Explain why the feature would be useful
5. Provide examples of how the feature would be used

## Documentation

Documentation is a crucial part of Jouster. Please help improve it by:

1. Fixing typos and grammar issues
2. Clarifying confusing sections
3. Adding examples and use cases
4. Adding missing documentation
5. Updating documentation to reflect changes

## Release Process

Jouster follows [Semantic Versioning](https://semver.org/). The release process is handled by the maintainers:

1. Update the version in package.json
2. Update the CHANGELOG.md file
3. Create a new release on GitHub
4. Publish to npm

## Thank You!

Thank you for contributing to Jouster! Your help is greatly appreciated.
