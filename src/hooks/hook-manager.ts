import { TemplateDataHook } from './hook.interface';
import { TestResult } from '../types';

/**
 * Hook manager for template data processing
 */
export class HookManager {
  private hooks: TemplateDataHook[];

  /**
   * Creates a new hook manager
   *
   * @param hooks Hooks
   */
  constructor(hooks: TemplateDataHook[] = []) {
    this.hooks = hooks;
    // Sort hooks by priority
    this.sortHooks();
  }

  /**
   * Register a hook
   *
   * @param hook Hook
   */
  public registerHook(hook: TemplateDataHook): void {
    this.hooks.push(hook);
    // Re-sort hooks by priority
    this.sortHooks();
  }

  /**
   * Sort hooks by priority
   */
  private sortHooks(): void {
    this.hooks.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get all registered hooks
   *
   * @returns Array of hooks
   */
  public getHooks(): TemplateDataHook[] {
    return [...this.hooks];
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
    let processedData = { ...data };

    for (const hook of this.hooks) {
      if (hook.processIssueData) {
        processedData = await hook.processIssueData(processedData, test, testFilePath);
      }
    }

    return processedData;
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
    let processedData = { ...data };

    for (const hook of this.hooks) {
      if (hook.processCloseData) {
        processedData = await hook.processCloseData(processedData, test, testFilePath);
      }
    }

    return processedData;
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
    let processedData = { ...data };

    for (const hook of this.hooks) {
      if (hook.processReopenData) {
        processedData = await hook.processReopenData(processedData, test, testFilePath);
      }
    }

    return processedData;
  }
}
