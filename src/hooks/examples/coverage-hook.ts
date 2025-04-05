import { TemplateDataHook } from '../hook.interface';
import { TestResult } from '../../types';

/**
 * Example hook that adds coverage information to template data
 */
export class CoverageHook implements TemplateDataHook {
  /**
   * Hook name
   */
  public name = 'CoverageHook';

  /**
   * Priority (lower numbers run first)
   */
  public priority = 10;

  /**
   * Coverage data
   */
  private coverageData: Record<string, any> = {};

  /**
   * Constructor
   *
   * @param coverageFilePath Path to coverage file (optional)
   */
  constructor(coverageFilePath?: string) {
    // In a real implementation, this would load coverage data from a file
    // For this example, we'll just use some mock data
    this.coverageData = {
      'src/example.ts': {
        statements: 85,
        branches: 70,
        functions: 90,
        lines: 85
      },
      'src/another-example.ts': {
        statements: 95,
        branches: 80,
        functions: 100,
        lines: 95
      }
    };
  }

  /**
   * Process template data for issue creation
   *
   * @param data Template data
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Modified template data
   */
  public async processIssueData(data: Record<string, any>, test: TestResult, testFilePath: string): Promise<Record<string, any>> {
    // Create a copy of the data
    const newData = { ...data };

    // Add coverage information
    newData.coverage = this.getCoverageForFile(testFilePath);

    // Return the modified data
    return newData;
  }

  /**
   * Process template data for issue closing
   *
   * @param data Template data
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Modified template data
   */
  public async processCloseData(data: Record<string, any>, test: TestResult, testFilePath: string): Promise<Record<string, any>> {
    // Create a copy of the data
    const newData = { ...data };

    // Add coverage information
    newData.coverage = this.getCoverageForFile(testFilePath);

    // Return the modified data
    return newData;
  }

  /**
   * Process template data for issue reopening
   *
   * @param data Template data
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Modified template data
   */
  public async processReopenData(data: Record<string, any>, test: TestResult, testFilePath: string): Promise<Record<string, any>> {
    // Create a copy of the data
    const newData = { ...data };

    // Add coverage information
    newData.coverage = this.getCoverageForFile(testFilePath);

    // Return the modified data
    return newData;
  }

  /**
   * Get coverage data for a file
   *
   * @param filePath File path
   * @returns Coverage data
   */
  private getCoverageForFile(filePath: string): any {
    // In a real implementation, this would look up coverage data for the file
    // For this example, we'll just return some mock data
    const fileKey = Object.keys(this.coverageData).find(key => filePath.includes(key));

    if (fileKey) {
      return this.coverageData[fileKey];
    }

    return {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    };
  }
}
