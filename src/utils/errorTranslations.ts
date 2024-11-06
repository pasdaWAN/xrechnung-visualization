export const translateErrorMessage = (code: string, technicalMessage: string): string => {
  const errorMessages: Record<string, string> = {
    'INVALID_STRUCTURE': 'Die Struktur der XRechnung ist nicht korrekt',
    'MISSING_FIELD': 'Ein erforderliches Feld fehlt in der XRechnung',
    'INVALID_VALUE': 'Ein Wert in der XRechnung ist ungültig',
    // Add more translations as needed
  };

  return errorMessages[code] || 'Ein unerwarteter Fehler ist aufgetreten';
};

export const getErrorSuggestion = (code: string): string => {
  const suggestions: Record<string, string> = {
    'INVALID_STRUCTURE': 'Bitte überprüfen Sie, ob die XRechnung dem korrekten Format entspricht',
    'MISSING_FIELD': 'Bitte fügen Sie alle erforderlichen Felder hinzu',
    'INVALID_VALUE': 'Bitte überprüfen Sie die eingegebenen Werte',
    // Add more suggestions as needed
  };

  return suggestions[code] || 'Bitte überprüfen Sie die XRechnung und versuchen Sie es erneut';
}; 