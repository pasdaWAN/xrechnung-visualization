export const messages = {
  // System messages
  'no-script': 'Inhalte auf dieser Seite sind ohne JavaScript nur eingeschränkt darstellbar.',
  '_disclaimer': 'Wir übernehmen keine Haftung für die Richtigkeit der Daten.',
  'no-data': 'Keine Daten vorhanden',
  '_no-content': 'Bereiche ohne Inhalte werden nicht dargestellt!',

  // Error messages
  'error.INVALID_STRUCTURE': 'Ungültige Dokumentstruktur',
  'error.MISSING_FIELD': 'Pflichtfeld fehlt',
  'error.INVALID_VALUE': 'Ungültiger Wert',
  'error.PROCESSING_ERROR': 'Verarbeitungsfehler',
  'error.PARSE_ERROR': 'XML-Parsing fehlgeschlagen',
  'error.INVALID_ROOT': 'Kein gültiges XRechnung-Dokument gefunden',
  'error.MISSING_REQUIRED': 'Pflichtfeld fehlt',
  'error.INVALID_FORMAT': 'Ungültiges Format',
  'error.VALIDATION_ERROR': 'Validierungsfehler',
  'error.INVALID_XRECHNUNG': 'Ungültiges XRechnung-Format',
  'error.unexpected': 'Ein unerwarteter Fehler ist aufgetreten',

  // Error suggestions
  'error.suggestion.default': 'Bitte überprüfen Sie das Dokument und versuchen Sie es erneut',
  'error.suggestion.INVALID_STRUCTURE': 'Bitte stellen Sie sicher, dass die XML-Struktur korrekt ist',
  'error.suggestion.MISSING_FIELD': 'Bitte füllen Sie alle Pflichtfelder aus',
  'error.suggestion.INVALID_VALUE': 'Bitte überprüfen Sie den eingegebenen Wert',

  // UI elements
  'validierungsfehler': 'Validierungsfehler',
  'problem': 'Problem',
  'schliessen': 'Schließen',
  'uebersicht': 'Übersicht',
  'details': 'Details',
  'anlagen': 'Anlagen',
  'uebersichtRechnungsInfo': 'Rechnungsinformationen',
  'verkaeuferInfo': 'Verkäuferinformationen',
  'kaeuferInfo': 'Käuferinformationen',
  'rechnungsDetails': 'Rechnungsdetails',
  'rechnungspositionen': 'Rechnungspositionen',
  'zahlungsInfo': 'Zahlungsinformationen',

  // Invoice related
  '_invoice-note-group': 'Bemerkungen zur Rechnung',
  '_net': 'netto',
  '_gross': 'brutto',
  '_description': 'Beschreibung',
  '_price': 'Preis',
  '_price-unit': 'Preiseinheit',
  '_vat': 'USt. Satz',
  '_tax-code': 'St. Code',
  '_total': 'Gesamt',
  '_page': 'Seite',

  // Fields
  'name': 'Name',
  'strasse': 'Straße',
  'plz': 'PLZ',
  'ort': 'Ort',
  'land': 'Land',
  'steuernummer': 'Steuernummer',
  'ustIdNr': 'USt-IdNr.',
  'ansprechpartner': 'Ansprechpartner',
  'telefon': 'Telefon',
  'email': 'E-Mail',
  'waehrung': 'Währung',
  'beschreibung': 'Beschreibung',
  'menge': 'Menge',
  'einzelpreis': 'Einzelpreis',
  'ustSatz': 'USt-Satz',
  'gesamtpreis': 'Gesamtpreis',

  // Actions
  '_open': 'Öffnen',
  'herunterladen': 'Herunterladen',
  'keineAnlagen': 'Keine Anlagen vorhanden',
  'uploadXRechnung': 'XRechnung validieren',
  'uploadAnother': 'Weitere Datei hochladen',
  'processingFile': 'Datei wird verarbeitet',

  // Footer
  'footer.text': '© 2024 XRechnungsViewer powered by Robaws. Alle Rechte vorbehalten.'
} as const;

export type MessageKey = keyof typeof messages;