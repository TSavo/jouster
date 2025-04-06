import { TestIdentifier, TestResult } from '../types';
import path from 'path';

/**
 * Options for generating a test identifier
 */
export interface GenerateTestIdentifierOptions {
  /** The current working directory (defaults to process.cwd()) */
  cwd?: string;
}

/**
 * Normalizes a file path to use forward slashes
 * 
 * @param filePath The file path to normalize
 * @returns The normalized file path
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Gets the relative path from the project root
 * 
 * @param filePath The absolute file path
 * @param cwd The current working directory (defaults to process.cwd())
 * @returns The relative path
 */
export function getRelativePath(filePath: string, cwd: string = process.cwd()): string {
  const normalizedPath = normalizePath(filePath);
  return normalizePath(path.relative(cwd, normalizedPath));
}

/**
 * Extracts the suite name and test name from a full test name
 * 
 * @param fullName The full test name (e.g. "Suite > Nested Suite > Test Name")
 * @returns An object with the suite name and test name
 */
export function extractTestNameParts(fullName: string): { suiteName: string; testName: string } {
  const parts = fullName.split(' > ');
  const testName = parts.pop() || 'Unknown Test';
  const suiteName = parts.join(' > ') || 'Default Suite';
  
  return { suiteName, testName };
}

/**
 * Generates a unique identifier for a test from a file path and full name
 * 
 * @param filePath The test file path
 * @param fullName The full test name
 * @param options Additional options
 * @returns A unique identifier string
 */
export function generateIdentifierFromPath(
  filePath: string, 
  fullName: string,
  options: GenerateTestIdentifierOptions = {}
): TestIdentifier {
  if (!fullName) {
    throw new Error('Full name is required when generating an identifier from a file path');
  }

  // Get the relative path from the project root
  const relativePath = getRelativePath(filePath, options.cwd);
  
  // Extract the suite name and test name
  const { suiteName, testName } = extractTestNameParts(fullName);
  
  // Combine file path, suite name, and test name
  return `${relativePath}:${suiteName}:${testName}`;
}

/**
 * Generates a unique identifier for a test from a TestResult object
 * 
 * @param testResult The test result object
 * @param options Additional options
 * @returns A unique identifier string
 */
export function generateIdentifierFromTestResult(
  testResult: TestResult,
  options: GenerateTestIdentifierOptions = {}
): TestIdentifier {
  if (!testResult.testFilePath) {
    throw new Error('Test result does not have a testFilePath');
  }

  // Get the relative path from the project root
  const relativePath = getRelativePath(testResult.testFilePath, options.cwd);
  
  // Get the suite name and test name
  const suiteName = testResult.testSuiteName || 
                   (testResult.ancestorTitles?.join(' > ')) || 
                   'Default Suite';
  const testName = testResult.testName || testResult.title || 'Unknown Test';
  
  // Combine file path, suite name, and test name
  return `${relativePath}:${suiteName}:${testName}`;
}

/**
 * Generates a unique identifier for a test
 *
 * @param testResult The test result object or test file path
 * @param fullName Optional full name of the test (used when testResult is a string)
 * @param options Additional options
 * @returns A unique identifier string
 */
export function generateTestIdentifier(
  testResult: TestResult | string, 
  fullName?: string,
  options: GenerateTestIdentifierOptions = {}
): TestIdentifier {
  // Handle string input (file path)
  if (typeof testResult === 'string') {
    return generateIdentifierFromPath(testResult, fullName as string, options);
  }
  
  // Handle TestResult object
  return generateIdentifierFromTestResult(testResult, options);
}

/**
 * Parses a test identifier back into its components
 *
 * @param identifier The test identifier string
 * @returns An object with the file path, suite name, and test name
 */
export function parseTestIdentifier(identifier: TestIdentifier): {
  filePath: string;
  suiteName: string;
  testName: string;
} {
  const parts = identifier.split(':');
  
  // Handle the case where the file path might contain colons
  if (parts.length < 3) {
    throw new Error(`Invalid test identifier: ${identifier}`);
  }
  
  const testName = parts.pop() as string;
  const suiteName = parts.pop() as string;
  const filePath = parts.join(':');
  
  return {
    filePath,
    suiteName,
    testName
  };
}

/**
 * Creates a human-readable description of a test
 *
 * @param identifier The test identifier
 * @returns A human-readable string
 */
export function getTestDescription(identifier: TestIdentifier): string {
  const { filePath, suiteName, testName } = parseTestIdentifier(identifier);
  return `"${testName}" in ${suiteName} (${filePath})`;
}
