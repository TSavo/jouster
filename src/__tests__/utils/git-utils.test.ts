// @ts-nocheck
import { jest } from '@jest/globals';
import { GitUtils } from '../../utils/git-utils';

jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('GitUtils', () => {
  const { execSync } = require('child_process');
  
  beforeEach(() => {
    execSync.mockClear();
  });

  describe('isGitAvailable', () => {
    it('should return true when git is available', () => {
      execSync.mockReturnValueOnce(Buffer.from('git version 2.30.0'));
      const result = GitUtils.isGitAvailable();
      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git --version');
    });

    it('should return false when git is not available', () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });
      const result = GitUtils.isGitAvailable();
      expect(result).toBe(false);
      expect(execSync).toHaveBeenCalledWith('git --version');
    });
  });

  describe('getBranchName', () => {
    it('should get branch name on Windows', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      execSync.mockReturnValueOnce(Buffer.from('main'));
      const result = GitUtils.getBranchName();
      
      expect(result).toBe('main');
      expect(execSync).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD');
      
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should get branch name on Unix', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });
      
      execSync.mockReturnValueOnce(Buffer.from('main'));
      const result = GitUtils.getBranchName();
      
      expect(result).toBe('main');
      expect(execSync).toHaveBeenCalledWith('git branch --show-current');
      
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should handle errors', () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });
      const result = GitUtils.getBranchName();
      expect(result).toBe('unknown');
    });
  });

  describe('getCommitHash', () => {
    it('should get commit hash', () => {
      execSync.mockReturnValueOnce(Buffer.from('abcdef1234567890'));
      const result = GitUtils.getCommitHash();
      expect(result).toBe('abcdef1234567890');
      expect(execSync).toHaveBeenCalledWith('git log -1 --pretty=format:%H');
    });

    it('should handle errors', () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });
      const result = GitUtils.getCommitHash();
      expect(result).toBe('unknown');
    });
  });

  describe('getCommitAuthor', () => {
    it('should get commit author', () => {
      execSync.mockReturnValueOnce(Buffer.from('Test Author'));
      const result = GitUtils.getCommitAuthor();
      expect(result).toBe('Test Author');
      expect(execSync).toHaveBeenCalledWith('git log -1 --pretty=format:%an');
    });

    it('should handle errors', () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });
      const result = GitUtils.getCommitAuthor();
      expect(result).toBe('unknown');
    });
  });

  describe('getCommitMessage', () => {
    it('should get commit message', () => {
      execSync.mockReturnValueOnce(Buffer.from('Test commit message'));
      const result = GitUtils.getCommitMessage();
      expect(result).toBe('Test commit message');
      expect(execSync).toHaveBeenCalledWith('git log -1 --pretty=format:%s');
    });

    it('should handle errors', () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });
      const result = GitUtils.getCommitMessage();
      expect(result).toBe('unknown');
    });
  });

  describe('getGitInfo', () => {
    it('should get git information', () => {
      // Mock isGitAvailable
      jest.spyOn(GitUtils, 'isGitAvailable').mockReturnValueOnce(true);
      
      // Mock the individual methods
      jest.spyOn(GitUtils, 'getBranchName').mockReturnValueOnce('main');
      jest.spyOn(GitUtils, 'getCommitHash').mockReturnValueOnce('abcdef1234567890');
      jest.spyOn(GitUtils, 'getCommitAuthor').mockReturnValueOnce('Test Author');
      jest.spyOn(GitUtils, 'getCommitMessage').mockReturnValueOnce('Test commit message');
      
      const result = GitUtils.getGitInfo();
      
      expect(result).toEqual({
        branch: 'main',
        commit: 'abcdef1234567890',
        author: 'Test Author',
        message: 'Test commit message'
      });
    });

    it('should return default info when git is not available', () => {
      // Mock isGitAvailable
      jest.spyOn(GitUtils, 'isGitAvailable').mockReturnValueOnce(false);
      
      const result = GitUtils.getGitInfo();
      
      expect(result).toEqual({
        branch: 'unknown',
        commit: 'unknown',
        author: 'unknown',
        message: 'unknown'
      });
    });

    it('should handle errors', () => {
      // Mock isGitAvailable to throw an error
      jest.spyOn(GitUtils, 'isGitAvailable').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });
      
      const result = GitUtils.getGitInfo();
      
      expect(result).toEqual({
        branch: 'unknown',
        commit: 'unknown',
        author: 'unknown',
        message: 'unknown'
      });
    });
  });
});
