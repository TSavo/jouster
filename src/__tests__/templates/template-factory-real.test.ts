import { TemplateFactory, TemplateType } from '../../templates/template-factory';
import { TestResult } from '../../types';
import Handlebars from 'handlebars';

describe('TemplateFactory (Real Implementation)', () => {
  // Mock templates object
  const mockTemplates: Record<string, Handlebars.TemplateDelegate> = {
    issue: Handlebars.compile('Default issue content'),
    closeComment: Handlebars.compile('Default close comment content'),
    reopenComment: Handlebars.compile('Default reopen comment content'),
    customTemplate: Handlebars.compile('Custom issue content'),
    customTemplateCloseComment: Handlebars.compile('Custom close comment content'),
    customTemplateReopenComment: Handlebars.compile('Custom reopen comment content')
  };

  // Mock test result
  const mockTestResult: TestResult = {
    ancestorTitles: ['Test Suite'],
    duration: 100,
    failureMessages: ['Error message'],
    fullName: 'Test Suite Test Name',
    location: '',
    numPassingAsserts: 0,
    status: 'failed',
    title: 'Test Name'
  };

  describe('getTemplate', () => {
    it('should return a template for issue type', () => {
      const template = TemplateFactory.getTemplate(TemplateType.ISSUE, undefined, mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Default issue content');
    });

    it('should return a template for close comment type', () => {
      const template = TemplateFactory.getTemplate(TemplateType.CLOSE_COMMENT, undefined, mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Default close comment content');
    });

    it('should return a template for reopen comment type', () => {
      const template = TemplateFactory.getTemplate(TemplateType.REOPEN_COMMENT, undefined, mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Default reopen comment content');
    });

    it('should return a custom template for issue type if available', () => {
      const template = TemplateFactory.getTemplate(TemplateType.ISSUE, 'customTemplate', mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Custom issue content');
    });

    it('should return a custom template for close comment type if available', () => {
      const template = TemplateFactory.getTemplate(TemplateType.CLOSE_COMMENT, 'customTemplate', mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Custom close comment content');
    });

    it('should return a custom template for reopen comment type if available', () => {
      const template = TemplateFactory.getTemplate(TemplateType.REOPEN_COMMENT, 'customTemplate', mockTemplates);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Custom reopen comment content');
    });

    it('should fall back to default template if custom template is not available', () => {
      // Create a templates object without custom templates
      const templatesWithoutCustom: Record<string, Handlebars.TemplateDelegate> = {
        issue: Handlebars.compile('Default issue content'),
        closeComment: Handlebars.compile('Default close comment content'),
        reopenComment: Handlebars.compile('Default reopen comment content')
      };

      const template = TemplateFactory.getTemplate(TemplateType.ISSUE, 'nonExistentTemplate', templatesWithoutCustom);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', {});

      expect(result).toBe('Default issue content');
    });

    it('should throw an error if template is not found', () => {
      // Create an empty templates object
      const emptyTemplates = {};

      expect(() => {
        TemplateFactory.getTemplate(TemplateType.ISSUE, undefined, emptyTemplates);
      }).toThrow('Template not found: issue');
    });

    it('should handle template data correctly', () => {
      // Create a template with a variable
      const templatesWithVariables: Record<string, Handlebars.TemplateDelegate> = {
        issue: Handlebars.compile('Issue content: {{message}}')
      };

      const template = TemplateFactory.getTemplate(TemplateType.ISSUE, undefined, templatesWithVariables);

      expect(template).toBeDefined();
      expect(template.generate).toBeDefined();

      const result = template.generate(mockTestResult, '/path/to/test.ts', { message: 'Hello, world!' });

      expect(result).toBe('Issue content: Hello, world!');
    });
  });

  describe('getTemplateSuffix', () => {
    // We need to access the private method using a workaround
    const getTemplateSuffix = (TemplateFactory as any).getTemplateSuffix.bind(TemplateFactory);

    it('should return empty string for issue type', () => {
      const result = getTemplateSuffix(TemplateType.ISSUE);
      expect(result).toBe('');
    });

    it('should return CloseComment for close comment type', () => {
      const result = getTemplateSuffix(TemplateType.CLOSE_COMMENT);
      expect(result).toBe('CloseComment');
    });

    it('should return ReopenComment for reopen comment type', () => {
      const result = getTemplateSuffix(TemplateType.REOPEN_COMMENT);
      expect(result).toBe('ReopenComment');
    });

    it('should return empty string for unknown type', () => {
      const result = getTemplateSuffix('unknown' as TemplateType);
      expect(result).toBe('');
    });
  });
});
