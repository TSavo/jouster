import { Config } from '../config';
import { TemplateDataHook } from '../hooks/hook.interface';

describe('Config', () => {
  describe('constructor', () => {
    it('should initialize with empty config when no config is provided', () => {
      const config = new Config();
      expect(config.raw).toEqual({});
    });

    it('should initialize with provided config', () => {
      const rawConfig = { templateDir: 'templates' };
      const config = new Config(rawConfig);
      expect(config.raw).toEqual(rawConfig);
    });
  });

  describe('templateDir', () => {
    it('should return templateDir from config', () => {
      const config = new Config({ templateDir: 'templates' });
      expect(config.templateDir).toBe('templates');
    });

    it('should return undefined when templateDir is not in config', () => {
      const config = new Config();
      expect(config.templateDir).toBeUndefined();
    });
  });

  describe('templateManager', () => {
    it('should return templateManager from config', () => {
      const mockTemplateManager = { generateIssueBody: jest.fn() };
      const config = new Config({ templateManager: mockTemplateManager as any });
      expect(config.templateManager).toBe(mockTemplateManager);
    });

    it('should return undefined when templateManager is not in config', () => {
      const config = new Config();
      expect(config.templateManager).toBeUndefined();
    });
  });

  describe('hooks', () => {
    it('should return hooks from config', () => {
      const mockHook: TemplateDataHook = { name: 'mockHook', priority: 0 };
      const config = new Config({ hooks: [mockHook] });
      expect(config.hooks).toEqual([mockHook]);
    });

    it('should return hooks from nested config', () => {
      const mockHook: TemplateDataHook = { name: 'mockHook', priority: 0 };
      const config = new Config({ config: { hooks: [mockHook] } });
      expect(config.hooks).toEqual([mockHook]);
    });

    it('should return empty array when hooks are not in config', () => {
      const config = new Config();
      expect(config.hooks).toEqual([]);
    });
  });

  describe('raw', () => {
    it('should return the raw config object', () => {
      const rawConfig = { templateDir: 'templates' };
      const config = new Config(rawConfig);
      expect(config.raw).toBe(rawConfig);
    });
  });
});
