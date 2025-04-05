/**
 * Mock for TemplateFactory
 */

import { mockTemplate } from './template.mock';

/**
 * Mock TemplateType enum
 */
export const mockTemplateType = {
  ISSUE: 'issue',
  CLOSE_COMMENT: 'closeComment',
  REOPEN_COMMENT: 'reopenComment'
};

/**
 * Mock TemplateFactory
 */
export const mockTemplateFactory = {
  getTemplate: jest.fn().mockImplementation((templateType, customTemplate, templates) => {
    return mockTemplate;
  })
};

describe('Template Factory Mocks', () => {
  it('should provide mock implementations', () => {
    // This test is just to prevent the "Your test suite must contain at least one test" error
    expect(mockTemplateType).toBeDefined();
    expect(mockTemplateFactory).toBeDefined();
    expect(mockTemplateFactory.getTemplate).toBeDefined();
  });
});
