import { ValidationResult } from '../types';
import { XMLValidator } from '../utils/XMLValidator';

export async function validateXRechnung(file: File): Promise<ValidationResult> {
  const validator = new XMLValidator();
  const result = await validator.validate(file);
  
  return {
    isValid: result.valid,
    errors: result.errors.map(error => ({
      ...error,
      suggestion: 'Please check the XML structure and content'
    })),
    warnings: result.warnings
  };
} 