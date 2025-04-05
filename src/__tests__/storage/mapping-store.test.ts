// @ts-nocheck
import { jest } from '@jest/globals';
import { MappingStore } from '../../storage/mapping-store';
import { IStorageClient } from '../../storage/storage-client.interface';
import { IssueMapping } from '../../types';

describe('MappingStore', () => {
  let mockStorageClient: IStorageClient;
  let mappingStore: MappingStore;

  beforeEach(() => {
    // Create a mock storage client
    mockStorageClient = {
      getMapping: jest.fn(),
      setMapping: jest.fn(),
      updateMapping: jest.fn(),
      getAllMappings: jest.fn().mockReturnValue({
        'test-identifier-1': {
          issueNumber: 123,
          status: 'open',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        },
        'test-identifier-2': {
          issueNumber: 456,
          status: 'closed',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-02T00:00:00.000Z',
          fixedBy: 'Test Author',
          fixCommit: '1234567890abcdef',
          fixMessage: 'Fix test'
        }
      })
    };

    mappingStore = new MappingStore(mockStorageClient);
  });

  describe('getMapping', () => {
    it('should call the storage client getMapping method', () => {
      const testIdentifier = 'test-identifier';
      const mockMapping: IssueMapping = {
        issueNumber: 123,
        status: 'open'
      };

      mockStorageClient.getMapping = jest.fn().mockReturnValue(mockMapping);

      const result = mappingStore.getMapping(testIdentifier);

      expect(mockStorageClient.getMapping).toHaveBeenCalledWith(testIdentifier);
      expect(result).toBe(mockMapping);
    });
  });

  describe('setMapping', () => {
    it('should call the storage client setMapping method', () => {
      const testIdentifier = 'test-identifier';
      const issueNumber = 123;
      const status = 'open';
      const gitInfo = { author: 'Test Author', commit: '1234567890abcdef' };
      const testFilePath = '/path/to/test.ts';
      const testName = 'Test Name';

      mappingStore.setMapping(testIdentifier, issueNumber, status, gitInfo, testFilePath, testName);

      expect(mockStorageClient.setMapping).toHaveBeenCalledWith(
        testIdentifier,
        issueNumber,
        status,
        gitInfo,
        testFilePath,
        testName
      );
    });
  });

  describe('updateMapping', () => {
    it('should call the storage client updateMapping method', () => {
      const testIdentifier = 'test-identifier';
      const updates = { status: 'closed' };
      const gitInfo = { author: 'Test Author', commit: '1234567890abcdef' };
      const testFilePath = '/path/to/test.ts';
      const testName = 'Test Name';

      mappingStore.updateMapping(testIdentifier, updates, gitInfo, testFilePath, testName);

      expect(mockStorageClient.updateMapping).toHaveBeenCalledWith(
        testIdentifier,
        updates,
        gitInfo,
        testFilePath,
        testName
      );
    });
  });

  describe('getAllMappings', () => {
    it('should call the storage client getAllMappings method', () => {
      const result = mappingStore.getAllMappings();

      expect(mockStorageClient.getAllMappings).toHaveBeenCalled();
      expect(Object.keys(result).length).toBe(2);
    });
  });
});
