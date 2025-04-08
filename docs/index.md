---
layout: default
title: Home
---

# Jouster Documentation

Welcome to the Jouster documentation! Jouster is a powerful tool that helps you "stick it to your failing tests" by automatically creating GitHub issues for failing tests and closing them when tests pass.

## Key Features

- **Automated Issue Tracking**: Automatically create GitHub issues for failing tests and close them when tests pass
- **Multiple Test Runners**: Support for Jest, Mocha, AVA, Tape, Jasmine, Vitest, Cypress, Playwright, TestCafe, and Karma
- **Customizable Templates**: Create custom issue templates with detailed test failure information
- **Regression Detection**: Automatically reopen issues when tests start failing again

## Getting Started

### Installation

Install Jouster using npm:

```bash
npm install --save-dev jouster
```

Or using yarn:

```bash
yarn add --dev jouster
```

### Quick Setup

Run the setup wizard to configure Jouster for your project:

```bash
npx jouster setup
```

This will guide you through setting up Jouster with your preferred test runner and GitHub repository.

### Basic Usage

Run your tests with Jouster:

```bash
npx jouster run-tests
```

Jouster will run your tests, create issues for failing tests, and close issues for passing tests.

## Test Runners

Jouster supports multiple test runners, allowing you to use your preferred testing framework while still benefiting from Jouster's issue tracking capabilities.

- [Test Runners Overview](./test-runners.html)
- [Jest](./test-runners/jest.html)
- [Mocha](./test-runners/mocha.html)
- [AVA](./test-runners/ava.html)
- [Tape](./test-runners/tape.html)
- [Jasmine](./test-runners/jasmine.html)
- [Vitest](./test-runners/vitest.html)
- [Cypress](./test-runners/cypress.html)
- [Playwright](./test-runners/playwright.html)
- [TestCafe](./test-runners/testcafe.html)
- [Karma](./test-runners/karma.html)
- [Generic](./test-runners/generic.html)

## About Jouster

Jouster is designed to streamline the process of tracking and managing test failures in your test suite. It supports multiple test runners including Jest, Mocha, AVA, Tape, Jasmine, Vitest, Cypress, Playwright, TestCafe, and Karma. By automatically creating GitHub issues for failing tests and closing them when tests pass, Jouster helps you:

- Keep track of failing tests without manual intervention
- Maintain a clear history of test failures and fixes
- Provide detailed information about test failures to developers
- Close issues automatically when tests start passing
- Reopen issues when tests start failing again (regression handling)

Jouster is built with a focus on performance, reliability, and extensibility, making it suitable for projects of all sizes.
