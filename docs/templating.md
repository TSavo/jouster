# Templating

Jouster uses Handlebars templates to generate rich, detailed content for GitHub issues and comments. This guide explains how to customize these templates to suit your needs.

## Template Overview

Jouster uses three main templates:

1. **Issue Template**: Used when creating a new GitHub issue for a failing test.
2. **Close Comment Template**: Used when closing a GitHub issue for a passing test.
3. **Reopen Comment Template**: Used when reopening a GitHub issue for a test that is failing again.

These templates are located in the `templates` directory:

- `issue-template.hbs`: Template for creating new issues
- `close-comment-template.hbs`: Template for comments when closing issues
- `reopen-comment-template.hbs`: Template for comments when reopening issues

## Available Variables

The templates have access to a rich set of variables that provide information about the test, the failure, and the environment.

### Test Information

- `{{test.name}}`: The name of the test
- `{{test.fullName}}`: The full name of the test, including the suite name
- `{{test.filePath}}`: The path to the test file
- `{{test.duration}}`: The duration of the test in milliseconds
- `{{test.status}}`: The status of the test (failed, passed)
- `{{test.suite}}`: The name of the test suite

### Error Information

- `{{error.message}}`: The error message
- `{{error.stack}}`: The error stack trace
- `{{error.matcherResult}}`: The result of the Jest matcher
- `{{error.matcherResult.actual}}`: The actual value
- `{{error.matcherResult.expected}}`: The expected value
- `{{error.matcherResult.message}}`: The matcher message
- `{{error.matcherResult.pass}}`: Whether the matcher passed

### Git Information

- `{{git.branch}}`: The current git branch
- `{{git.commit}}`: The current git commit
- `{{git.author}}`: The author of the current git commit
- `{{git.email}}`: The email of the author of the current git commit
- `{{git.date}}`: The date of the current git commit
- `{{git.message}}`: The message of the current git commit

### Environment Information

- `{{env.nodeVersion}}`: The Node.js version
- `{{env.os}}`: The operating system
- `{{env.platform}}`: The platform
- `{{env.arch}}`: The architecture
- `{{env.ci}}`: Whether the test is running in a CI environment
- `{{env.ciName}}`: The name of the CI environment

### Issue Information

- `{{issue.number}}`: The GitHub issue number
- `{{issue.url}}`: The URL of the GitHub issue
- `{{issue.status}}`: The status of the issue (open, closed)
- `{{issue.lastFailure}}`: The date of the last failure
- `{{issue.lastUpdate}}`: The date of the last update

### Timing Information

- `{{timing.firstFailure}}`: The date of the first failure
- `{{timing.lastFailure}}`: The date of the last failure
- `{{timing.failureDuration}}`: The duration of the failure
- `{{timing.passingDuration}}`: The duration of the passing period (for reopened issues)

### Code Snippets

- `{{code.testFile}}`: The content of the test file
- `{{code.testFileWithLineNumbers}}`: The content of the test file with line numbers
- `{{code.testFunction}}`: The content of the test function
- `{{code.testFunctionWithLineNumbers}}`: The content of the test function with line numbers
- `{{code.errorLocation}}`: The location of the error in the code
- `{{code.errorLocationWithLineNumbers}}`: The location of the error in the code with line numbers

### Reproduction Information

- `{{reproduction.command}}`: The command to run the test
- `{{reproduction.steps}}`: Steps to reproduce the failure
- `{{reproduction.environment}}`: Environment setup instructions

### Analysis Information

- `{{analysis.possibleCauses}}`: Possible causes of the failure
- `{{analysis.suggestions}}`: Suggestions for fixing the failure
- `{{analysis.relatedTests}}`: Tests related to the failing test
- `{{analysis.history}}`: History of the test (previous failures, fixes)

## Customizing Templates

You can customize the templates by creating your own versions in a custom template directory and specifying that directory in the configuration:

```javascript
// In your Jest configuration
reporters: [
  'default',
  ['jouster', {
    templateDir: './custom-templates'
  }]
]
```

Or using an environment variable:

```bash
TEMPLATE_DIR=./custom-templates npm run test:with-tracking
```

### Template Helpers

Jouster provides several Handlebars helpers that you can use in your templates:

