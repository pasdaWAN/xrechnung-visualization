import { ValidationError } from '../types/validation';
import { DOMParser } from 'xmldom';
import { XMLValidator } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';

interface XMLValidationOptions {
  allowBooleanAttributes?: boolean;
  ignoreAttributes?: boolean;
  validateXML?: boolean;
  xsdSchema?: string;
}

export class XRechnungSchemaValidator {
  private static readonly schemaPath = path.join(__dirname, '../xsd/xrechnung-semantic-model.xsd');
  
  static async validate(xmlContent: string): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

    // 1. Basic XML parsing validation
    if (xmlDoc.querySelector("parsererror")) {
      errors.push({
        code: 'PARSE_ERROR',
        message: 'XML-Parsing fehlgeschlagen',
        location: 'document',
        severity: 'CRITICAL'
      });
      return errors;
    }

    // 2. Document type validation
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

    // 3. XSD Schema validation
    try {
      const schemaContent = await fs.promises.readFile(this.schemaPath, 'utf-8');
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