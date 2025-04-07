# TestCafe Test Runner

[TestCafe](https://testcafe.io/) is a Node.js tool to automate end-to-end web testing. Jouster provides seamless integration with TestCafe, allowing you to track test failures and manage issues automatically.

## Installation

To use TestCafe with Jouster, you need to install TestCafe:

```bash
npm install --save-dev testcafe
```

## Configuration

You can configure the TestCafe test runner in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'testcafe',
  testRunnerOptions: {
    testcafe: {
      browser: ['chrome:headless'], // Browsers to use
      reporter: ['json'], // Reporters to use
      concurrency: 1, // Number of concurrent browser instances
      screenshots: { // Screenshot options
        path: './screenshots',
        takeOnFails: true,
        fullPage: true
      },
      skipJsErrors: false, // Whether to skip JavaScript errors
      quarantineMode: false, // Whether to use quarantine mode
      selectorTimeout: 10000, // Timeout for selectors in milliseconds
      assertionTimeout: 5000, // Timeout for assertions in milliseconds
      pageLoadTimeout: 30000, // Timeout for page loading in milliseconds
      speed: 1, // Test execution speed (0.01-1)
      stopOnFirstFail: false, // Whether to stop on the first test failure
      disablePageCaching: false, // Whether to disable page caching
      disableScreenshots: false, // Whether to disable screenshots
      color: true, // Whether to use colors in output
      debug: false // Whether to run in debug mode
    }
  }
};
```

## Command Line Options

When using the `jouster run-tests` command, you can specify TestCafe-specific options:

```bash
npx jouster run-tests --test-runner testcafe [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--testcafe-browser <browsers>` | Comma-separated list of browsers to use |
| `--testcafe-reporter <reporters>` | Comma-separated list of reporters to use |
| `--testcafe-concurrency <n>` | Number of concurrent browser instances |
| `--testcafe-screenshots-path <path>` | Path to save screenshots |
| `--testcafe-screenshots-take-on-fails` | Take screenshots on test failures |
| `--testcafe-screenshots-full-page` | Take full-page screenshots |
| `--testcafe-skip-js-errors` | Skip JavaScript errors |
| `--testcafe-quarantine-mode` | Use quarantine mode |
| `--testcafe-selector-timeout <ms>` | Timeout for selectors in milliseconds |
| `--testcafe-assertion-timeout <ms>` | Timeout for assertions in milliseconds |
| `--testcafe-page-load-timeout <ms>` | Timeout for page loading in milliseconds |
| `--testcafe-speed <speed>` | Test execution speed (0.01-1) |
| `--testcafe-stop-on-first-fail` | Stop on the first test failure |
| `--testcafe-disable-page-caching` | Disable page caching |
| `--testcafe-disable-screenshots` | Disable screenshots |
| `--testcafe-color` | Use colors in output |
| `--testcafe-debug` | Run in debug mode |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner testcafe
```

### With Specific Browsers

```bash
npx jouster run-tests --test-runner testcafe --testcafe-browser "chrome:headless,firefox:headless"
```

### With Concurrency

```bash
npx jouster run-tests --test-runner testcafe --testcafe-concurrency 4
```

### With Quarantine Mode

```bash
npx jouster run-tests --test-runner testcafe --testcafe-quarantine-mode
```

### With Specific Files

```bash
npx jouster run-tests --test-runner testcafe tests/login.test.js tests/dashboard.test.js
```

### With Debug Mode

```bash
npx jouster run-tests --test-runner testcafe --testcafe-debug
```

## Integration with Jouster

Jouster integrates with TestCafe by:

1. Running TestCafe tests with the specified configuration
2. Parsing TestCafe test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use Page Object Model

TestCafe works well with the Page Object Model pattern:

```javascript
// pages/login-page.js
import { Selector, t } from 'testcafe';

class LoginPage {
  constructor() {
    this.usernameInput = Selector('input[name="username"]');
    this.passwordInput = Selector('input[name="password"]');
    this.submitButton = Selector('button[type="submit"]');
    this.errorMessage = Selector('.error-message');
  }

  async login(username, password) {
    await t
      .typeText(this.usernameInput, username)
      .typeText(this.passwordInput, password)
      .click(this.submitButton);
  }
}

export default new LoginPage();

// tests/login.test.js
import { fixture, test } from 'testcafe';
import LoginPage from '../pages/login-page';

fixture('Login')
  .page('http://localhost:3000/login');

test('should log in successfully', async t => {
  await LoginPage.login('user@example.com', 'password123');
  await t
    .expect(Selector('h1').innerText).contains('Welcome')
    .expect(Selector('.user-email').innerText).contains('user@example.com');
});

test('should show error message for invalid credentials', async t => {
  await LoginPage.login('invalid@example.com', 'wrongpassword');
  await t
    .expect(LoginPage.errorMessage.visible).ok()
    .expect(LoginPage.errorMessage.innerText).contains('Invalid credentials');
});
```

### 2. Use Fixtures for Setup and Teardown

TestCafe provides fixtures for test setup and teardown:

```javascript
import { fixture, test } from 'testcafe';
import { login } from '../helpers/auth';

fixture('Dashboard')
  .page('http://localhost:3000/login')
  .beforeEach(async t => {
    await login(t, 'user@example.com', 'password123');
  })
  .afterEach(async t => {
    await t.click(Selector('.logout-button'));
  });

test('should display user information', async t => {
  await t
    .expect(Selector('h1').innerText).contains('Welcome')
    .expect(Selector('.user-email').innerText).contains('user@example.com');
});
```

### 3. Use Test Hooks

TestCafe provides hooks for test setup and teardown:

```javascript
import { fixture, test } from 'testcafe';

fixture('API Tests')
  .page('http://localhost:3000')
  .beforeEach(async t => {
    // Set up authentication token
    await t.eval(() => {
      localStorage.setItem('token', 'your-auth-token');
    });
  })
  .afterEach(async t => {
    // Clean up
    await t.eval(() => {
      localStorage.removeItem('token');
    });
  });

test('should fetch user data', async t => {
  const response = await t.request({
    url: 'http://localhost:3000/api/users/1',
    method: 'GET'
  });

  await t
    .expect(response.status).eql(200)
    .expect(response.body.name).eql('John Doe')
    .expect(response.body.email).eql('john@example.com');
});
```

### 4. Use Client Functions

TestCafe provides client functions for executing code in the browser:

```javascript
import { Selector, ClientFunction } from 'testcafe';

const getLocalStorage = ClientFunction(key => localStorage.getItem(key));
const getLocation = ClientFunction(() => window.location.href);
const getWindowWidth = ClientFunction(() => window.innerWidth);

fixture('Client Functions')
  .page('http://localhost:3000');

test('should store user data in local storage', async t => {
  await t
    .click(Selector('.login-button'))
    .typeText(Selector('input[name="username"]'), 'user@example.com')
    .typeText(Selector('input[name="password"]'), 'password123')
    .click(Selector('button[type="submit"]'));

  const token = await getLocalStorage('token');
  await t.expect(token).ok();

  const location = await getLocation();
  await t.expect(location).contains('/dashboard');

  const width = await getWindowWidth();
  await t.expect(width).gte(1024);
});
```

### 5. Use Role for Authentication

TestCafe provides roles for authentication:

```javascript
import { Selector, Role } from 'testcafe';

const userRole = Role('http://localhost:3000/login', async t => {
  await t
    .typeText(Selector('input[name="username"]'), 'user@example.com')
    .typeText(Selector('input[name="password"]'), 'password123')
    .click(Selector('button[type="submit"]'));
}, { preserveUrl: true });

const adminRole = Role('http://localhost:3000/login', async t => {
  await t
    .typeText(Selector('input[name="username"]'), 'admin@example.com')
    .typeText(Selector('input[name="password"]'), 'admin123')
    .click(Selector('button[type="submit"]'));
}, { preserveUrl: true });

fixture('Roles')
  .page('http://localhost:3000');

test('user should see user dashboard', async t => {
  await t
    .useRole(userRole)
    .expect(Selector('h1').innerText).contains('User Dashboard');
});

test('admin should see admin dashboard', async t => {
  await t
    .useRole(adminRole)
    .expect(Selector('h1').innerText).contains('Admin Dashboard');
});
```

## Troubleshooting

### Tests Not Running

- Check that TestCafe is installed: `npm list testcafe`
- Check that the test files exist: `ls tests`
- Check that the test files match the pattern: `testcafe --list-browsers`
- Check that the browsers are available: `testcafe --list-browsers`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list testcafe-reporter-json`
- Check that the reporter is configured correctly: `testcafe chrome tests --reporter json`
- Check that the output is being captured: `testcafe chrome tests --reporter json > results.json`

### Tests Running but Not Failing

- Check that assertions are being made: `testcafe chrome tests --reporter spec`
- Check that the test runner is configured to fail on assertion failures: `testcafe chrome tests --stop-on-first-fail`
- Check that the test runner is configured to exit with a non-zero code on failure: `testcafe chrome tests`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [TestCafe Documentation](https://testcafe.io/documentation/402635/getting-started)
- [TestCafe API Reference](https://testcafe.io/documentation/402632/reference)
- [TestCafe CLI Options](https://testcafe.io/documentation/402639/reference/command-line-interface)
- [TestCafe Configuration](https://testcafe.io/documentation/402638/reference/configuration-file)
- [TestCafe Best Practices](https://testcafe.io/documentation/402834/guides/best-practices)
- [TestCafe Page Object Model](https://testcafe.io/documentation/402826/guides/concepts/page-model)
