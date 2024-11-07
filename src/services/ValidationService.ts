import { ValidationResult, ValidationError, ValidationWarning, ErrorCode } from '../types/validation';

export class ValidationService {
  static async validateXRechnung(file: File): Promise<ValidationResult> {
    try {
      const content = await file.text();
      const xmlDoc = this.parseXML(content);
      
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Basic XML validation
      if (xmlDoc.querySelector("parsererror")) {
        return this.createErrorResult('PARSE_ERROR', 'XML parsing failed');
      }

      // XRechnung structure validation
      if (!this.isValidXRechnungStructure(xmlDoc)) {
        return this.createErrorResult('INVALID_ROOT', 'No valid XRechnung document found');
      }

      // Required fields validation
      this.validateRequiredFields(xmlDoc, errors);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        hasCriticalErrors: errors.some(e => e.severity === 'CRITICAL')
      };
    } catch (error) {
      console.error('Validation error:', error);
      return this.createErrorResult('VALIDATION_ERROR', 'Error during validation');
    }
  }

  private static parseXML(content: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(content, "application/xml");
  }

  private static createErrorResult(code: ErrorCode, message: string): ValidationResult {
    return {
      isValid: false,
      errors: [{
        code,
        message,
        location: 'document',
        severity: 'CRITICAL'
      }],
      warnings: []
    };
  }

  // ... other helper methods
} 