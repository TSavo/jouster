#!/usr/bin/env node

import path from 'path';
import { SetupWizard } from './setup-wizard';

/**
 * Main CLI entry point
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const interactive = args.includes('--interactive') || args.includes('-i');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    showHelp();
    return;
  }
  
  // Get project root (current working directory)
  const projectRoot = process.cwd();
  
  // Create and run the setup wizard
  const wizard = new SetupWizard(projectRoot, interactive);
  await wizard.run();
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Jouster Setup Wizard

Usage: npx jouster-setup [options]

Options:
  --interactive, -i  Run in interactive mode
  --help, -h         Show this help message

Description:
  This wizard scans your project and sets up Jouster with sensible defaults.
  It detects your Jest configuration, GitHub environment, and test patterns.
  
  In non-interactive mode, it makes reasonable guesses and sets up Jouster
  with minimal prompts. In interactive mode, it guides you through the setup
  process and lets you approve or specify decisions along the way.
  
Examples:
  npx jouster-setup              Run in non-interactive mode
  npx jouster-setup --interactive Run in interactive mode
  `);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
