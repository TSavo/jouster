# Jouster Documentation

Welcome to the Jouster documentation! Jouster is a powerful tool that helps you "stick it to your failing tests" by automatically creating GitHub issues for failing tests and closing them when tests pass.

## Table of Contents

1. [Getting Started](./getting-started.md)
   - [Installation](./getting-started.md#installation)
   - [Quick Start](./getting-started.md#quick-start)
   - [Configuration](./getting-started.md#configuration)
   - [Setup Wizard](./setup-wizard.md)

2. [Core Concepts](./core-concepts.md)
   - [How Jouster Works](./core-concepts.md#how-jouster-works)
   - [Test Identification](./core-concepts.md#test-identification)
   - [Issue Lifecycle](./core-concepts.md#issue-lifecycle)
   - [Mapping Database](./core-concepts.md#mapping-database)

3. [Usage Guide](./usage-guide.md)
   - [Basic Usage](./usage-guide.md#basic-usage)
   - [Command Line Options](./usage-guide.md#command-line-options)
   - [Environment Variables](./usage-guide.md#environment-variables)
   - [Integration with CI/CD](./usage-guide.md#integration-with-cicd)

4. [Test Runners](./test-runners.md)
   - [Jest](./test-runners/jest.md)
   - [Mocha](./test-runners/mocha.md)
   - [AVA](./test-runners/ava.md)
   - [Tape](./test-runners/tape.md)
   - [Jasmine](./test-runners/jasmine.md)
   - [Vitest](./test-runners/vitest.md)
   - [Cypress](./test-runners/cypress.md)
   - [Playwright](./test-runners/playwright.md)
   - [TestCafe](./test-runners/testcafe.md)
   - [Karma](./test-runners/karma.md)
   - [Generic](./test-runners/generic.md)

5. [Templates](./templates.md)
   - [Template Types](./templates.md#template-types)
   - [Custom Templates](./templates.md#custom-templates)
   - [Template Variables](./templates.md#template-variables)
   - [Template Helpers](./templates.md#template-helpers)
   - [Template Validation](./templates.md#template-validation)
   - [Template Preview](./templates.md#template-preview)
   - [Template Gallery](./template-gallery.md)
   - [Template Inheritance](./template-inheritance.md)
   - [Template Partials](./template-partials.md)
   - [Template Versioning](./template-versioning.md)

6. [Advanced Features](./advanced-features.md)
   - [Hooks](./advanced-features.md#hooks)
   - [Plugins](./advanced-features.md#plugins)
   - [Custom Templates](./advanced-features.md#custom-templates)
   - [File-based Bug Tracking](./advanced-features.md#file-based-bug-tracking)

7. [API Reference](./api-reference.md)
   - [Core APIs](./api-reference.md#core-apis)
   - [Configuration Options](./api-reference.md#configuration-options)
   - [Plugin Development](./api-reference.md#plugin-development)
   - [Hook Development](./api-reference.md#hook-development)

8. [Troubleshooting](./troubleshooting.md)
   - [Common Issues](./troubleshooting.md#common-issues)
   - [Debugging](./troubleshooting.md#debugging)
   - [FAQ](./troubleshooting.md#faq)

9. [Contributing](./contributing.md)
   - [Development Setup](./contributing.md#development-setup)
   - [Code Style](./contributing.md#code-style)
   - [Testing](./contributing.md#testing)
   - [Pull Request Process](./contributing.md#pull-request-process)

10. [Examples](./examples/README.md)
   - [Basic Example](./examples/basic-example.md)
   - [Custom Templates](./examples/custom-templates.md)
   - [Custom Hooks](./examples/custom-hooks.md)
   - [Custom Plugins](./examples/custom-plugins.md)

## About Jouster

Jouster is designed to streamline the process of tracking and managing test failures in your test suite. It supports multiple test runners including Jest, Mocha, AVA, Tape, Jasmine, Vitest, Cypress, Playwright, TestCafe, and Karma. By automatically creating GitHub issues for failing tests and closing them when tests pass, Jouster helps you:

- Keep track of failing tests without manual intervention
- Maintain a clear history of test failures and fixes
- Provide detailed information about test failures to developers
- Close issues automatically when tests start passing
- Reopen issues when tests start failing again (regression handling)

Jouster is built with a focus on performance, reliability, and extensibility, making it suitable for projects of all sizes.
