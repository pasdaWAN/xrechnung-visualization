import { XRechnungData } from '../types';
import { XRechnungParser } from './XRechnungParser';

export class XRechnungService {
  static async parseXRechnung(content: string): Promise<XRechnungData> {
    try {
      const parser = new XRechnungParser(content);
      return parser.parse();
    } catch (error) {
      console.error('Error parsing XRechnung:', error);
      throw new Error('Failed to parse XRechnung document');
    }
  }

  static parseTranslations(xmlString: string): Record<string, string> {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
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
}
