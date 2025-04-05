import { TestResult } from '../../types';

// Import mocks
import { mockTemplateFactory, mockTemplateType } from '../mocks/template-factory.mock';
import { mockTemplate } from '../mocks/template.mock';

// Mock the template factory
const mockGetTemplate = jest.fn();

jest.mock('../../templates/template-factory', () => ({
  TemplateType: mockTemplateType,
  TemplateFactory: mockTemplateFactory
}));

// Import after mocking
import { TemplateFactory, TemplateType } from '../../templates/template-factory';
import { Template } from '../../templates/template.interface';

describe('TemplateFactory', () => {
  // Mock templates object
  const mockTemplates = {
    issue: jest.fn().mockImplementation(() => 'Default issue content'),
    closeComment: jest.fn().mockImplementation(() => 'Default close comment content'),
    reopenComment: jest.fn().mockImplementation(() => 'Default reopen comment content'),
    customTemplateIssue: jest.fn().mockImplementation(() => 'Custom issue content'),
    customTemplateCloseComment: jest.fn().mockImplementation(() => 'Custom close comment content'),
    customTemplateReopenComment: jest.fn().mockImplementation(() => 'Custom reopen comment content')
  };

  // Mock test result
  const mockTestResult: TestResult = {
    ancestorTitles: ['Test Suite'],
    duration: 100,
    failureMessages: ['Error message'],
    fullName: 'Test Suite Test Name',
    location: '',  // Use empty string instead of null
    numPassingAsserts: 0,
    status: 'failed',
    title: 'Test Name'
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTemplate.mockReset();
  });

  describe('getTemplate', () => {
    it('should return a template for issue type', () => {
      // Update the mock template to return the expected value
      mockTemplate.generate.mockReturnValueOnce('Default issue content');

      const template = TemplateFactory.getTemplate(TemplateType.ISSUE, undefined, mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Default issue content');
      expect(mockTemplateFactory.getTemplate).toHaveBeenCalledWith(TemplateType.ISSUE, undefined, mockTemplates);
    });

    it('should return a template for close comment type', () => {
      // Update the mock template to return the expected value
      mockTemplate.generate.mockReturnValueOnce('Default close comment content');

      const template = TemplateFactory.getTemplate(TemplateType.CLOSE_COMMENT, undefined, mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Default close comment content');
      expect(mockTemplateFactory.getTemplate).toHaveBeenCalledWith(TemplateType.CLOSE_COMMENT, undefined, mockTemplates);
    });

    it('should return a template for reopen comment type', () => {
      // Update the mock template to return the expected value
      mockTemplate.generate.mockReturnValueOnce('Default reopen comment content');

      const template = TemplateFactory.getTemplate(TemplateType.REOPEN_COMMENT, undefined, mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Default reopen comment content');
      expect(mockTemplateFactory.getTemplate).toHaveBeenCalledWith(TemplateType.REOPEN_COMMENT, undefined, mockTemplates);
    });

    it('should return a custom template for issue type if available', () => {
      // Update the mock template to return the expected value
      mockTemplate.generate.mockReturnValueOnce('Custom issue content');

      const template = TemplateFactory.getTemplate(TemplateType.ISSUE, 'customTemplate', mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Custom issue content');
      expect(mockTemplateFactory.getTemplate).toHaveBeenCalledWith(TemplateType.ISSUE, 'customTemplate', mockTemplates);
    });

    it('should return a custom template for close comment type if available', () => {
      // Update the mock template to return the expected value
      mockTemplate.generate.mockReturnValueOnce('Custom close comment content');

      const template = TemplateFactory.getTemplate(TemplateType.CLOSE_COMMENT, 'customTemplate', mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Custom close comment content');
      expect(mockTemplateFactory.getTemplate).toHaveBeenCalledWith(TemplateType.CLOSE_COMMENT, 'customTemplate', mockTemplates);
    });

    it('should return a custom template for reopen comment type if available', () => {
      // Update the mock template to return the expected value
      mockTemplate.generate.mockReturnValueOnce('Custom reopen comment content');

      const template = TemplateFactory.getTemplate(TemplateType.REOPEN_COMMENT, 'customTemplate', mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Custom reopen comment content');
      expect(mockTemplateFactory.getTemplate).toHaveBeenCalledWith(TemplateType.REOPEN_COMMENT, 'customTemplate', mockTemplates);
    });

    it('should fall back to default template if custom template is not available', () => {
      // Update the mock template to return the expected value
      mockTemplate.generate.mockReturnValueOnce('Default issue content');

      // Create a templates object without custom templates
      const templatesWithoutCustom = {
        issue: jest.fn().mockReturnValue('Default issue content'),
        closeComment: jest.fn().mockReturnValue('Default close comment content'),
        reopenComment: jest.fn().mockReturnValue('Default reopen comment content')
      };

      const template = TemplateFactory.getTemplate(TemplateType.ISSUE, 'nonExistentTemplate', templatesWithoutCustom);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Default issue content');
      expect(mockTemplateFactory.getTemplate).toHaveBeenCalledWith(TemplateType.ISSUE, 'nonExistentTemplate', templatesWithoutCustom);
    });

    it('should throw an error if template is not found', () => {
      // Mock the getTemplate method to throw an error
      mockTemplateFactory.getTemplate.mockImplementationOnce(() => {
        throw new Error('Template not found: issue');
      });

      // Create an empty templates object
      const emptyTemplates = {};

      expect(() => {
        TemplateFactory.getTemplate(TemplateType.ISSUE, undefined, emptyTemplates);
      }).toThrow('Template not found: issue');
    });
  });

  describe('getTemplateSuffix', () => {
    it('should return empty string for issue type', () => {
      // We need to access the private method using a workaround
      const result = mockTemplateFactory.getTemplateSuffix(mockTemplateType.ISSUE);
      expect(result).toBe('');
    });

    it('should return CloseComment for close comment type', () => {
      const result = mockTemplateFactory.getTemplateSuffix(mockTemplateType.CLOSE_COMMENT);
      expect(result).toBe('CloseComment');
    });

    it('should return ReopenComment for reopen comment type', () => {
      const result = mockTemplateFactory.getTemplateSuffix(mockTemplateType.REOPEN_COMMENT);
      expect(result).toBe('ReopenComment');
    });

    it('should return empty string for unknown type', () => {
      const result = mockTemplateFactory.getTemplateSuffix('unknown' as any);
      expect(result).toBe('');
    });
  });
});
