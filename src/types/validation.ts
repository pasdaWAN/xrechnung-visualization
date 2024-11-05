export interface ValidationError {
  code: string;
  message: string;
  location: string;
  suggestion: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  location: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
} 