import { TestIdentifier, TestResult } from '../types';
import path from 'path';

/**
 * Generates a unique identifier for a test
 * Format: normalized/path/to/file.test.ts:TestSuiteName:testName
 *
 * @param testResult The test result object
 * @returns A unique identifier string
 */
export function generateTestIdentifier(testResult: TestResult): TestIdentifier {
  // Normalize the file path to use forward slashes
  if (!testResult.testFilePath) {
    throw new Error('Test result does not have a testFilePath');
  }

  const normalizedPath = testResult.testFilePath.replace(/\\/g, '/');

  // Get the relative path from the project root
  const projectRoot = process.cwd();
  const relativePath = path.relative(projectRoot, normalizedPath).replace(/\\/g, '/');

  // Combine file path, suite name, and test name
  return `${relativePath}:${testResult.testSuiteName}:${testResult.testName}`;
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
