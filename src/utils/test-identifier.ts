import crypto from 'crypto';

/**
 * Generate a unique identifier for a test
 * 
 * @param testFilePath Test file path
 * @param fullName Full test name
 * @returns Test identifier
 */
export function generateTestIdentifier(testFilePath: string, fullName: string): string {
  // Normalize file path to use forward slashes
  const normalizedPath = testFilePath.replace(/\\/g, '/');
  
  // Create a unique identifier by combining the file path and test name
  const identifier = `${normalizedPath}:${fullName}`;
  
  // Hash the identifier to create a fixed-length string
  return crypto.createHash('md5').update(identifier).digest('hex');
}

/**
 * Parse a test identifier into its components
 * 
 * @param testIdentifier Test identifier
 * @returns Test components
 */
export function parseTestIdentifier(testIdentifier: string): { filePath: string, testName: string } {
  // Since we're using a hash, we can't parse the original values
  // This is just a placeholder for compatibility
  return {
    filePath: 'unknown',
    testName: 'unknown'
  };
}

/**
 * Get a human-readable description of a test
 * 
 * @param fullName Full test name
 * @returns Test description
 */
export function getTestDescription(fullName: string): string {
  // Split the full name into parts
  const parts = fullName.split(' › ');
  
  // If there's only one part, return it
  if (parts.length === 1) {
    return parts[0];
  }
  
  // Otherwise, return the last part (the test name)
  return parts[parts.length - 1];
}