- `{{formatDate date}}`: Formats a date
- `{{formatDuration duration}}`: Formats a duration
- `{{formatCode code}}`: Formats code with syntax highlighting
- `{{formatStack stack}}`: Formats a stack trace
- `{{formatJson json}}`: Formats JSON
- `{{formatDiff diff}}`: Formats a diff
- `{{formatError error}}`: Formats an error
- `{{formatList list}}`: Formats a list
- `{{formatLink url text}}`: Formats a link
- `{{formatImage url alt}}`: Formats an image
- `{{formatTable table}}`: Formats a table
- `{{formatHeading text level}}`: Formats a heading
- `{{formatBold text}}`: Formats text as bold
- `{{formatItalic text}}`: Formats text as italic
- `{{formatStrikethrough text}}`: Formats text as strikethrough
- `{{formatQuote text}}`: Formats text as a quote
- `{{formatCheckbox checked}}`: Formats a checkbox
- `{{formatHorizontalRule}}`: Formats a horizontal rule
- `{{formatLineBreak}}`: Formats a line break
- `{{formatParagraph text}}`: Formats a paragraph
- `{{formatCodeBlock code language}}`: Formats a code block with syntax highlighting
- `{{formatInlineCode code}}`: Formats inline code
- `{{formatUnorderedList items}}`: Formats an unordered list
- `{{formatOrderedList items}}`: Formats an ordered list
- `{{formatDefinitionList items}}`: Formats a definition list
- `{{formatTaskList items}}`: Formats a task list
- `{{formatCollapsible summary details}}`: Formats a collapsible section
- `{{formatDetails summary details}}`: Formats a details section
- `{{formatSummary text}}`: Formats a summary
- `{{formatFootnote text}}`: Formats a footnote
- `{{formatAbbreviation text title}}`: Formats an abbreviation
- `{{formatMention username}}`: Formats a mention
- `{{formatEmoji name}}`: Formats an emoji
- `{{formatBadge label message color}}`: Formats a badge
- `{{formatAlert text type}}`: Formats an alert
- `{{formatKeyboard keys}}`: Formats keyboard keys
- `{{formatMath formula}}`: Formats a math formula
- `{{formatDiagram diagram}}`: Formats a diagram
- `{{formatToc}}`: Formats a table of contents
- `{{formatAnchor name}}`: Formats an anchor
- `{{formatVariable name}}`: Formats a variable
- `{{formatFunction name}}`: Formats a function
- `{{formatClass name}}`: Formats a class
- `{{formatInterface name}}`: Formats an interface
- `{{formatEnum name}}`: Formats an enum
- `{{formatType name}}`: Formats a type
- `{{formatNamespace name}}`: Formats a namespace
- `{{formatModule name}}`: Formats a module
- `{{formatPackage name}}`: Formats a package
- `{{formatFile name}}`: Formats a file
- `{{formatDirectory name}}`: Formats a directory
- `{{formatPath path}}`: Formats a path
- `{{formatUrl url}}`: Formats a URL
- `{{formatEmail email}}`: Formats an email
- `{{formatPhone phone}}`: Formats a phone number
- `{{formatAddress address}}`: Formats an address
- `{{formatPerson name}}`: Formats a person's name
- `{{formatOrganization name}}`: Formats an organization's name
- `{{formatDate date}}`: Formats a date
- `{{formatTime time}}`: Formats a time
- `{{formatDateTime dateTime}}`: Formats a date and time
- `{{formatDuration duration}}`: Formats a duration
- `{{formatCurrency amount currency}}`: Formats a currency amount
- `{{formatPercentage percentage}}`: Formats a percentage
- `{{formatNumber number}}`: Formats a number
- `{{formatBoolean boolean}}`: Formats a boolean
- `{{formatNull}}`: Formats null
- `{{formatUndefined}}`: Formats undefined
- `{{formatNaN}}`: Formats NaN
- `{{formatInfinity}}`: Formats infinity
- `{{formatRegExp regexp}}`: Formats a regular expression
- `{{formatSymbol symbol}}`: Formats a symbol
- `{{formatBigInt bigInt}}`: Formats a BigInt
- `{{formatSet set}}`: Formats a Set
- `{{formatMap map}}`: Formats a Map
- `{{formatWeakSet weakSet}}`: Formats a WeakSet
- `{{formatWeakMap weakMap}}`: Formats a WeakMap
- `{{formatArrayBuffer arrayBuffer}}`: Formats an ArrayBuffer
- `{{formatDataView dataView}}`: Formats a DataView
- `{{formatTypedArray typedArray}}`: Formats a TypedArray
- `{{formatPromise promise}}`: Formats a Promise
- `{{formatProxy proxy}}`: Formats a Proxy
- `{{formatReflect reflect}}`: Formats a Reflect
- `{{formatIntl intl}}`: Formats an Intl object
- `{{formatError error}}`: Formats an Error
- `{{formatDate date}}`: Formats a Date
- `{{formatMath math}}`: Formats a Math object
- `{{formatJSON json}}`: Formats a JSON object
- `{{formatObject object}}`: Formats an Object
- `{{formatArray array}}`: Formats an Array
- `{{formatFunction function}}`: Formats a Function
- `{{formatString string}}`: Formats a String
- `{{formatNumber number}}`: Formats a Number
- `{{formatBoolean boolean}}`: Formats a Boolean
- `{{formatSymbol symbol}}`: Formats a Symbol
- `{{formatBigInt bigInt}}`: Formats a BigInt
- `{{formatUndefined}}`: Formats undefined
- `{{formatNull}}`: Formats null
- `{{formatNaN}}`: Formats NaN
- `{{formatInfinity}}`: Formats Infinity

