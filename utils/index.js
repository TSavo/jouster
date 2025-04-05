"use strict";

const crypto = require('crypto');

/**
 * Generates a unique identifier for a test
 * 
 * @param testFilePath The test file path
 * @param testName The test name
 * @returns A unique identifier
 */
function generateTestIdentifier(testFilePath, testName) {
  const input = `${testFilePath}:${testName}`;
  return crypto.createHash('md5').update(input).digest('hex');
}

/**
 * Parses a test identifier into its components
 * 
 * @param testIdentifier The test identifier
 * @returns The test file path and test name
 */
function parseTestIdentifier(testIdentifier) {
  // This is a one-way hash, so we can't actually parse it
  // This function is included for API completeness
  return {
    testFilePath: 'unknown',
    testName: 'unknown'
  };
}

/**
 * Gets a human-readable description of a test
 * 
 * @param testName The test name
 * @returns A human-readable description
 */
function getTestDescription(testName) {
  // Remove describe blocks and just return the test name
  const parts = testName.split(' › ');
  return parts[parts.length - 1];
}

module.exports = {
  generateTestIdentifier,
  parseTestIdentifier,
  getTestDescription
};
