import Handlebars from 'handlebars';
import { Template } from './template.interface';
import { TestResult } from '../types';

/**
 * Template type enum
 */
export enum TemplateType {
  ISSUE = 'issue',
  CLOSE_COMMENT = 'closeComment',
  REOPEN_COMMENT = 'reopenComment'
}

/**
 * Handlebars template implementation
 */
class HandlebarsTemplate implements Template {
  /**
   * Creates a new handlebars template
   * 
   * @param templateFn Handlebars template function
   */
  constructor(private templateFn: Handlebars.TemplateDelegate) {}

  /**
   * Generate template content
   * 
   * @param testResult Test result
   * @param testFilePath Test file path
   * @param templateData Additional template data
   * @returns Generated content
   */
  public generate(testResult: TestResult, testFilePath: string, templateData: Record<string, any>): string {
    return this.templateFn(templateData);
  }
}

/**
 * Template factory
 */
export class TemplateFactory {
  /**
   * Get a template
   * 
   * @param templateType Template type
   * @param customTemplateName Custom template name
   * @param templates Available templates
   * @returns Template
   */
  public static getTemplate(
    templateType: TemplateType,
    customTemplateName: string | undefined,
    templates: Record<string, Handlebars.TemplateDelegate>
  ): Template {
    // Determine the template name based on the template type and custom template name
    let templateName: string;
    
    if (customTemplateName) {
      // Try to get the custom template
      const customTemplateKey = `${customTemplateName}${this.getTemplateSuffix(templateType)}`;
      
      if (templates[customTemplateKey]) {
        templateName = customTemplateKey;
      } else {
        // Fall back to default template
        templateName = templateType;
      }
    } else {
      // Use default template
      templateName = templateType;
    }
    
    // Get the template function
    const templateFn = templates[templateName];
    
    if (!templateFn) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    // Create and return the template
    return new HandlebarsTemplate(templateFn);
  }
  
  /**
   * Get the template suffix based on the template type
   * 
   * @param templateType Template type
   * @returns Template suffix
   */
  private static getTemplateSuffix(templateType: TemplateType): string {
    switch (templateType) {
      case TemplateType.ISSUE:
        return '';
      case TemplateType.CLOSE_COMMENT:
        return 'CloseComment';
      case TemplateType.REOPEN_COMMENT:
        return 'ReopenComment';
      default:
        return '';
    }
  }
}
