import { XRechnungData, ValidationResult } from '../components';
import { ValidationError, ValidationWarning } from '../types/validation';

class XRechnungService {
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

  static async validateXRechnung(content: string): Promise<ValidationResult> {
    const file = new File([content], 'invoice.xml', { type: 'text/xml' });
    const result = await this.validate(file);
    
    return {
      isValid: result.isValid,
      errors: result.errors.map(error => ({
        ...error,
        suggestion: 'Please check the XML structure and content'
      })),
      warnings: result.warnings
    };
  }

  static parseXRechnung(content: string): XRechnungData {
    const parser = new XRechnungParser(content);
    return parser.parse();
  }

  static async handleXRechnung(content: string): Promise<{
    isValid: boolean;
    data?: XRechnungData;
    errors?: Array<{
      code: string;
      message: string;
      location: string;
    }>;
  }> {
    try {
      const validationResult = await this.validateXRechnung(content);

      if (!validationResult.isValid) {
        return {
          isValid: false,
          errors: validationResult.errors
        };
      }

      const data = this.parseXRechnung(content);

      return {
        isValid: true,
        data
      };
    } catch (error) {
      console.error('Error processing XRechnung:', error);
      return {
        isValid: false,
        errors: [{
          code: 'PROCESSING_ERROR',
          message: 'Failed to process XRechnung document',
          location: 'document'
        }]
      };
    }
  }

  private static async validate(file: File): Promise<ValidationResult> {
    try {
      const content = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "application/xml");
      
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        return {
          isValid: false,
          errors: [{
            code: 'PARSE_ERROR',
            message: 'XML-Parsing fehlgeschlagen',
            location: 'root',
            severity: 'CRITICAL'
          }],
          warnings: []
        };
      }

      const isUBLInvoice = xmlDoc.getElementsByTagName("Invoice").length > 0;
      const isUBLCreditNote = xmlDoc.getElementsByTagName("CreditNote").length > 0;
      const isCIIInvoice = xmlDoc.getElementsByTagName("CrossIndustryInvoice").length > 0;

      if (!isUBLInvoice && !isUBLCreditNote && !isCIIInvoice) {
        errors.push({
          code: 'INVALID_ROOT',
          message: 'Kein gültiges XRechnung-Dokument gefunden',
          location: 'root',
          severity: 'CRITICAL'
        });
        return { isValid: false, errors, warnings };
      }

      const requiredFields = [
        { 
          tag: "ID", 
          label: "Rechnungsnummer",
          validator: (value: string) => value.length > 0 
        },
        { 
          tag: "IssueDate", 
          label: "Rechnungsdatum",
          validator: (value: string) => this.validateDate(value)
        },
        { 
          tag: "DocumentCurrencyCode", 
          label: "Währung",
          validator: (value: string) => value.length === 3
        }
      ];

      requiredFields.forEach(field => {
        const element = xmlDoc.getElementsByTagName(field.tag)[0];
        if (!element || !element.textContent) {
          errors.push({
            code: 'MISSING_REQUIRED',
            message: `Pflichtfeld fehlt: ${field.label}`,
            location: field.tag,
            severity: 'CRITICAL'
          });
        } else if (!field.validator(element.textContent)) {
          errors.push({
            code: 'INVALID_FORMAT',
            message: `Ungültiges Format für ${field.label}`,
            location: field.tag,
            severity: 'CRITICAL'
          });
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        errors: [{
          code: 'VALIDATION_ERROR',
          message: 'Fehler bei der Validierung',
          location: 'document',
          severity: 'WARNING'
        }],
        warnings: []
      };
    }
  }

