/**
 * Utility functions for error handling
 */
export class ErrorUtils {
  /**
   * Detects the type of error from an error message
   * 
   * @param errorMessage The error message
   * @returns The error type
   */
  public static detectErrorType(errorMessage: string): string {
    if (!errorMessage) {
      return 'Unknown';
    }

    if (errorMessage.includes('expect(')) {
      return 'Assertion Error';
    } else if (errorMessage.includes('TypeError:')) {
      return 'Type Error';
    } else if (errorMessage.includes('ReferenceError:')) {
      return 'Reference Error';
    } else {
      return errorMessage.split('\n')[0].trim();
    }
  }
}
