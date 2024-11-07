export type ErrorSeverity = 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';

export type ErrorCode = 
  | 'INVALID_STRUCTURE' 
  | 'MISSING_FIELD' 
  | 'INVALID_VALUE'
  | 'PROCESSING_ERROR'
  | 'PARSE_ERROR'
  | 'INVALID_ROOT'
  | 'MISSING_REQUIRED'
  | 'INVALID_FORMAT'
  | 'VALIDATION_ERROR'
  | 'INVALID_XRECHNUNG';

export interface ValidationError {
  code: ErrorCode;
  message: string;
  location: string;
  severity: ErrorSeverity;
  suggestion?: string;
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
  hasCriticalErrors?: boolean;
} 