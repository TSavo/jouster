# Playwright Test Runner

[Playwright](https://playwright.dev/) is a framework for Web Testing and Automation. Jouster provides seamless integration with Playwright, allowing you to track test failures and manage issues automatically.

## Installation

To use Playwright with Jouster, you need to install Playwright:

```bash
npm install --save-dev @playwright/test
```

You may also want to install the browsers:

```bash
npx playwright install
```

## Configuration

You can configure the Playwright test runner in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'playwright',
  testRunnerOptions: {
    playwright: {
      browser: 'chromium', // Browser to use (chromium, firefox, webkit)
      headed: false, // Whether to run in headed mode
      workers: 1, // Number of workers
      reporters: ['json'], // Reporters to use
      timeout: 30000, // Timeout for tests in milliseconds
      testDir: './tests', // Directory containing tests
      project: null, // Project to run
      grep: null, // Pattern to match test titles
      grepInvert: null, // Pattern to exclude test titles
      updateSnapshots: false, // Whether to update snapshots
      debug: false, // Whether to run in debug mode
      quiet: false, // Whether to suppress output
      shard: null, // Shard to run in format "current/total"
      configPath: null, // Path to Playwright configuration file
      retries: 0, // Number of retries for failed tests
      reporter: null, // Reporter to use
      reporterOptions: {} // Options for the reporter
    }
  }
};
```

## Command Line Options

When using the `jouster run-tests` command, you can specify Playwright-specific options:

```bash
npx jouster run-tests --test-runner playwright [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--playwright-browser <browser>` | Browser to use (chromium, firefox, webkit) |
| `--playwright-headed` | Run in headed mode |
| `--playwright-workers <workers>` | Number of workers |
| `--playwright-reporters <reporters>` | Comma-separated list of reporters to use |
| `--playwright-timeout <timeout>` | Timeout for tests in milliseconds |
| `--playwright-test-dir <dir>` | Directory containing tests |
| `--playwright-project <project>` | Project to run |
| `--playwright-grep <pattern>` | Pattern to match test titles |
| `--playwright-grep-invert <pattern>` | Pattern to exclude test titles |
| `--playwright-update-snapshots` | Update snapshots |
| `--playwright-debug` | Run in debug mode |
| `--playwright-quiet` | Suppress output |
| `--playwright-shard <shard>` | Shard to run in format "current/total" |
| `--playwright-config <path>` | Path to Playwright configuration file |
| `--playwright-retries <retries>` | Number of retries for failed tests |
| `--playwright-reporter <reporter>` | Reporter to use |
| `--playwright-reporter-options <options>` | Options for the reporter |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner playwright
```

### With Specific Browser

```bash
npx jouster run-tests --test-runner playwright --playwright-browser firefox
```

### With Headed Mode

```bash
npx jouster run-tests --test-runner playwright --playwright-headed
```

### With Multiple Workers

```bash
npx jouster run-tests --test-runner playwright --playwright-workers 4
```

### With Specific Project

```bash
npx jouster run-tests --test-runner playwright --playwright-project desktop
```

### With Grep

```bash
npx jouster run-tests --test-runner playwright --playwright-grep "login"
```

### With Debug Mode

```bash
npx jouster run-tests --test-runner playwright --playwright-debug
```

## Integration with Jouster

Jouster integrates with Playwright by:

1. Running Playwright tests with the specified configuration
2. Parsing Playwright test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use Playwright Configuration File

Instead of specifying all options on the command line, use a Playwright configuration file:

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium'
      }
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox'
      }
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit'
      }
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        ...devices['Pixel 5']
      }
    },
    {
      name: 'mobile-safari',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 12']
      }
    }
  ]
};
```

Then reference it in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'playwright',
  testRunnerOptions: {
    playwright: {
      configPath: './playwright.config.js'
    }
  }
};
```

### 2. Use Page Object Model

Playwright works well with the Page Object Model pattern:

```javascript
// tests/pages/login.page.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// tests/login.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Login', () => {
  test('should log in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });
});
```

### 3. Use Fixtures

Playwright provides fixtures for test setup and teardown:

```javascript
// tests/fixtures.js
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login.page';

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    await use(page);
  }
});

// tests/dashboard.spec.js
import { test, expect } from './fixtures';

test('should display user information', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.locator('h1')).toContainText('Welcome');
  await expect(authenticatedPage.locator('.user-email')).toContainText('user@example.com');
});
```

### 4. Use API Testing

Playwright supports API testing:

```javascript
import { test, expect } from '@playwright/test';

test('API should return user data', async ({ request }) => {
  const response = await request.get('/api/users/1');
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.name).toBe('John Doe');
  expect(data.email).toBe('john@example.com');
});
```

### 5. Use Visual Comparisons

Playwright supports visual comparisons:

```javascript
import { test, expect } from '@playwright/test';

test('page should match snapshot', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

## Troubleshooting

### Tests Not Running

- Check that Playwright is installed: `npm list @playwright/test`
- Check that the test files exist: `ls tests`
- Check that the test files match the pattern: `npx playwright test --list`
- Check that the Playwright configuration is correct: `npx playwright test --config=playwright.config.js`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list playwright-html-reporter`
- Check that the reporter is configured correctly: `npx playwright test --config=playwright.config.js`
- Check that the output is being captured: `npx playwright test --reporter=json > results.json`

### Tests Running but Not Failing

- Check that assertions are being made: `npx playwright test --debug`
- Check that the test runner is configured to fail on assertion failures: `npx playwright test --retries=0`
- Check that the test runner is configured to exit with a non-zero code on failure: `npx playwright test --exit`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright CLI Options](https://playwright.dev/docs/test-cli)
- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Page Object Model](https://playwright.dev/docs/pom)
