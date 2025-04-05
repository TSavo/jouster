# Basic Example

This example demonstrates how to use Jouster with Jest to track test failures.

## Project Structure

```
my-project/
├── node_modules/
├── src/
│   ├── math.js
│   └── __tests__/
│       └── math.test.js
├── jest.config.js
├── package.json
└── README.md
```

## Installation

```bash
# Install Jest and Jouster
npm install --save-dev jest jouster
```

## Configuration

### jest.config.js

```javascript
module.exports = {
  testEnvironment: 'node',
  reporters: [
    'default',
    ['jouster', {
      generateIssues: true,
      trackIssues: true,
      closeIssues: true,
      reopenIssues: true,
      databasePath: 'test-issue-mapping.json',
      defaultLabels: ['bug', 'test-failure']
    }]
  ]
};
```

### package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A simple project using Jouster",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "test:with-tracking": "jest"
  },
  "dependencies": {},
  "devDependencies": {
    "jest": "^29.0.0",
    "jouster": "^1.0.0"
  }
}
```

## Source Code

### src/math.js

```javascript
/**
 * Add two numbers
 * @param {number} a First number
 * @param {number} b Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
  return a + b;
}

/**
 * Subtract b from a
 * @param {number} a First number
 * @param {number} b Second number
 * @returns {number} Difference of a and b
 */
function subtract(a, b) {
  return a - b;
}

/**
 * Multiply two numbers
 * @param {number} a First number
 * @param {number} b Second number
 * @returns {number} Product of a and b
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Divide a by b
 * @param {number} a First number
 * @param {number} b Second number
 * @returns {number} Quotient of a and b
 */
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

module.exports = {
  add,
  subtract,
  multiply,
  divide
};
```

### src/__tests__/math.test.js

```javascript
const { add, subtract, multiply, divide } = require('../math');

describe('Math', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(add(-2, 3)).toBe(1);
      expect(add(2, -3)).toBe(-1);
      expect(add(-2, -3)).toBe(-5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('should handle negative numbers', () => {
      expect(subtract(-2, 3)).toBe(-5);
      expect(subtract(2, -3)).toBe(5);
      expect(subtract(-2, -3)).toBe(1);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it('should handle negative numbers', () => {
      expect(multiply(-2, 3)).toBe(-6);
      expect(multiply(2, -3)).toBe(-6);
      expect(multiply(-2, -3)).toBe(6);
    });
  });

  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      expect(divide(6, 3)).toBe(2);
    });

    it('should handle negative numbers', () => {
      expect(divide(-6, 3)).toBe(-2);
      expect(divide(6, -3)).toBe(-2);
      expect(divide(-6, -3)).toBe(2);
    });

    it('should throw an error when dividing by zero', () => {
      expect(() => divide(6, 0)).toThrow('Division by zero');
    });
  });
});
```

## Running the Example

```bash
# Run tests with Jouster
npm run test:with-tracking
```

## What Happens

1. Jest runs the tests
2. Jouster captures the test results
3. For any failing tests, Jouster creates GitHub issues with detailed information
4. For any passing tests that previously had issues, Jouster closes those issues
5. For any failing tests that previously had closed issues, Jouster reopens those issues

## Expected Output

If all tests pass:

```
PASS src/__tests__/math.test.js
  Math
    add
      ✓ should add two numbers correctly (2 ms)
      ✓ should handle negative numbers (1 ms)
    subtract
      ✓ should subtract two numbers correctly
      ✓ should handle negative numbers
    multiply
      ✓ should multiply two numbers correctly
      ✓ should handle negative numbers
    divide
      ✓ should divide two numbers correctly
      ✓ should handle negative numbers
      ✓ should throw an error when dividing by zero (1 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        1.5 s
Ran all test suites.
```

If a test fails:

```
FAIL src/__tests__/math.test.js
  Math
    add
      ✓ should add two numbers correctly (2 ms)
      ✓ should handle negative numbers (1 ms)
    subtract
      ✓ should subtract two numbers correctly
      ✓ should handle negative numbers
    multiply
      ✓ should multiply two numbers correctly
      ✓ should handle negative numbers
    divide
      ✓ should divide two numbers correctly
      ✓ should handle negative numbers
      ✕ should throw an error when dividing by zero (3 ms)

  ● Math › divide › should throw an error when dividing by zero

    expect(received).toThrow(expected)

    Expected substring: "Division by zero"
    Received function did not throw

      27 |
      28 |     it('should throw an error when dividing by zero', () => {
    > 29 |       expect(() => divide(6, 0)).toThrow('Division by zero');
         |                                  ^
      30 |     });
      31 |   });
      32 | });

      at Object.<anonymous> (src/__tests__/math.test.js:29:34)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 8 passed, 9 total
Snapshots:   0 total
Time:        1.5 s
Ran all test suites.

Creating GitHub issue for failing test: Math divide should throw an error when dividing by zero
GitHub issue created: #123
```

## Next Steps

- [Customize the templates](./custom-templates.md) to change the content of the GitHub issues
- [Create custom hooks](./custom-hooks.md) to extend Jouster's functionality
- [Create custom plugins](./custom-plugins.md) to integrate Jouster with other systems
