import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { SetupWizard } from '../../wizard/setup-wizard';

// Mock fs, path, child_process, and readline
jest.mock('fs', () => ({
  constants: {
    R_OK: 4,
    W_OK: 2,
  },
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((question, callback) => callback('y')),
    close: jest.fn(),
  })),
}));

describe('SetupWizard', () => {
  const mockProjectRoot = '/mock/project/root';
  let wizard: SetupWizard;
  
  beforeEach(() => {
    jest.clearAllMocks();
    wizard = new SetupWizard(mockProjectRoot, false);
  });
  
  describe('detectEnvironment', () => {
    it('should detect Jest configuration', async () => {
      // Mock fs.access to simulate finding jest.config.js
      (fs.promises.access as jest.Mock).mockImplementation((filePath) => {
        if (filePath === path.join(mockProjectRoot, 'jest.config.js')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });
      
      // Mock fs.readFile to return a mock Jest config
      (fs.promises.readFile as jest.Mock).mockResolvedValue(`
        module.exports = {
          testMatch: ['**/*.test.js'],
          testEnvironment: 'node',
        };
      `);
      
      // Call the private method using any type assertion
      await (wizard as any).detectEnvironment();
      
      // Verify that the Jest config was detected
      expect((wizard as any).config.jestConfigPath).toBe(path.join(mockProjectRoot, 'jest.config.js'));
      expect((wizard as any).config.jestConfigType).toBe('js');
    });
    
    it('should detect GitHub CLI', async () => {
      // Mock execSync to simulate GitHub CLI being installed
      (execSync as jest.Mock).mockImplementation((command) => {
        if (command === 'gh --version') {
          return Buffer.from('gh version 2.0.0');
        }
        throw new Error('Command not found');
      });
      
      // Call the private method using any type assertion
      await (wizard as any).detectEnvironment();
      
      // Verify that GitHub CLI was detected
      expect((wizard as any).config.hasGitHubCLI).toBe(true);
    });
    
    it('should detect GitHub token', async () => {
      // Mock process.env to include a GitHub token
      const originalEnv = process.env;
      process.env = { ...originalEnv, GITHUB_TOKEN: 'mock-token' };
      
      // Call the private method using any type assertion
      await (wizard as any).detectEnvironment();
      
      // Verify that GitHub token was detected
      expect((wizard as any).config.hasGitHubToken).toBe(true);
      
      // Restore original process.env
      process.env = originalEnv;
    });
    
    it('should detect test patterns', async () => {
      // Mock fs.access to simulate finding a test directory
      (fs.promises.access as jest.Mock).mockImplementation((filePath) => {
        if (filePath === path.join(mockProjectRoot, '__tests__')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Directory not found'));
      });
      
      // Call the private method using any type assertion
      await (wizard as any).detectEnvironment();
      
      // Verify that test directory was detected
      expect((wizard as any).config.testDir).toBe(path.join(mockProjectRoot, '__tests__'));
    });
    
    it('should detect package.json', async () => {
      // Mock fs.access to simulate finding package.json
      (fs.promises.access as jest.Mock).mockImplementation((filePath) => {
        if (filePath === path.join(mockProjectRoot, 'package.json')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('File not found'));
      });
      
      // Call the private method using any type assertion
      await (wizard as any).detectEnvironment();
      
      // Verify that package.json was detected
      expect((wizard as any).config.packageJsonPath).toBe(path.join(mockProjectRoot, 'package.json'));
    });
  });
  
  describe('generateConfiguration', () => {
    beforeEach(() => {
      // Set up config with mock values
      (wizard as any).config = {
        jestConfigPath: path.join(mockProjectRoot, 'jest.config.js'),
        jestConfigType: 'js',
        hasGitHubCLI: true,
        hasGitHubToken: false,
        testPatterns: ['**/*.test.js'],
        testDir: path.join(mockProjectRoot, '__tests__'),
        packageJsonPath: path.join(mockProjectRoot, 'package.json'),
      };
      
      // Mock fs.readFile to return mock content
      (fs.promises.readFile as jest.Mock).mockImplementation((filePath) => {
        if (filePath.endsWith('jest.config.js')) {
          return Promise.resolve(`
            module.exports = {
              testMatch: ['**/*.test.js'],
              testEnvironment: 'node',
            };
          `);
        } else if (filePath.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify({
            name: 'mock-project',
            version: '1.0.0',
            scripts: {
              test: 'jest',
            },
            devDependencies: {
              jest: '^29.0.0',
            },
          }));
        }
        return Promise.reject(new Error('File not found'));
      });
    });
    
    it('should create or update Jest config', async () => {
      // Call the private method using any type assertion
      await (wizard as any).generateConfiguration();
      
      // Verify that writeFile was called with the correct arguments
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        path.join(mockProjectRoot, 'jest.config.js'),
        expect.stringContaining('reporters'),
        expect.anything()
      );
    });
    
    it('should update package.json', async () => {
      // Call the private method using any type assertion
      await (wizard as any).generateConfiguration();
      
      // Verify that writeFile was called with the correct arguments
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        path.join(mockProjectRoot, 'package.json'),
        expect.stringContaining('test:jouster'),
        expect.anything()
      );
    });
    
    it('should create template directory if it doesn\'t exist', async () => {
      // Mock fs.access to simulate template directory not existing
      (fs.promises.access as jest.Mock).mockImplementation((filePath) => {
        if (filePath === path.join(mockProjectRoot, 'templates')) {
          return Promise.reject(new Error('Directory not found'));
        }
        return Promise.resolve();
      });
      
      // Call the private method using any type assertion
      await (wizard as any).generateConfiguration();
      
      // Verify that mkdir was called with the correct arguments
      expect(fs.promises.mkdir).toHaveBeenCalledWith(
        path.join(mockProjectRoot, 'templates')
      );
    });
  });
  
  describe('run', () => {
    it('should run the wizard successfully', async () => {
      // Mock the private methods
      (wizard as any).detectEnvironment = jest.fn().mockResolvedValue(undefined);
      (wizard as any).generateConfiguration = jest.fn().mockResolvedValue(undefined);
      
      // Run the wizard
      await wizard.run();
      
      // Verify that the private methods were called
      expect((wizard as any).detectEnvironment).toHaveBeenCalled();
      expect((wizard as any).generateConfiguration).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock the private methods to throw an error
      (wizard as any).detectEnvironment = jest.fn().mockRejectedValue(new Error('Test error'));
      
      // Run the wizard
      await wizard.run();
      
      // Verify that console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Setup failed'),
        expect.any(Error)
      );
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