## Template Examples

### Issue Template Example

```handlebars
# Test Failure: {{test.name}}

## Test Information
- **File**: {{test.filePath}}
- **Test**: {{test.fullName}}
- **Duration**: {{formatDuration test.duration}}
- **Status**: {{test.status}}

## Error Information
### Error Message
```
{{error.message}}
```

### Stack Trace
```
{{error.stack}}
```

{{#if error.matcherResult}}
### Matcher Result
- **Expected**: {{error.matcherResult.expected}}
- **Actual**: {{error.matcherResult.actual}}
- **Message**: {{error.matcherResult.message}}
{{/if}}

## Git Information
- **Branch**: {{git.branch}}
- **Commit**: {{git.commit}}
- **Author**: {{git.author}} ({{git.email}})
- **Date**: {{formatDate git.date}}
- **Message**: {{git.message}}

## Environment Information
- **Node Version**: {{env.nodeVersion}}
- **OS**: {{env.os}}
- **Platform**: {{env.platform}}
- **Architecture**: {{env.arch}}
- **CI**: {{env.ci}}
{{#if env.ciName}}
- **CI Name**: {{env.ciName}}
{{/if}}

## Code Snippets
### Test File
```typescript
{{code.testFileWithLineNumbers}}
```

### Test Function
```typescript
{{code.testFunctionWithLineNumbers}}
```

### Error Location
```typescript
{{code.errorLocationWithLineNumbers}}
```

## Reproduction
### Command
```bash
{{reproduction.command}}
```

### Steps
1. {{reproduction.steps}}

### Environment Setup
```bash
{{reproduction.environment}}
```

## Analysis
### Possible Causes
{{analysis.possibleCauses}}

### Suggestions
{{analysis.suggestions}}

### Related Tests
{{analysis.relatedTests}}

### History
{{analysis.history}}
```

### Close Comment Template Example

```handlebars
# Test Now Passing: {{test.name}}

## Test Information
- **File**: {{test.filePath}}
- **Test**: {{test.fullName}}
- **Duration**: {{formatDuration test.duration}}
- **Status**: {{test.status}}

## Timing Information
- **First Failure**: {{formatDate timing.firstFailure}}
- **Last Failure**: {{formatDate timing.lastFailure}}
- **Failure Duration**: {{formatDuration timing.failureDuration}}

## Git Information
- **Branch**: {{git.branch}}
- **Commit**: {{git.commit}}
- **Author**: {{git.author}} ({{git.email}})
- **Date**: {{formatDate git.date}}
- **Message**: {{git.message}}

## Verification
### Command
```bash
{{reproduction.command}}
```

### Steps
1. {{reproduction.steps}}
```

### Reopen Comment Template Example

```handlebars
# Test Failing Again: {{test.name}}

## Test Information
- **File**: {{test.filePath}}
- **Test**: {{test.fullName}}
- **Duration**: {{formatDuration test.duration}}
- **Status**: {{test.status}}

## Error Information
### Error Message
```
{{error.message}}
```

### Stack Trace
```
{{error.stack}}
```

{{#if error.matcherResult}}
### Matcher Result
- **Expected**: {{error.matcherResult.expected}}
- **Actual**: {{error.matcherResult.actual}}
- **Message**: {{error.matcherResult.message}}
{{/if}}

## Timing Information
- **First Failure**: {{formatDate timing.firstFailure}}
- **Last Failure**: {{formatDate timing.lastFailure}}
- **Passing Duration**: {{formatDuration timing.passingDuration}}

## Git Information
- **Branch**: {{git.branch}}
- **Commit**: {{git.commit}}
- **Author**: {{git.author}} ({{git.email}})
- **Date**: {{formatDate git.date}}
- **Message**: {{git.message}}

## Code Snippets
### Test File
```typescript
{{code.testFileWithLineNumbers}}
```

### Test Function
```typescript
{{code.testFunctionWithLineNumbers}}
```

### Error Location
```typescript
{{code.errorLocationWithLineNumbers}}
```

## Reproduction
### Command
```bash
{{reproduction.command}}
```

### Steps
1. {{reproduction.steps}}

### Environment Setup
```bash
{{reproduction.environment}}
```

## Analysis
### Possible Causes
{{analysis.possibleCauses}}

### Suggestions
{{analysis.suggestions}}

### Related Tests
{{analysis.relatedTests}}

### History
{{analysis.history}}
```

## Next Steps

Now that you know how to customize templates, you might want to:

- Extend Jouster with the [Advanced Features Guide](./advanced-features.md)
- Learn about the [API Reference](./api-reference.md)
- Check out the [Examples](./examples/README.md)
