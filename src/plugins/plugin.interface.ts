import { TestResult } from '../types';
import { IssueTrackerConfig } from '../config';

/**
 * Interface for issue tracker plugins
 */
export interface IssueTrackerPlugin {
  /**
   * Plugin name
   */
  name: string;
  
  /**
   * Initialize the plugin
   * 
   * @param config Configuration
   */
  init?: (config: IssueTrackerConfig) => void;
  
  /**
   * Called before creating an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   */
  beforeCreateIssue?: (test: TestResult, filePath: string) => Promise<void>;
  
  /**
   * Called after creating an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  afterCreateIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
  
  /**
   * Called before closing an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  beforeCloseIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
  
  /**
   * Called after closing an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  afterCloseIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
  
  /**
   * Called before reopening an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  beforeReopenIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
  
  /**
   * Called after reopening an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  afterReopenIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
}