  private static validateDate(dateStr: string): boolean {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    const ublDatePattern = /^\d{8}$/;
    
    if (!dateStr || (!isoDatePattern.test(dateStr) && !ublDatePattern.test(dateStr))) {
      return false;
    }
    
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

class XRechnungParser {
  private xmlContent: string;
  
  constructor(xmlContent: string) {
    this.xmlContent = this.cleanXmlContent(xmlContent);
  }

  private cleanXmlContent(content: string): string {
    return content.split('JVBERi')[0];
  }

  private getElementValue(doc: Document | Element, selector: string): string {
    try {
      const namespaces = {
        xr: 'urn:ce.eu:en16931:2017:xoev-de:kosit:standard:xrechnung-1',
        ram: 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
        rsm: 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100'
      };

      if (selector.includes('@')) {
        const [elementSelector, attributeName] = selector.split('/@');
        const element = doc.querySelector(elementSelector);
        return element?.getAttribute(attributeName) || '';
      }

      let element = doc.querySelector(`[id="${selector}"]`);
      if (!element) {
        const parts = selector.split('/');
        const elementName = parts[parts.length - 1];
        for (const ns of Object.keys(namespaces)) {
          element = doc.querySelector(`${ns}\\:${elementName}, ${elementName}`);
          if (element) break;
        }
      }

      return element?.textContent?.trim() || '';
    } catch (error) {
      console.warn(`Error getting value for selector ${selector}:`, error);
      return '';
    }
  }

  public parse(): XRechnungData {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(this.xmlContent, 'text/xml');
      
      return {
        id: this.getElementValue(xmlDoc, 'ID'),
        invoiceTypeCode: this.getElementValue(xmlDoc, 'InvoiceTypeCode'),
        buyerReference: this.getElementValue(xmlDoc, 'BuyerReference'),
        documentType: this.getElementValue(xmlDoc, 'InvoiceTypeCode'),
        invoiceNumber: this.getElementValue(xmlDoc, 'ID'),
        issueDate: this.getElementValue(xmlDoc, 'IssueDate'),
        dueDate: this.getElementValue(xmlDoc, 'DueDate'),
        currencyCode: this.getElementValue(xmlDoc, 'DocumentCurrencyCode'),
        notes: this.getElementValue(xmlDoc, 'Note'),
        paymentTerms: this.getElementValue(xmlDoc, 'PaymentTerms'),
        paymentMeans: this.parsePaymentMeans(xmlDoc),
        
        seller: this.parseSeller(xmlDoc),
        buyer: this.parseBuyer(xmlDoc),
        items: this.parseLineItems(xmlDoc),
        
        totalAmount: parseFloat(this.getElementValue(xmlDoc, 'TaxInclusiveAmount')) || 0,
        vatTotal: parseFloat(this.getElementValue(xmlDoc, 'TaxAmount')) || 0,
        lineExtensionAmount: parseFloat(this.getElementValue(xmlDoc, 'LineExtensionAmount')) || 0,
        taxExclusiveAmount: parseFloat(this.getElementValue(xmlDoc, 'TaxExclusiveAmount')) || 0,
        taxInclusiveAmount: parseFloat(this.getElementValue(xmlDoc, 'TaxInclusiveAmount')) || 0,
        payableAmount: parseFloat(this.getElementValue(xmlDoc, 'PayableAmount')) || 0,
        
        delivery: this.parseDelivery(xmlDoc),
        attachments: this.parseAttachments(xmlDoc),
        
        precedingInvoiceReference: this.getElementValue(xmlDoc, 'PrecedingInvoiceReference'),
        contractReference: this.getElementValue(xmlDoc, 'ContractDocumentReference/ID'),
        projectReference: this.getElementValue(xmlDoc, 'ProjectReference/ID')
      };
    } catch (error) {
      console.error('Error parsing XRechnung:', error);
      throw new Error('Failed to parse XRechnung document');
    }
  }

  private parsePaymentMeans(xmlDoc: Document) {
    return {
      type: this.getElementValue(xmlDoc, 'PaymentMeansCode'),
      paymentMeansCode: this.getElementValue(xmlDoc, 'PaymentMeansCode'),
      paymentID: this.getElementValue(xmlDoc, 'PaymentID'),
      bankAccount: {
        iban: this.getElementValue(xmlDoc, 'PaymentAccountID'),
        bic: this.getElementValue(xmlDoc, 'PaymentServiceProviderID'),
        bankName: this.getElementValue(xmlDoc, 'PaymentServiceProviderName')
      }
    };
  }

  private parseSeller(xmlDoc: Document) {
    return {
      name: this.getElementValue(xmlDoc, 'SellerName'),
      address: {
        street: this.getElementValue(xmlDoc, 'SellerStreet'),
        city: this.getElementValue(xmlDoc, 'SellerCity'),
        postcode: this.getElementValue(xmlDoc, 'SellerPostcode'),
        country: this.getElementValue(xmlDoc, 'SellerCountry'),
        countryCode: this.getElementValue(xmlDoc, 'SellerCountryCode')
      },
      taxId: this.getElementValue(xmlDoc, 'SellerTaxRegistrationID'),
      vatNumber: this.getElementValue(xmlDoc, 'SellerVATIdentifier'),
      contact: {
        name: this.getElementValue(xmlDoc, 'SellerContactName'),
        phone: this.getElementValue(xmlDoc, 'SellerContactTelephone'),
        email: this.getElementValue(xmlDoc, 'SellerContactEmail')
      }
    };
  }

  private parseBuyer(xmlDoc: Document) {
    return {
      name: this.getElementValue(xmlDoc, 'BuyerName'),
      address: {
        street: this.getElementValue(xmlDoc, 'BuyerStreet'),
        city: this.getElementValue(xmlDoc, 'BuyerCity'),
        postcode: this.getElementValue(xmlDoc, 'BuyerPostcode'),
        country: this.getElementValue(xmlDoc, 'BuyerCountry'),
        countryCode: this.getElementValue(xmlDoc, 'BuyerCountryCode')
      },
      reference: this.getElementValue(xmlDoc, 'BuyerReference'),
      vatNumber: this.getElementValue(xmlDoc, 'BuyerVATIdentifier'),
      contact: {
        name: this.getElementValue(xmlDoc, 'BuyerContactName'),
        phone: this.getElementValue(xmlDoc, 'BuyerContactTelephone'),
        email: this.getElementValue(xmlDoc, 'BuyerContactEmail')
      }
    };
  }

  private parseLineItems(xmlDoc: Document): XRechnungData['items'] {
    const items: XRechnungData['items'] = [];
    const lineItemsData = xmlDoc.querySelectorAll('InvoiceLine');
    
    lineItemsData.forEach((item) => {
      items.push({
        id: this.getElementValue(item, 'ID'),
        description: this.getElementValue(item, 'Description'),
        quantity: parseFloat(this.getElementValue(item, 'InvoicedQuantity')) || 0,
        unitCode: this.getElementValue(item, 'InvoicedQuantity/@unitCode'),
        unitPrice: parseFloat(this.getElementValue(item, 'PriceAmount')) || 0,
        vatRate: parseFloat(this.getElementValue(item, 'Percent')) || 0,
        lineTotal: parseFloat(this.getElementValue(item, 'LineExtensionAmount')) || 0,
        vatCategory: this.getElementValue(item, 'TaxCategory/ID'),
        vatExemptionReason: this.getElementValue(item, 'TaxExemptionReason')
      });
    });
    
    return items;
  }

  private parseDelivery(xmlDoc: Document) {
    const hasDeliveryInfo = xmlDoc.querySelector('Delivery');
    if (!hasDeliveryInfo) return undefined;

    return {
      deliveryDate: this.getElementValue(xmlDoc, 'ActualDeliveryDate'),
      deliveryLocation: {
        street: this.getElementValue(xmlDoc, 'DeliveryStreet'),
        city: this.getElementValue(xmlDoc, 'DeliveryCity'),
        postcode: this.getElementValue(xmlDoc, 'DeliveryPostcode'),
        country: this.getElementValue(xmlDoc, 'DeliveryCountry'),
        countryCode: this.getElementValue(xmlDoc, 'DeliveryCountryCode')
      }
    };
  }

  private parseAttachments(xmlDoc: Document): Attachment[] {
    const attachments: Attachment[] = [];
    const attachmentNodes = xmlDoc.querySelectorAll('AdditionalDocumentReference');
    
    attachmentNodes.forEach(node => {
      const filename = this.getElementValue(node, 'DocumentFileName');
      const mimeType = this.getElementValue(node, 'DocumentMimeCode');
      const content = this.getElementValue(node, 'DocumentContent');
      
      if (filename && content) {
        attachments.push({ filename, mimeType, content });
      }
    });
    
    return attachments;
  }
}

export default XRechnungService;
