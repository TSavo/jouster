// Search index for Jouster documentation
const searchIndex = [
  {
    title: "Introduction",
    url: "./main.html",
    content: "Jouster is a powerful tool that helps you stick it to your failing tests by automatically creating GitHub issues for failing tests and closing them when tests pass. It supports multiple test runners including Jest, Mocha, AVA, Tape, Jasmine, Vitest, Cypress, Playwright, TestCafe, and Karma.",
    tags: ["introduction", "overview", "getting started"]
  },
  {
    title: "Installation",
    url: "./getting-started.html",
    content: "Install Jouster using npm: npm install --save-dev jouster. Or using yarn: yarn add --dev jouster. Jouster requires Node.js version 12 or higher and works with various test runners.",
    tags: ["installation", "setup", "npm", "yarn", "getting started"]
  },
  {
    title: "Quick Setup",
    url: "./setup-wizard.html",
    content: "Run the setup wizard to configure Jouster for your project: npx jouster setup. This will guide you through setting up Jouster with your preferred test runner and GitHub repository.",
    tags: ["setup", "wizard", "configuration", "getting started"]
  },
  {
    title: "Basic Usage",
    url: "./usage-guide.html",
    content: "Run your tests with Jouster: npx jouster run-tests. Jouster will run your tests, create issues for failing tests, and close issues for passing tests.",
    tags: ["usage", "run tests", "command line", "cli"]
  },
  {
    title: "Test Runners Overview",
    url: "./test-runners.html",
    content: "Jouster supports multiple test runners, allowing you to use your preferred testing framework while still benefiting from Jouster's issue tracking capabilities.",
    tags: ["test runners", "frameworks", "integration"]
  },
  {
    title: "Jest Test Runner",
    url: "./test-runners/jest.html",
    content: "Jest is a delightful JavaScript Testing Framework with a focus on simplicity. Jouster provides seamless integration with Jest, allowing you to track test failures and manage issues automatically.",
    tags: ["jest", "test runner", "javascript", "react"]
  },
  {
    title: "Mocha Test Runner",
    url: "./test-runners/mocha.html",
    content: "Mocha is a feature-rich JavaScript test framework running on Node.js and in the browser. Jouster provides seamless integration with Mocha, allowing you to track test failures and manage issues automatically.",
    tags: ["mocha", "test runner", "javascript", "node.js"]
  },
  {
    title: "AVA Test Runner",
    url: "./test-runners/ava.html",
    content: "AVA is a test runner for Node.js with a concise API, detailed error output, and process isolation. Jouster provides seamless integration with AVA, allowing you to track test failures and manage issues automatically.",
    tags: ["ava", "test runner", "javascript", "node.js"]
  },
  {
    title: "Tape Test Runner",
    url: "./test-runners/tape.html",
    content: "Tape is a TAP-producing test harness for Node.js and browsers. Jouster provides seamless integration with Tape, allowing you to track test failures and manage issues automatically.",
    tags: ["tape", "test runner", "javascript", "tap"]
  },
  {
    title: "Jasmine Test Runner",
    url: "./test-runners/jasmine.html",
    content: "Jasmine is a behavior-driven development framework for testing JavaScript code. Jouster provides seamless integration with Jasmine, allowing you to track test failures and manage issues automatically.",
    tags: ["jasmine", "test runner", "javascript", "bdd"]
  },
  {
    title: "Vitest Test Runner",
    url: "./test-runners/vitest.html",
    content: "Vitest is a Vite-native testing framework with a focus on speed and simplicity. Jouster provides seamless integration with Vitest, allowing you to track test failures and manage issues automatically.",
    tags: ["vitest", "test runner", "javascript", "vite"]
  },
  {
    title: "Cypress Test Runner",
    url: "./test-runners/cypress.html",
    content: "Cypress is a next-generation front-end testing tool built for the modern web. Jouster provides seamless integration with Cypress, allowing you to track test failures and manage issues automatically.",
    tags: ["cypress", "test runner", "javascript", "e2e", "end-to-end"]
  },
  {
    title: "Playwright Test Runner",
    url: "./test-runners/playwright.html",
    content: "Playwright is a framework for Web Testing and Automation. Jouster provides seamless integration with Playwright, allowing you to track test failures and manage issues automatically.",
    tags: ["playwright", "test runner", "javascript", "e2e", "end-to-end", "microsoft"]
  },
  {
    title: "TestCafe Test Runner",
    url: "./test-runners/testcafe.html",
    content: "TestCafe is a Node.js tool to automate end-to-end web testing. Jouster provides seamless integration with TestCafe, allowing you to track test failures and manage issues automatically.",
    tags: ["testcafe", "test runner", "javascript", "e2e", "end-to-end"]
  },
  {
    title: "Karma Test Runner",
    url: "./test-runners/karma.html",
    content: "Karma is a test runner that runs tests in real browsers. Jouster provides seamless integration with Karma, allowing you to track test failures and manage issues automatically.",
    tags: ["karma", "test runner", "javascript", "browser"]
  },
  {
    title: "Generic Test Runner",
    url: "./test-runners/generic.html",
    content: "The Generic test runner in Jouster allows you to run any command-line test tool that isn't directly supported. This provides flexibility to use your preferred testing framework while still benefiting from Jouster's issue tracking capabilities.",
    tags: ["generic", "test runner", "custom", "command line"]
  },
  {
    title: "Core Concepts",
    url: "./core-concepts.html",
    content: "Learn about the core concepts of Jouster, including how it works, test identification, issue lifecycle, and the mapping database.",
    tags: ["concepts", "how it works", "architecture"]
  },
  {
    title: "Test Identification",
    url: "./core-concepts.html#test-identification",
    content: "Jouster identifies tests using a unique identifier based on the test name and file path. This allows Jouster to track tests across runs and map them to GitHub issues.",
    tags: ["test identification", "tracking", "mapping"]
  },
  {
    title: "Issue Lifecycle",
    url: "./core-concepts.html#issue-lifecycle",
    content: "Jouster manages the lifecycle of GitHub issues for failing tests. When a test fails, Jouster creates an issue. When the test passes, Jouster closes the issue. If the test fails again, Jouster reopens the issue.",
    tags: ["issue lifecycle", "github", "tracking"]
  },
  {
    title: "Mapping Database",
    url: "./core-concepts.html#mapping-database",
    content: "Jouster uses a mapping database to track the relationship between tests and GitHub issues. This allows Jouster to know which issue to close or reopen when a test passes or fails.",
    tags: ["mapping database", "tracking", "persistence"]
  },
  {
    title: "Templates",
    url: "./templates.html",
    content: "Jouster uses templates to generate GitHub issues for failing tests. You can customize these templates to include additional information or formatting.",
    tags: ["templates", "customization", "github issues"]
  },
  {
    title: "Advanced Features",
    url: "./advanced-features.html",
    content: "Explore advanced features of Jouster, including hooks, plugins, custom templates, and file-based bug tracking.",
    tags: ["advanced", "features", "hooks", "plugins"]
  },
  {
    title: "Hooks",
    url: "./advanced-features.html#hooks",
    content: "Hooks allow you to run custom code at specific points in the Jouster workflow. For example, you can run code before or after tests, or when an issue is created or closed.",
    tags: ["hooks", "customization", "workflow"]
  },
  {
    title: "Plugins",
    url: "./advanced-features.html#plugins",
    content: "Plugins extend Jouster's functionality. You can create plugins to add new features or integrate with other tools.",
    tags: ["plugins", "customization", "integration"]
  },
  {
    title: "API Reference",
    url: "./api-reference.html",
    content: "Comprehensive reference for Jouster's API, including core APIs, configuration options, plugin development, and hook development.",
    tags: ["api", "reference", "development"]
  },
  {
    title: "Troubleshooting",
    url: "./troubleshooting.html",
    content: "Common issues and solutions for Jouster, including debugging tips and frequently asked questions.",
    tags: ["troubleshooting", "issues", "debugging", "faq"]
  },
  {
    title: "Contributing",
    url: "./contributing.html",
    content: "Guidelines for contributing to Jouster, including development setup, code style, testing, and pull request process.",
    tags: ["contributing", "development", "open source"]
  },
  {
    title: "Examples",
    url: "./examples/README.html",
    content: "Examples of using Jouster in different scenarios, including basic usage, custom templates, custom hooks, and custom plugins.",
    tags: ["examples", "usage", "samples"]
  }
];

// Make the search index available globally
window.jousterSearchIndex = searchIndex;
