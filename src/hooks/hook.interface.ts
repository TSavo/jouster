import { TestResult } from '../types';

/**
 * Interface for template data hooks
 */
export interface TemplateDataHook {
  /**
   * Hook name
   */
  name: string;

  /**
   * Priority (lower numbers run first)
   */
  priority: number;

  /**
   * Process template data for issue creation
   *
   * @param data Template data
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Modified template data
   */
  processIssueData?: (data: Record<string, any>, test: TestResult, testFilePath: string) => Promise<Record<string, any>>;

  /**
   * Process template data for issue closing
   *
   * @param data Template data
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Modified template data
   */
  processCloseData?: (data: Record<string, any>, test: TestResult, testFilePath: string) => Promise<Record<string, any>>;

  /**
   * Process template data for issue reopening
   *
   * @param data Template data
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Modified template data
   */
  processReopenData?: (data: Record<string, any>, test: TestResult, testFilePath: string) => Promise<Record<string, any>>;
}
