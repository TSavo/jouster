"use strict";

const fs = require('fs');
const path = require('path');

/**
 * Store for mapping test identifiers to GitHub issue numbers
 */
class MappingStore {
  /**
   * Creates a new MappingStore instance
   *
   * @param databasePath Path to the database file
   */
  constructor(databasePath) {
    this.databasePath = databasePath || path.join(process.cwd(), 'test-issue-mapping.json');
    this.mappings = {};
    this.loadMappings();
  }

  /**
   * Loads mappings from the database file
   */
  loadMappings() {
    try {
      if (fs.existsSync(this.databasePath)) {
        const data = fs.readFileSync(this.databasePath, 'utf8');
        this.mappings = JSON.parse(data);
      } else {
        this.mappings = {};
      }
    } catch (error) {
      // If there's an error loading mappings, start with an empty object
      this.mappings = {};
    }
  }

  /**
   * Saves mappings to the database file
   */
  saveMappings() {
    try {
      const data = JSON.stringify(this.mappings, null, 2);
      fs.writeFileSync(this.databasePath, data, 'utf8');
    } catch (error) {
      // Silently continue if saving fails
    }
  }

  /**
   * Gets a mapping for a test identifier
   *
   * @param testIdentifier The test identifier
   * @returns The mapping, or undefined if not found
   */
  getMapping(testIdentifier) {
    return this.mappings[testIdentifier];
  }

  /**
   * Sets a mapping for a test identifier
   *
   * @param testIdentifier The test identifier
   * @param issueNumber The GitHub issue number
   * @param status The status of the issue
   * @param gitInfo Optional git information
   * @param testFilePath Optional test file path
   * @param testName Optional test name
   */
  setMapping(testIdentifier, issueNumber, status = 'open', gitInfo = {}, testFilePath = '', testName = '') {
    const now = new Date().toISOString();
    this.mappings[testIdentifier] = {
      issueNumber,
      status,
      lastFailure: status === 'open' ? now : this.mappings[testIdentifier]?.lastFailure || now,
      lastUpdate: now,
      // Store git information for the fix/failure
      fixedBy: status === 'closed' ? (gitInfo.author || 'Unknown') : this.mappings[testIdentifier]?.fixedBy,
      fixCommit: status === 'closed' ? (gitInfo.commit || 'Unknown') : this.mappings[testIdentifier]?.fixCommit,
      fixMessage: status === 'closed' ? (gitInfo.message || '') : this.mappings[testIdentifier]?.fixMessage,
      // Store test information for easier identification
      testFilePath: testFilePath || this.mappings[testIdentifier]?.testFilePath || '',
      testName: testName || this.mappings[testIdentifier]?.testName || ''
    };
    this.saveMappings();
  }

  /**
   * Updates a mapping for a test identifier
   *
   * @param testIdentifier The test identifier
   * @param updates The updates to apply
   * @param gitInfo Optional git information
   * @param testFilePath Optional test file path
   * @param testName Optional test name
   */
  updateMapping(testIdentifier, updates, gitInfo = {}, testFilePath = '', testName = '') {
    const mapping = this.mappings[testIdentifier];
    if (mapping) {
      // If status is changing to closed, store git information about the fix
      const gitUpdates = {};
      if (updates.status === 'closed' && mapping.status === 'open') {
        gitUpdates.fixedBy = gitInfo.author || 'Unknown';
        gitUpdates.fixCommit = gitInfo.commit || 'Unknown';
        gitUpdates.fixMessage = gitInfo.message || '';
      }

      // Store test information for easier identification
      if (testFilePath && !mapping.testFilePath) {
        gitUpdates.testFilePath = testFilePath;
      }
      if (testName && !mapping.testName) {
        gitUpdates.testName = testName;
      }

      this.mappings[testIdentifier] = {
        ...mapping,
        ...updates,
        ...gitUpdates,
        lastUpdate: new Date().toISOString()
      };
      this.saveMappings();
    }
  }

  /**
   * Gets all mappings
   *
   * @returns All mappings
   */
  getAllMappings() {
    return this.mappings;
  }
}

module.exports = { MappingStore };
