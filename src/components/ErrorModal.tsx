import React from 'react';

interface ErrorModalProps {
  errors: Array<{
    code: string;
    message: string;
    suggestion?: string;
  }>;
  onClose: () => void;
  isOpen: boolean;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ errors, onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Validierungsfehler</h2>
          <button className="close-icon" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {errors.map((error, index) => (
            <div key={index} className="error-card">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h3>Problem #{index + 1}</h3>
                <p className="error-message">{error.message}</p>
                {error.suggestion && (
                  <p className="error-suggestion">{error.suggestion}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="button-primary">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}; 