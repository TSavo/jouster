/**
 * Mock for Template interface
 */

import { TestResult } from '../../types';

/**
 * Mock template that delegates to the original template function
 */
export const mockTemplate = {
  generate: jest.fn().mockImplementation((test: TestResult, testFilePath: string, templateData: any) => {
    // If templateData has a templateFunction property, call it with templateData
    if (templateData.templateFunction) {
      return templateData.templateFunction(templateData);
    }
    
    // Otherwise, return a default value
    return 'Mock template content';
  })
};

describe('Template Mocks', () => {
  it('should provide mock implementations', () => {
    // This test is just to prevent the "Your test suite must contain at least one test" error
    expect(mockTemplate).toBeDefined();
    expect(mockTemplate.generate).toBeDefined();
  });
});
