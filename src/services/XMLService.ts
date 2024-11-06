export class XMLService {
  private static parseXML(content: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(content, 'text/xml');
  }

  static parseTranslations(xmlString: string): Record<string, string> {
    const xmlDoc = this.parseXML(xmlString);
    const entries = xmlDoc.querySelectorAll('entry');
    const translations: Record<string, string> = {};
    
    entries.forEach(entry => {
      const key = entry.getAttribute('key');
      if (key) {
        translations[key] = entry.textContent || key;
      }
    });
    
    return translations;
  }

  static validateXRechnung(content: string) {
    const xmlDoc = this.parseXML(content);
    // Move validation logic from XMLValidator.ts here
    // This ensures consistent XML parsing across the application
  }

  static parseXRechnung(content: string) {
    const xmlDoc = this.parseXML(content);
    // Move parsing logic from XRechnungParser.ts here
    // This ensures consistent XML handling
  }
} 