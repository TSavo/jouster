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

4. [Templating](./templating.md)
   - [Template Overview](./templating.md#template-overview)
   - [Available Variables](./templating.md#available-variables)
   - [Customizing Templates](./templating.md#customizing-templates)
   - [Template Examples](./templating.md#template-examples)

5. [Advanced Features](./advanced-features.md)
   - [Hooks](./advanced-features.md#hooks)
   - [Plugins](./advanced-features.md#plugins)
   - [Custom Templates](./advanced-features.md#custom-templates)
   - [File-based Bug Tracking](./advanced-features.md#file-based-bug-tracking)

6. [API Reference](./api-reference.md)
   - [Core APIs](./api-reference.md#core-apis)
   - [Configuration Options](./api-reference.md#configuration-options)
   - [Plugin Development](./api-reference.md#plugin-development)
   - [Hook Development](./api-reference.md#hook-development)

7. [Troubleshooting](./troubleshooting.md)
   - [Common Issues](./troubleshooting.md#common-issues)
   - [Debugging](./troubleshooting.md#debugging)
   - [FAQ](./troubleshooting.md#faq)

8. [Contributing](./contributing.md)
   - [Development Setup](./contributing.md#development-setup)
   - [Code Style](./contributing.md#code-style)
   - [Testing](./contributing.md#testing)
   - [Pull Request Process](./contributing.md#pull-request-process)

9. [Examples](./examples/README.md)
   - [Basic Example](./examples/basic-example.md)
   - [Custom Templates](./examples/custom-templates.md)
   - [Custom Hooks](./examples/custom-hooks.md)
   - [Custom Plugins](./examples/custom-plugins.md)

## About Jouster

Jouster is designed to streamline the process of tracking and managing test failures in your Jest test suite. By automatically creating GitHub issues for failing tests and closing them when tests pass, Jouster helps you:

- Keep track of failing tests without manual intervention
- Maintain a clear history of test failures and fixes
- Provide detailed information about test failures to developers
- Close issues automatically when tests start passing
- Reopen issues when tests start failing again (regression handling)

Jouster is built with a focus on performance, reliability, and extensibility, making it suitable for projects of all sizes.
