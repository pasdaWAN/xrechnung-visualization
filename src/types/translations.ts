// Base translation keys from XML files
type PrefixedTranslationKey =
  | `xr:${string}`  // Allows any xr: prefixed key
  | `error.${string}` // Allows any error. prefixed key
  | `error.suggestion.${string}` // Allows any error.suggestion. prefixed key
  | `_${string}`; // Allows any _ prefixed key

// Existing specific translation keys
type SpecificTranslationKey =
  | 'error.INVALID_STRUCTURE'
  | 'error.MISSING_FIELD'
  | 'error.INVALID_VALUE'
  | 'error.unexpected'
  | 'error.suggestion.INVALID_STRUCTURE'
  | 'error.suggestion.MISSING_FIELD'
  | 'error.suggestion.INVALID_VALUE'
  | 'error.suggestion.default'
  | 'validierungsfehler'
  | 'problem'
  | 'schliessen'
  | 'uebersicht'
  | 'details'
  | 'anlagen'
  | 'uebersichtRechnungsInfo'
  | 'verkaeuferInfo'
  | 'kaeuferInfo'
  | 'rechnungsDetails'
  | 'rechnungspositionen'
  | '_invoice-note-group'
  | '_description'
  | '_price'
  | '_total'
  | 'name'
  | 'strasse'
  | 'plz'
  | 'ort'
  | 'land'
  | 'steuernummer'
  | 'ustIdNr'
  | 'ansprechpartner'
  | 'telefon'
  | 'email'
  | 'waehrung'
  | 'beschreibung'
  | 'menge'
  | 'einzelpreis'
  | 'ustSatz'
  | 'gesamtpreis'
  | 'herunterladen'
  | 'keineAnlagen'
  | 'uploadXRechnung'
  | 'uploadAnother'
  | 'processingFile'
  | 'zahlungsInfo'
  | 'footer.text';  // Adding missing key used in InvoiceDisplay

// Combined translation key type
export type TranslationKey = PrefixedTranslationKey | SpecificTranslationKey;

// Type-safe translation function
export type TranslationFunction = (key: TranslationKey) => string;