import { jest } from '@jest/globals';
import { HookManager } from '../../hooks/hook-manager';
import { TemplateDataHook } from '../../hooks/hook.interface';
import { TestResult } from '../../types';

describe('HookManager', () => {
  let hookManager: HookManager;
  let mockHook1: TemplateDataHook;
  let mockHook2: TemplateDataHook;

  const mockTest: TestResult = {
    ancestorTitles: ['Test Suite'],
    duration: 100,
    failureMessages: ['Test failed'],
    fullName: 'Test Suite › Test Name',
    location: '',
    numPassingAsserts: 0,
    status: 'failed',
    title: 'Test Name'
  };

  beforeEach(() => {
    // Create mock hooks
    mockHook1 = {
      name: 'MockHook1',
      priority: 10,
      processIssueData: jest.fn().mockImplementation(async (data) => {
        const newData = Object.assign({}, data) as Record<string, any>;
        newData.hook1Added = true;
        return newData;
      }) as any,
      processCloseData: jest.fn().mockImplementation(async (data) => {
        const newData = Object.assign({}, data) as Record<string, any>;
        newData.hook1Added = true;
        return newData;
      }) as any,
      processReopenData: jest.fn().mockImplementation(async (data) => {
        const newData = Object.assign({}, data) as Record<string, any>;
        newData.hook1Added = true;
        return newData;
      }) as any
    };

    mockHook2 = {
      name: 'MockHook2',
      priority: 5, // Lower priority, should run first
      processIssueData: jest.fn().mockImplementation(async (data) => {
        const newData = Object.assign({}, data) as Record<string, any>;
        newData.hook2Added = true;
        return newData;
      }) as any,
      processCloseData: jest.fn().mockImplementation(async (data) => {
        const newData = Object.assign({}, data) as Record<string, any>;
        newData.hook2Added = true;
        return newData;
      }) as any,
      processReopenData: jest.fn().mockImplementation(async (data) => {
        const newData = Object.assign({}, data) as Record<string, any>;
        newData.hook2Added = true;
        return newData;
      }) as any
    };

    // Create hook manager with mock hooks
    hookManager = new HookManager([mockHook1, mockHook2]);
  });

  describe('constructor', () => {
    it('should initialize with empty array when no hooks are provided', () => {
      const emptyHookManager = new HookManager();
      expect(emptyHookManager.getHooks()).toEqual([]);
    });
  });

  describe('processIssueData', () => {
    it('should process data through all hooks in priority order', async () => {
      const data = { original: true };
      const result = await hookManager.processIssueData(data, mockTest, 'test.ts');

      // Verify that both hooks were called
      expect(mockHook2.processIssueData).toHaveBeenCalledWith(
        { original: true },
        mockTest,
        'test.ts'
      );

      expect(mockHook1.processIssueData).toHaveBeenCalledWith(
        { original: true, hook2Added: true },
        mockTest,
        'test.ts'
      );

      // Verify that the result contains data from both hooks
      expect(result).toEqual({
        original: true,
        hook2Added: true,
        hook1Added: true
      });
    });

    it('should handle hooks without processIssueData method', async () => {
      // Create a hook without processIssueData
      const mockHook3: TemplateDataHook = {
        name: 'MockHook3',
        priority: 1,
        processCloseData: jest.fn() as any
      };

      // Create hook manager with the new hook
      hookManager = new HookManager([mockHook1, mockHook3]);

      const data = { original: true };
      const result = await hookManager.processIssueData(data, mockTest, 'test.ts');

      // Verify that only mockHook1 was called
      expect(mockHook1.processIssueData).toHaveBeenCalledWith(
        { original: true },
        mockTest,
        'test.ts'
      );

      // Verify that the result contains data from mockHook1
      expect(result).toEqual({
        original: true,
        hook1Added: true
      });
    });
  });

  describe('processCloseData', () => {
    it('should process data through all hooks in priority order', async () => {
      const data = { original: true };
      const result = await hookManager.processCloseData(data, mockTest, 'test.ts');

      // Verify that both hooks were called
      expect(mockHook2.processCloseData).toHaveBeenCalledWith(
        { original: true },
        mockTest,
        'test.ts'
      );

      expect(mockHook1.processCloseData).toHaveBeenCalledWith(
        { original: true, hook2Added: true },
        mockTest,
        'test.ts'
      );

      // Verify that the result contains data from both hooks
      expect(result).toEqual({
        original: true,
        hook2Added: true,
        hook1Added: true
      });
    });
  });

  describe('processReopenData', () => {
    it('should process data through all hooks in priority order', async () => {
      const data = { original: true };
      const result = await hookManager.processReopenData(data, mockTest, 'test.ts');

      // Verify that both hooks were called
      expect(mockHook2.processReopenData).toHaveBeenCalledWith(
        { original: true },
        mockTest,
        'test.ts'
      );

      expect(mockHook1.processReopenData).toHaveBeenCalledWith(
        { original: true, hook2Added: true },
        mockTest,
        'test.ts'
      );

      // Verify that the result contains data from both hooks
      expect(result).toEqual({
        original: true,
        hook2Added: true,
        hook1Added: true
      });
    });
  });

  describe('registerHook', () => {
    it('should register a new hook', async () => {
      // Create a new hook
      const mockHook3: TemplateDataHook = {
        name: 'MockHook3',
        priority: 1,
        processIssueData: jest.fn().mockImplementation(async (data) => {
          const newData = Object.assign({}, data) as Record<string, any>;
          newData.hook3Added = true;
          return newData;
        }) as any
      };

      // Register the new hook
      hookManager.registerHook(mockHook3);

      const data = { original: true };
      const result = await hookManager.processIssueData(data, mockTest, 'test.ts');

      // Verify that all hooks were called in priority order
      expect(mockHook3.processIssueData).toHaveBeenCalledWith(
        { original: true },
        mockTest,
        'test.ts'
      );

      expect(mockHook2.processIssueData).toHaveBeenCalledWith(
        { original: true, hook3Added: true },
        mockTest,
        'test.ts'
      );

      expect(mockHook1.processIssueData).toHaveBeenCalledWith(
        { original: true, hook3Added: true, hook2Added: true },
        mockTest,
        'test.ts'
      );

      // Verify that the result contains data from all hooks
      expect(result).toEqual({
        original: true,
        hook3Added: true,
        hook2Added: true,
        hook1Added: true
      });
    });
  });
});
