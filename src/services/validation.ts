import { ValidationResult } from '../types';
import { XMLValidator } from '../utils/XMLValidator';

export async function validateXRechnung(file: File): Promise<ValidationResult> {
  try {
    const validator = new XMLValidator();
    const result = await validator.validate(file);
    
    // Add basic XRechnung schema validation
    const content = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    
    // Check for basic XRechnung requirements
    const isXRechnung = xmlDoc.getElementsByTagName("Invoice").length > 0 || 
                       xmlDoc.getElementsByTagName("CreditNote").length > 0;
    
    if (!isXRechnung) {
      return {
        isValid: false,
        errors: [{
          code: 'INVALID_XRECHNUNG',
          message: 'Die Datei entspricht nicht dem XRechnung-Format',
          suggestion: 'Bitte stellen Sie sicher, dass die Datei eine gültige XRechnung ist.',
          location: 'document'
        }],
        warnings: []
      };
    }
    
    return {
      isValid: result.valid,
      errors: result.errors.map(error => ({
        ...error,
        suggestion: 'Bitte überprüfen Sie die XML-Struktur und den Inhalt'
      })),
      warnings: result.warnings
    };
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
} 