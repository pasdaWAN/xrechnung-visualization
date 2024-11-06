import React from 'react';
import { ValidationResult } from '../types';

interface Props {
  result: ValidationResult;
}

export const ValidationSummary: React.FC<Props> = ({ result }) => {
  return (
    <div className="validation-summary">
      <h2>Validation Results</h2>
      <div className="validation-status">
        <span className={`status-badge ${result.isValid ? 'valid' : 'invalid'}`}>
          {result.isValid ? 'Valid' : 'Invalid'}
        </span>
      </div>
      
      {result.errors.length > 0 && (
        <div className="validation-errors">
          <h3>Errors</h3>
          <ul>
            {result.errors.map((error, index) => (
              <li key={index}>
                <strong>{error.code}:</strong> {error.message}
                {error.suggestion && (
                  <p className="suggestion">Suggestion: {error.suggestion}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="validation-warnings">
          <h3>Warnings</h3>
          <ul>
            {result.warnings.map((warning, index) => (
              <li key={index}>
                <strong>{warning.code}:</strong> {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 