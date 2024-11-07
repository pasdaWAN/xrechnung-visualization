import { ValidationResult } from '../types/validation';
import { XRechnungSchemaValidator } from './XRechnungSchemaValidator';

export async function validateXRechnung(file: File): Promise<ValidationResult> {
  try {
    const content = await file.text();
    const errors = await XRechnungSchemaValidator.validate(content);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      hasCriticalErrors: errors.some(e => e.severity === 'CRITICAL')
    };
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
} 