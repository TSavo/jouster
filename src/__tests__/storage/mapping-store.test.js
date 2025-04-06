"use strict";

const fs = require('fs');
const path = require('path');
const { MappingStore } = require('../../storage/mapping-store');

// We'll use spies instead of mocking the entire fs module
const originalExistsSync = fs.existsSync;
const originalReadFileSync = fs.readFileSync;
const originalWriteFileSync = fs.writeFileSync;

describe('MappingStore', () => {
  let mappingStore;
  const testDatabasePath = '/path/to/test-db.json';
  const testMapping = {
    'test-identifier': {
      issueNumber: 123,
      status: 'open',
      lastFailure: '2023-01-01T00:00:00.000Z',
      lastUpdate: '2023-01-01T00:00:00.000Z',
      testFilePath: '/path/to/test.js',
      testName: 'Test Suite › test should pass'
    }
  };

  beforeEach(() => {
    // Set up spies
    jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(testMapping));
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original functions
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use the provided database path', () => {
      mappingStore = new MappingStore(testDatabasePath);
      expect(mappingStore.databasePath).toBe(testDatabasePath);
    });

    it('should use a default database path if none is provided', () => {
      const cwd = process.cwd();
      mappingStore = new MappingStore();
      expect(mappingStore.databasePath).toBe(path.join(cwd, 'test-issue-mapping.json'));
    });

    it('should load mappings from the database file', () => {
      mappingStore = new MappingStore(testDatabasePath);
      expect(fs.existsSync).toHaveBeenCalledWith(testDatabasePath);
      expect(fs.readFileSync).toHaveBeenCalledWith(testDatabasePath, 'utf8');
      expect(mappingStore.mappings).toEqual(testMapping);
    });
  });

  describe('loadMappings', () => {
    it('should load mappings from the database file if it exists', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(testMapping));

      mappingStore = new MappingStore(testDatabasePath);
      expect(mappingStore.mappings).toEqual(testMapping);
    });

    it('should initialize with an empty object if the database file does not exist', () => {
      jest.spyOn(fs, 'existsSync').mockImplementation(() => false);

      mappingStore = new MappingStore(testDatabasePath);
      expect(mappingStore.mappings).toEqual({});
    });

    it('should handle errors when loading mappings', () => {
      jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Failed to read file');
      });

      mappingStore = new MappingStore(testDatabasePath);
      expect(mappingStore.mappings).toEqual({});
    });

    it('should handle invalid JSON in the database file', () => {
      jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => 'invalid json');

      mappingStore = new MappingStore(testDatabasePath);
      expect(mappingStore.mappings).toEqual({});
    });
  });

  describe('saveMappings', () => {
    it('should save mappings to the database file', () => {
      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.saveMappings();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        testDatabasePath,
        JSON.stringify(testMapping, null, 2),
        'utf8'
      );
    });

    it('should handle errors when saving mappings', () => {
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('Failed to write file');
      });

      mappingStore = new MappingStore(testDatabasePath);
      expect(() => mappingStore.saveMappings()).not.toThrow();
    });
  });

  describe('getMapping', () => {
    it('should return the mapping for a test identifier', () => {
      mappingStore = new MappingStore(testDatabasePath);
      const mapping = mappingStore.getMapping('test-identifier');

      expect(mapping).toEqual(testMapping['test-identifier']);
    });

    it('should return undefined if no mapping exists for a test identifier', () => {
      mappingStore = new MappingStore(testDatabasePath);
      const mapping = mappingStore.getMapping('non-existent-identifier');

      expect(mapping).toBeUndefined();
    });
  });

  describe('setMapping', () => {
    it('should set a mapping for a test identifier with all parameters', () => {
      const testIdentifier = 'new-test-identifier';
      const issueNumber = 456;
      const status = 'open';
      const gitInfo = {
        author: 'Test Author',
        commit: '1234567890abcdef',
        message: 'Test commit message'
      };
      const testFilePath = '/path/to/new-test.js';
      const testName = 'New Test Suite › test should pass';

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.setMapping(testIdentifier, issueNumber, status, gitInfo, testFilePath, testName);

      expect(mappingStore.mappings[testIdentifier]).toEqual({
        issueNumber,
        status,
        lastFailure: mockDate,
        lastUpdate: mockDate,
        fixedBy: undefined,
        fixCommit: undefined,
        fixMessage: undefined,
        testFilePath,
        testName
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });

    it('should set a mapping for a test identifier with minimal parameters', () => {
      const testIdentifier = 'minimal-test-identifier';
      const issueNumber = 789;

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.setMapping(testIdentifier, issueNumber);

      expect(mappingStore.mappings[testIdentifier]).toEqual({
        issueNumber,
        status: 'open',
        lastFailure: mockDate,
        lastUpdate: mockDate,
        fixedBy: undefined,
        fixCommit: undefined,
        fixMessage: undefined,
        testFilePath: '',
        testName: ''
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });

    it('should set a mapping with closed status and store git information', () => {
      const testIdentifier = 'closed-test-identifier';
      const issueNumber = 101;
      const status = 'closed';
      const gitInfo = {
        author: 'Test Author',
        commit: '1234567890abcdef',
        message: 'Test commit message'
      };

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.setMapping(testIdentifier, issueNumber, status, gitInfo);

      expect(mappingStore.mappings[testIdentifier]).toEqual({
        issueNumber,
        status,
        lastFailure: mockDate, // When creating a new mapping, lastFailure is set to now
        lastUpdate: mockDate,
        fixedBy: gitInfo.author,
        fixCommit: gitInfo.commit,
        fixMessage: gitInfo.message,
        testFilePath: '',
        testName: ''
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });

    it('should preserve existing lastFailure when setting a mapping with closed status', () => {
      const testIdentifier = 'test-identifier';
      const issueNumber = 123;
      const status = 'closed';
      const gitInfo = {
        author: 'Test Author',
        commit: '1234567890abcdef',
        message: 'Test commit message'
      };

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.setMapping(testIdentifier, issueNumber, status, gitInfo);

      expect(mappingStore.mappings[testIdentifier]).toEqual({
        issueNumber,
        status,
        lastFailure: testMapping['test-identifier'].lastFailure,
        lastUpdate: mockDate,
        fixedBy: gitInfo.author,
        fixCommit: gitInfo.commit,
        fixMessage: gitInfo.message,
        testFilePath: testMapping['test-identifier'].testFilePath,
        testName: testMapping['test-identifier'].testName
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });

    it('should handle missing git information when setting a mapping with closed status', () => {
      const testIdentifier = 'missing-git-info';
      const issueNumber = 456;
      const status = 'closed';
      // No git info provided

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.setMapping(testIdentifier, issueNumber, status);

      expect(mappingStore.mappings[testIdentifier]).toEqual({
        issueNumber,
        status,
        lastFailure: mockDate,
        lastUpdate: mockDate,
        fixedBy: 'Unknown',
        fixCommit: 'Unknown',
        fixMessage: '',
        testFilePath: '',
        testName: ''
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });
  });

  describe('updateMapping', () => {
    it('should update an existing mapping', () => {
      const testIdentifier = 'test-identifier';
      const updates = {
        status: 'closed',
        lastFailure: '2023-02-01T00:00:00.000Z'
      };

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.updateMapping(testIdentifier, updates);

      // When status changes to closed, git info is added
      expect(mappingStore.mappings[testIdentifier]).toEqual({
        ...testMapping['test-identifier'],
        ...updates,
        lastUpdate: mockDate,
        fixedBy: 'Unknown', // Default value when no git info is provided
        fixCommit: 'Unknown',
        fixMessage: ''
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });

    it('should do nothing if the mapping does not exist', () => {
      const testIdentifier = 'non-existent-identifier';
      const updates = {
        status: 'closed',
        lastFailure: '2023-02-01T00:00:00.000Z'
      };

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.updateMapping(testIdentifier, updates);

      expect(mappingStore.mappings[testIdentifier]).toBeUndefined();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should update git information when status changes from open to closed', () => {
      const testIdentifier = 'test-identifier';
      const updates = {
        status: 'closed'
      };
      const gitInfo = {
        author: 'Test Author',
        commit: '1234567890abcdef',
        message: 'Test commit message'
      };

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.updateMapping(testIdentifier, updates, gitInfo);

      expect(mappingStore.mappings[testIdentifier]).toEqual({
        ...testMapping['test-identifier'],
        ...updates,
        fixedBy: gitInfo.author,
        fixCommit: gitInfo.commit,
        fixMessage: gitInfo.message,
        lastUpdate: mockDate
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });

    it('should update test information if not already set', () => {
      const testIdentifier = 'test-identifier';
      const updates = {};
      const gitInfo = {};
      const testFilePath = '/path/to/new-test.js';
      const testName = 'New Test Suite › test should pass';

      // Create a mapping without test information
      const mappingWithoutTestInfo = {
        'test-identifier': {
          issueNumber: 123,
          status: 'open',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        }
      };

      jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(mappingWithoutTestInfo));

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.updateMapping(testIdentifier, updates, gitInfo, testFilePath, testName);

      expect(mappingStore.mappings[testIdentifier]).toEqual({
        ...mappingWithoutTestInfo['test-identifier'],
        ...updates,
        testFilePath,
        testName,
        lastUpdate: mockDate
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });

    it('should not update test information if already set', () => {
      const testIdentifier = 'test-identifier';
      const updates = {};
      const gitInfo = {};
      const testFilePath = '/path/to/new-test.js';
      const testName = 'New Test Suite › test should pass';

      // Mock Date.toISOString to return a fixed date
      const mockDate = '2023-02-01T00:00:00.000Z';
      const originalDateToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn().mockReturnValue(mockDate);

      mappingStore = new MappingStore(testDatabasePath);
      mappingStore.updateMapping(testIdentifier, updates, gitInfo, testFilePath, testName);

      expect(mappingStore.mappings[testIdentifier]).toEqual({
        ...testMapping['test-identifier'],
        ...updates,
        lastUpdate: mockDate
      });

      expect(fs.writeFileSync).toHaveBeenCalled();

      // Restore original Date.toISOString
      Date.prototype.toISOString = originalDateToISOString;
    });
  });

  describe('getAllMappings', () => {
    it('should return all mappings', () => {
      mappingStore = new MappingStore(testDatabasePath);
      const mappings = mappingStore.getAllMappings();

      expect(mappings).toEqual(testMapping);
    });

    it('should return an empty object if there are no mappings', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify({}));

      mappingStore = new MappingStore(testDatabasePath);
      const mappings = mappingStore.getAllMappings();

      expect(mappings).toEqual({});
    });
  });
});
