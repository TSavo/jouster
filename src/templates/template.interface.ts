import { TestResult } from '../types';

/**
 * Interface for templates
 */
export interface Template {
  /**
   * Generate template content
   * 
   * @param testResult Test result
   * @param testFilePath Test file path
   * @param templateData Additional template data
   * @returns Generated content
   */
  generate(testResult: TestResult, testFilePath: string, templateData: Record<string, any>): string;
}
