export class XMLValidator {
  async validate(file: File): Promise<{
    valid: boolean;
    errors: Array<{
      code: string;
      message: string;
      location: string;
    }>;
    warnings: Array<{
      code: string;
      message: string;
      location: string;
    }>;
  }> {
    try {
      const content = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "application/xml");
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        return {
          valid: false,
          errors: [{
            code: 'PARSE_ERROR',
            message: 'XML-Parsing fehlgeschlagen',
            location: 'root'
          }],
          warnings: []
        };
      }

      // Basic XRechnung validation
      const isUBLInvoice = xmlDoc.getElementsByTagName("Invoice").length > 0;
      const isUBLCreditNote = xmlDoc.getElementsByTagName("CreditNote").length > 0;
      const isCIIInvoice = xmlDoc.getElementsByTagName("CrossIndustryInvoice").length > 0;

      if (!isUBLInvoice && !isUBLCreditNote && !isCIIInvoice) {
        return {
          valid: false,
          errors: [{
            code: 'INVALID_ROOT',
            message: 'Kein gültiges XRechnung-Dokument gefunden',
            location: 'root'
          }],
          warnings: []
        };
      }

      // Check for CustomizationID (required for XRechnung)
      const customizationId = xmlDoc.querySelector("CustomizationID")?.textContent || 
                             xmlDoc.querySelector("ram\\:GuidelineSpecifiedDocumentContextParameter ram\\:ID")?.textContent;
      
      if (!customizationId?.includes("xrechnung")) {
        return {
          valid: false,
          errors: [{
            code: 'INVALID_CUSTOMIZATION',
            message: 'CustomizationID entspricht nicht dem XRechnung-Standard',
            location: 'CustomizationID'
          }],
          warnings: []
        };
      }

      // Check for required basic elements
      const requiredElements = [
        { tag: "ID", label: "Rechnungsnummer" },
        { tag: "IssueDate", label: "Rechnungsdatum" },
        { tag: "DocumentCurrencyCode", label: "Währung" }
      ];

      const missingElements = requiredElements.filter(elem => {
        return xmlDoc.getElementsByTagName(elem.tag).length === 0;
      });

      if (missingElements.length > 0) {
        return {
          valid: false,
          errors: missingElements.map(elem => ({
            code: 'MISSING_REQUIRED',
            message: `Pflichtfeld fehlt: ${elem.label}`,
            location: elem.tag
          })),
          warnings: []
        };
      }

      return {
        valid: true,
        errors: [],
        warnings: []
      };
    } catch (error) {
      console.error('Validation error:', error);
      return {
        valid: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unbekannter Fehler bei der Validierung',
          location: 'root'
        }],
        warnings: []
      };
    }
  }
} 