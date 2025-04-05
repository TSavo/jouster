# Jouster Setup Wizard

The Jouster Setup Wizard is a magical tool that scans your project, detects your Jest configuration, and sets up Jouster with sensible defaults. It's designed to make getting started with Jouster as easy as possible.

## Quick Start

```bash
# Run the wizard in non-interactive mode
npx jouster-setup

# Run the wizard in interactive mode
npx jouster-setup --interactive
```

## What the Wizard Does

The wizard performs the following tasks:

1. **Scans Your Environment**:
   - Detects existing Jest configuration
   - Checks for GitHub CLI or API key
   - Identifies test patterns and structure
   - Locates your package.json

2. **Configures Jouster**:
   - Creates or updates your Jest configuration
   - Adds Jouster as a reporter
   - Configures Jouster with sensible defaults based on your environment
   - Adds npm scripts to your package.json

3. **Sets Up Templates**:
   - Creates a templates directory if it doesn't exist

## Modes

The wizard can run in two modes:

### Non-Interactive Mode

In non-interactive mode, the wizard makes reasonable guesses and sets up Jouster with minimal prompts. This is the default mode.

```bash
npx jouster-setup
```

### Interactive Mode

In interactive mode, the wizard guides you through the setup process and lets you approve or specify decisions along the way.

```bash
npx jouster-setup --interactive
```

## Configuration

The wizard configures Jouster based on your environment:

### GitHub Integration

- If the GitHub CLI is detected, Jouster is configured to use it
- If a GitHub token is detected (via environment variables), Jouster is configured to use the REST API
- If neither is detected, Jouster is configured to use file-based bug tracking

### Jest Configuration

- If an existing Jest configuration is found, it's updated to include Jouster
- If no Jest configuration is found, a new one is created
- In interactive mode, you can choose between JavaScript and TypeScript for the configuration

### Package.json

- A `test:jouster` script is added to your package.json
- Jouster is added as a dev dependency

## Command Line Options

```
Usage: npx jouster-setup [options]

Options:
  --interactive, -i  Run in interactive mode
  --help, -h         Show this help message
```

## Examples

### Basic Usage

```bash
# Run the wizard in non-interactive mode
npx jouster-setup
```

### Interactive Mode

```bash
# Run the wizard in interactive mode
npx jouster-setup --interactive
```

### Help

```bash
# Show help message
npx jouster-setup --help
```

## After Setup

After the wizard completes, you can run your tests with Jouster:

```bash
# Run tests with Jouster
npm run test:jouster
```

This will run your tests and:
1. Create GitHub issues for failing tests
2. Close issues for passing tests
3. Reopen issues for tests that start failing again

## Troubleshooting

If you encounter any issues with the wizard, try the following:

- Run the wizard in interactive mode for more control
- Check that you have the necessary permissions to modify files
- Ensure that your Jest configuration is valid
- Verify that your GitHub token has the necessary permissions

If you continue to have issues, please [open an issue](https://github.com/TSavo/jouster/issues) on GitHub.
