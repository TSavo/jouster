# Cypress Test Runner

[Cypress](https://www.cypress.io/) is a next-generation front-end testing tool built for the modern web. Jouster provides seamless integration with Cypress, allowing you to track test failures and manage issues automatically.

## Installation

To use Cypress with Jouster, you need to install Cypress:

```bash
npm install --save-dev cypress
```

## Configuration

You can configure the Cypress test runner in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'cypress',
  testRunnerOptions: {
    cypress: {
      browser: 'chrome', // Browser to use
      headless: true, // Whether to run in headless mode
      reporter: 'json', // Reporter to use
      component: false, // Whether to run component tests
      configPath: null, // Path to Cypress configuration file
      env: {}, // Environment variables
      quiet: false, // Whether to suppress output
      record: false, // Whether to record results to Cypress Dashboard
      key: null, // Cypress Dashboard key
      parallel: false, // Whether to run tests in parallel
      group: null, // Group name for parallel runs
      tag: null, // Tags for recorded runs
      spec: null, // Spec pattern to run
      project: null, // Project path
      port: null, // Port to use for Cypress server
      baseUrl: null, // Base URL for Cypress
      config: {} // Additional Cypress configuration
    }
  }
};
```

## Command Line Options

When using the `jouster run-tests` command, you can specify Cypress-specific options:

```bash
npx jouster run-tests --test-runner cypress [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--cypress-browser <browser>` | Browser to use (chrome, firefox, edge, electron) |
| `--cypress-headless` | Run in headless mode |
| `--cypress-reporter <reporter>` | Reporter to use |
| `--cypress-component` | Run component tests |
| `--cypress-config-path <path>` | Path to Cypress configuration file |
| `--cypress-env <env>` | Comma-separated list of environment variables |
| `--cypress-quiet` | Suppress output |
| `--cypress-record` | Record results to Cypress Dashboard |
| `--cypress-key <key>` | Cypress Dashboard key |
| `--cypress-parallel` | Run tests in parallel |
| `--cypress-group <group>` | Group name for parallel runs |
| `--cypress-tag <tag>` | Tags for recorded runs |
| `--cypress-spec <spec>` | Spec pattern to run |
| `--cypress-project <path>` | Project path |
| `--cypress-port <port>` | Port to use for Cypress server |
| `--cypress-base-url <url>` | Base URL for Cypress |
| `--cypress-config <config>` | Additional Cypress configuration |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner cypress
```

### With Specific Browser

```bash
npx jouster run-tests --test-runner cypress --cypress-browser firefox
```

### With Headed Mode

```bash
npx jouster run-tests --test-runner cypress --cypress-headless false
```

### With Component Tests

```bash
npx jouster run-tests --test-runner cypress --cypress-component
```

### With Specific Spec

```bash
npx jouster run-tests --test-runner cypress --cypress-spec "cypress/e2e/login.cy.js"
```

### With Environment Variables

```bash
npx jouster run-tests --test-runner cypress --cypress-env "API_URL=http://localhost:3000,DEBUG=true"
```

### With Recording

```bash
npx jouster run-tests --test-runner cypress --cypress-record --cypress-key your-key
```

## Integration with Jouster

Jouster integrates with Cypress by:

1. Running Cypress tests with the specified configuration
2. Parsing Cypress test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use Cypress Configuration File

Instead of specifying all options on the command line, use a Cypress configuration file:

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 5000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}'
  }
};
```

Then reference it in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'cypress',
  testRunnerOptions: {
    cypress: {
      configPath: './cypress.config.js'
    }
  }
};
```

### 2. Use Cypress Commands

Cypress provides a rich set of commands for interacting with your application:

```javascript
describe('Login', () => {
  it('should log in successfully', () => {
    cy.visit('/login');
    cy.get('input[name="username"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Welcome');
  });
});
```

### 3. Use Cypress Custom Commands

You can create custom commands to encapsulate common actions:

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// cypress/e2e/dashboard.cy.js
describe('Dashboard', () => {
  it('should display user information', () => {
    cy.login('user@example.com', 'password123');
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Welcome');
  });
});
```

### 4. Use Cypress Fixtures

Cypress allows you to use fixtures for test data:

```javascript
// cypress/fixtures/users.json
{
  "admin": {
    "username": "admin@example.com",
    "password": "admin123"
  },
  "user": {
    "username": "user@example.com",
    "password": "user123"
  }
}

// cypress/e2e/login.cy.js
describe('Login', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
  });

  it('should log in as admin', function() {
    const { username, password } = this.users.admin;
    cy.login(username, password);
    cy.get('h1').should('contain', 'Admin Dashboard');
  });

  it('should log in as user', function() {
    const { username, password } = this.users.user;
    cy.login(username, password);
    cy.get('h1').should('contain', 'User Dashboard');
  });
});
```

### 5. Use Cypress Intercepts

Cypress allows you to intercept network requests:

```javascript
describe('API', () => {
  it('should display error message on API failure', () => {
    cy.intercept('GET', '/api/users', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error'
      }
    }).as('getUsers');

    cy.visit('/users');
    cy.wait('@getUsers');
    cy.get('.error-message').should('contain', 'Failed to load users');
  });
});
```

## Troubleshooting

### Tests Not Running

- Check that Cypress is installed: `npm list cypress`
- Check that the test files exist: `ls cypress/e2e`
- Check that the test files match the pattern: `cypress list-specs`
- Check that the Cypress configuration is correct: `cypress open --config-file cypress.config.js`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list cypress-mochawesome-reporter`
- Check that the reporter is configured correctly: `cypress open --config-file cypress.config.js`
- Check that the output is being captured: `cypress run --reporter json`

### Tests Running but Not Failing

- Check that assertions are being made: `cypress run --verbose`
- Check that the test runner is configured to fail on assertion failures: `cypress run --bail`
- Check that the test runner is configured to exit with a non-zero code on failure: `cypress run --exit`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Cypress API Reference](https://docs.cypress.io/api/table-of-contents)
- [Cypress CLI Options](https://docs.cypress.io/guides/guides/command-line)
- [Cypress Configuration](https://docs.cypress.io/guides/references/configuration)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
