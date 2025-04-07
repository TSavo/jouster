# Karma Test Runner

[Karma](https://karma-runner.github.io/) is a test runner that runs tests in real browsers. Jouster provides seamless integration with Karma, allowing you to track test failures and manage issues automatically.

## Installation

To use Karma with Jouster, you need to install Karma and a test framework:

```bash
npm install --save-dev karma karma-jasmine jasmine-core karma-chrome-launcher
```

You may also want to install additional reporters:

```bash
npm install --save-dev karma-json-reporter
```

## Configuration

You can configure the Karma test runner in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'karma',
  testRunnerOptions: {
    karma: {
      browsers: ['ChromeHeadless'], // Browsers to use
      singleRun: true, // Whether to run once and exit
      reporters: ['json'], // Reporters to use
      frameworks: ['jasmine'], // Test frameworks to use
      port: 9876, // Port to use
      autoWatch: false, // Whether to watch files for changes
      colors: true, // Whether to use colors in output
      logLevel: 'INFO', // Log level
      client: { // Client options
        clearContext: true,
        captureConsole: true,
        jasmine: {
          random: true,
          seed: null,
          timeoutInterval: 5000
        }
      },
      configPath: null, // Path to Karma configuration file
      files: [], // Files to include
      exclude: [], // Files to exclude
      preprocessors: {}, // Preprocessors to use
      plugins: [] // Plugins to use
    }
  }
};
```

## Command Line Options

When using the `jouster run-tests` command, you can specify Karma-specific options:

```bash
npx jouster run-tests --test-runner karma [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--karma-browsers <browsers>` | Comma-separated list of browsers to use |
| `--karma-single-run` | Run once and exit |
| `--karma-reporters <reporters>` | Comma-separated list of reporters to use |
| `--karma-frameworks <frameworks>` | Comma-separated list of frameworks to use |
| `--karma-port <port>` | Port to use |
| `--karma-auto-watch` | Watch files for changes |
| `--karma-colors` | Use colors in output |
| `--karma-log-level <level>` | Log level (OFF, ERROR, WARN, INFO, DEBUG) |
| `--karma-config-path <path>` | Path to Karma configuration file |
| `--karma-files <files>` | Comma-separated list of files to include |
| `--karma-exclude <files>` | Comma-separated list of files to exclude |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner karma
```

### With Specific Browsers

```bash
npx jouster run-tests --test-runner karma --karma-browsers "Chrome,Firefox"
```

### With Watch Mode

```bash
npx jouster run-tests --test-runner karma --karma-single-run false --karma-auto-watch
```

### With Specific Frameworks

```bash
npx jouster run-tests --test-runner karma --karma-frameworks "mocha,chai"
```

### With Specific Files

```bash
npx jouster run-tests --test-runner karma --karma-files "src/**/*.spec.js"
```

### With Configuration File

```bash
npx jouster run-tests --test-runner karma --karma-config-path "./karma.conf.js"
```

## Integration with Jouster

Jouster integrates with Karma by:

1. Running Karma tests with the specified configuration
2. Parsing Karma test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use Karma Configuration File

Instead of specifying all options on the command line, use a Karma configuration file:

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'src/**/*.js',
      'test/**/*.spec.js'
    ],
    exclude: [],
    preprocessors: {
      'src/**/*.js': ['coverage']
    },
    reporters: ['progress', 'coverage', 'json'],
    jsonReporter: {
      outputFile: 'karma-results.json',
      stdout: false
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcov', subdir: 'lcov' },
        { type: 'text-summary' }
      ]
    }
  });
};
```

Then reference it in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'karma',
  testRunnerOptions: {
    karma: {
      configPath: './karma.conf.js'
    }
  }
};
```

### 2. Use Multiple Browsers

Karma allows you to run tests in multiple browsers simultaneously:

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    // ... other configuration
    browsers: ['ChromeHeadless', 'FirefoxHeadless', 'Edge'],
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless']
      }
    }
  });
};
```

### 3. Use Preprocessors

Karma supports preprocessors for transforming files before testing:

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    // ... other configuration
    preprocessors: {
      'src/**/*.js': ['babel', 'coverage'],
      'src/**/*.ts': ['typescript'],
      'src/**/*.coffee': ['coffee']
    },
    babelPreprocessor: {
      options: {
        presets: ['@babel/preset-env'],
        sourceMap: 'inline'
      }
    },
    typescriptPreprocessor: {
      options: {
        sourceMap: true,
        target: 'ES5',
        module: 'commonjs'
      }
    }
  });
};
```

### 4. Use Multiple Reporters

Karma supports multiple reporters for different output formats:

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    // ... other configuration
    reporters: ['progress', 'coverage', 'junit', 'json'],
    junitReporter: {
      outputDir: 'reports/junit',
      outputFile: 'test-results.xml',
      useBrowserName: false
    },
    jsonReporter: {
      outputFile: 'reports/json/test-results.json',
      stdout: false
    },
    coverageReporter: {
      dir: 'reports/coverage',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'lcov', subdir: 'lcov' },
        { type: 'text-summary' }
      ]
    }
  });
};
```

### 5. Use Client Configuration

Karma allows you to configure the client-side behavior:

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    // ... other configuration
    client: {
      clearContext: false, // Leave Jasmine Spec Runner output visible in browser
      captureConsole: true, // Capture browser console output
      jasmine: {
        random: true, // Randomize test order
        seed: null, // Seed for random test order
        timeoutInterval: 5000 // Default timeout for tests
      },
      mocha: {
        reporter: 'html', // Mocha reporter
        ui: 'bdd', // Mocha UI
        timeout: 5000 // Mocha timeout
      },
      qunit: {
        showUI: true, // Show QUnit UI
        testTimeout: 5000 // QUnit timeout
      }
    }
  });
};
```

## Troubleshooting

### Tests Not Running

- Check that Karma is installed: `npm list karma`
- Check that the test files exist: `ls test`
- Check that the test files match the pattern: `karma start --list-files`
- Check that the browsers are available: `karma start --list-browsers`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list karma-json-reporter`
- Check that the reporter is configured correctly: `karma start --reporters json`
- Check that the output is being captured: `karma start --reporters json > results.json`

### Tests Running but Not Failing

- Check that assertions are being made: `karma start --log-level debug`
- Check that the test runner is configured to fail on assertion failures: `karma start --single-run`
- Check that the test runner is configured to exit with a non-zero code on failure: `karma start --single-run`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Karma Documentation](https://karma-runner.github.io/latest/index.html)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)
- [Karma Plugins](https://karma-runner.github.io/latest/dev/plugins.html)
- [Karma Reporters](https://karma-runner.github.io/latest/config/reporters.html)
- [Karma Browsers](https://karma-runner.github.io/latest/config/browsers.html)
- [Karma Preprocessors](https://karma-runner.github.io/latest/config/preprocessors.html)
