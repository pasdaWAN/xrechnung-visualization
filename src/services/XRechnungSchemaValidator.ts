import { ValidationError } from '../types/validation';
import { DOMParser } from 'xmldom';
import { XMLValidator } from 'fast-xml-parser';

interface XMLValidationOptions {
  allowBooleanAttributes?: boolean;
  ignoreAttributes?: boolean;
  validateXML?: boolean;
  xsdSchema?: string;
}

export class XRechnungSchemaValidator {
  // Instead of reading from filesystem, we'll fetch the schema
  private static async getSchema(): Promise<string> {
    try {
      const response = await fetch('/xsd/xrechnung-semantic-model.xsd');
      if (!response.ok) {
        throw new Error('Failed to load XSD schema');
      }
      return await response.text();
    } catch (error) {
      console.error('Error loading schema:', error);
      throw error;
    }
  }

  static async validate(xmlContent: string): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

    // Basic XML parsing validation
    const parseErrors = xmlDoc.getElementsByTagName("parsererror");
    if (parseErrors.length > 0) {
      errors.push({
        code: 'PARSE_ERROR',
        message: 'XML-Parsing fehlgeschlagen',
        location: 'document',
        severity: 'CRITICAL'
      });
      return errors;
    }

    // Document type validation
    const isXRechnung = xmlDoc.getElementsByTagName("Invoice").length > 0 || 
                       xmlDoc.getElementsByTagName("CreditNote").length > 0 ||
                       xmlDoc.getElementsByTagName("CrossIndustryInvoice").length > 0;
    
    if (!isXRechnung) {
      errors.push({
        code: 'INVALID_XRECHNUNG',
        message: 'Die Datei entspricht nicht dem XRechnung-Format',
        location: 'document',
        severity: 'CRITICAL',
        suggestion: 'Bitte stellen Sie sicher, dass die Datei eine gültige XRechnung ist.'
      });
      return errors;
    }

    // XSD Schema validation
    try {
      const schemaContent = await this.getSchema();
      const validationResult = XMLValidator.validate(xmlContent, {
        allowBooleanAttributes: true,
        ignoreAttributes: false,
        validateXML: true,
        xsdSchema: schemaContent
      } as XMLValidationOptions);

      if (validationResult !== true) {
        const schemaErrors = Array.isArray(validationResult) ? validationResult : [validationResult];
        
        schemaErrors.forEach(error => {
          errors.push({
            code: 'VALIDATION_ERROR',
            message: error.err.msg,
            location: error.err.line ? `Line ${error.err.line}` : 'document',
            severity: 'CRITICAL',
            suggestion: 'Bitte überprüfen Sie die XML-Struktur gemäß XRechnung-Schema'
          });
        });
      }
    } catch (error) {
      errors.push({
        code: 'PROCESSING_ERROR',
        message: 'Schema-Validierung fehlgeschlagen',
        location: 'document',
        severity: 'CRITICAL',
        suggestion: 'Interner Fehler bei der Schema-Validierung'
      });
    }

    return errors;
  }
} 