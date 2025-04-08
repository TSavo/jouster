---
layout: default
title: Home
---

# Jouster Documentation

Welcome to the Jouster documentation! Jouster is a powerful tool that helps you "stick it to your failing tests" by automatically creating GitHub issues for failing tests and closing them when tests pass.

<div class="feature-grid">
  <div class="feature-card">
    <div class="feature-icon"><i class="fas fa-bug"></i></div>
    <h3 class="feature-title">Automated Issue Tracking</h3>
    <p class="feature-description">Automatically create GitHub issues for failing tests and close them when tests pass, keeping your test status organized.</p>
  </div>

  <div class="feature-card">
    <div class="feature-icon"><i class="fas fa-code"></i></div>
    <h3 class="feature-title">Multiple Test Runners</h3>
    <p class="feature-description">Support for Jest, Mocha, AVA, Tape, Jasmine, Vitest, Cypress, Playwright, TestCafe, and Karma test runners.</p>
  </div>

  <div class="feature-card">
    <div class="feature-icon"><i class="fas fa-file-alt"></i></div>
    <h3 class="feature-title">Customizable Templates</h3>
    <p class="feature-description">Create custom issue templates with detailed test failure information to help developers quickly understand and fix issues.</p>
  </div>

  <div class="feature-card">
    <div class="feature-icon"><i class="fas fa-sync-alt"></i></div>
    <h3 class="feature-title">Regression Detection</h3>
    <p class="feature-description">Automatically reopen issues when tests start failing again, helping you catch regressions quickly.</p>
  </div>
</div>

## Getting Started

<div class="collapsible-header">Installation</div>
<div class="collapsible-content">
  <p>Install Jouster using npm:</p>

  ```bash
  npm install --save-dev jouster
  ```

  <p>Or using yarn:</p>

  ```bash
  yarn add --dev jouster
  ```
</div>

<div class="collapsible-header">Quick Setup</div>
<div class="collapsible-content">
  <p>Run the setup wizard to configure Jouster for your project:</p>

  ```bash
  npx jouster setup
  ```

  <p>This will guide you through setting up Jouster with your preferred test runner and GitHub repository.</p>
</div>

<div class="collapsible-header">Basic Usage</div>
<div class="collapsible-content">
  <p>Run your tests with Jouster:</p>

  ```bash
  npx jouster run-tests
  ```

  <p>Jouster will run your tests, create issues for failing tests, and close issues for passing tests.</p>
</div>

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
