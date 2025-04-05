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
  }),

  // Mock the private method for testing
  getTemplateSuffix: jest.fn().mockImplementation((templateType) => {
    switch (templateType) {
      case mockTemplateType.CLOSE_COMMENT:
        return 'CloseComment';
      case mockTemplateType.REOPEN_COMMENT:
        return 'ReopenComment';
      default:
        return '';
    }
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
