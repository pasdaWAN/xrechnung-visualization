import { ValidationResult, ValidationError, ValidationWarning, ErrorCode } from '../types/validation';
import { messages } from '../translations/messages';
import { XRechnungSchemaValidator } from './XRechnungSchemaValidator';

export class ValidationService {
  private static readonly requiredFields = [
    { 
      tag: "ID", 
      label: "Rechnungsnummer",
      validator: (value: string) => value.length > 0 
    },
    { 
      tag: "IssueDate", 
      label: "Rechnungsdatum",
      validator: (value: string) => this.validateDate(value)
    },
    { 
      tag: "DocumentCurrencyCode", 
      label: "Währung",
      validator: (value: string) => value.length === 3
    }
  ];

  static async validateXRechnung(file: File): Promise<ValidationResult> {
    try {
      const content = await file.text();
      
      // Schema validation (includes XML parsing and document type validation)
      const errors = await XRechnungSchemaValidator.validate(content);
      if (errors.length > 0) {
        return {
          isValid: false,
          errors,
          warnings: [],
          hasCriticalErrors: true
        };
      }

      // Additional business rule validations
      const xmlDoc = this.parseXML(content);
      this.validateRequiredFields(xmlDoc, errors);

      return {
        isValid: errors.length === 0,
        errors,
        warnings: [],
        hasCriticalErrors: errors.some(e => e.severity === 'CRITICAL')
      };
    } catch (error) {
      return this.handleValidationError(error);
    }
  }

  private static validateRequiredFields(xmlDoc: Document, errors: ValidationError[]): void {
    this.requiredFields.forEach(field => {
      const element = xmlDoc.getElementsByTagName(field.tag)[0];
      if (!element?.textContent) {
        errors.push({
          code: 'MISSING_REQUIRED',
          message: `Pflichtfeld fehlt: ${field.label}`,
          location: field.tag,
          severity: 'CRITICAL'
        });
      } else if (!field.validator(element.textContent)) {
        errors.push({
          code: 'INVALID_FORMAT',
          message: `Ungültiges Format für ${field.label}`,
          location: field.tag,
          severity: 'CRITICAL'
        });
      }
    });
  }

  private static validateDate(dateStr: string): boolean {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    const ublDatePattern = /^\d{8}$/;
    
    if (!dateStr || (!isoDatePattern.test(dateStr) && !ublDatePattern.test(dateStr))) {
      return false;
    }
    
    return true;
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

  private static handleValidationError(error: unknown): ValidationResult {
    console.error('Validation error:', error);
    
    return {
      isValid: false,
      errors: [{
        code: 'PROCESSING_ERROR',
        message: error instanceof Error 
          ? error.message 
          : 'Ein unerwarteter Fehler ist aufgetreten',
        location: 'document',
        severity: 'CRITICAL',
        suggestion: 'Bitte überprüfen Sie das Dokument und versuchen Sie es erneut'
      }],
      warnings: [],
      hasCriticalErrors: true
    };
  }
}

export class FileValidationService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['application/xml', 'text/xml'];
  private static readonly ALLOWED_EXTENSIONS = ['.xml'];
  
  static validateFile(file: File): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push({
        code: 'INVALID_VALUE',
        message: 'Die Datei ist zu groß (Maximum: 10MB)',
        location: 'file',
        severity: 'CRITICAL'
      });
    }
    
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      errors.push({
        code: 'INVALID_FORMAT',
        message: 'Ungültiges Dateiformat (Nur XML erlaubt)',
        location: 'file',
        severity: 'CRITICAL'
      });
    }
    
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push({
        code: 'INVALID_FORMAT',
        message: 'Ungültige Dateierweiterung (Nur .xml erlaubt)',
        location: 'file',
        severity: 'CRITICAL'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      hasCriticalErrors: errors.some(e => e.severity === 'CRITICAL')
    };
  }
} 