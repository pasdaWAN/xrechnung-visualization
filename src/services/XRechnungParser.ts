import { XRechnungData, Attachment } from '../types';

export class XRechnungParser {
  private xmlDoc: Document;
  
  constructor(xmlContent: string) {
    const cleanContent = this.cleanXmlContent(xmlContent);
    const parser = new DOMParser();
    this.xmlDoc = parser.parseFromString(cleanContent, 'text/xml');
  }

  private cleanXmlContent(content: string): string {
    return content.split('JVBERi')[0]; // Remove any PDF attachments
  }

  public parse(): XRechnungData {
    return {
      id: this.getElementValue('ID'),
      documentType: this.getElementValue('InvoiceTypeCode'),
      invoiceNumber: this.getElementValue('ID'),
      issueDate: this.getElementValue('IssueDate'),
      dueDate: this.getElementValue('DueDate'),
      invoiceTypeCode: this.getElementValue('InvoiceTypeCode'),
      buyerReference: this.getElementValue('BuyerReference'),
      currencyCode: this.getElementValue('DocumentCurrencyCode'),
      notes: this.getElementValue('Note'),
      paymentTerms: this.parsePaymentTerms(),
      paymentMeans: this.parsePaymentMeans(),
      seller: this.parseSeller(),
      buyer: this.parseBuyer(),
      items: this.parseLineItems(),
      ...this.parseTotals(),
      delivery: this.parseDelivery(),
      attachments: this.parseAttachments(),
      precedingInvoiceReference: this.getElementValue('PrecedingInvoiceReference'),
      contractReference: this.getElementValue('ContractDocumentReference/ID'),
      projectReference: this.getElementValue('ProjectReference/ID')
    };
  }

  private getElementValue(tagName: string): string {
    const element = this.xmlDoc.getElementsByTagName(`cbc:${tagName}`)[0];
    return element?.textContent || '';
  }

  private parsePaymentMeans() {
    const paymentMeans = this.xmlDoc.getElementsByTagName('cac:PaymentMeans')[0];
    if (!paymentMeans) return { type: '', paymentMeansCode: '' };

    return {
      type: this.getElementValue('PaymentMeansCode'),
      paymentMeansCode: this.getElementValue('PaymentMeansCode'),
      paymentID: this.getElementValue('PaymentID'),
      bankAccount: this.parseBankAccount()
    };
  }

  private parseBankAccount() {
    const financialAccount = this.xmlDoc.getElementsByTagName('cac:FinancialAccount')[0];
    if (!financialAccount) return undefined;

    return {
      iban: this.getElementValue('ID'),
      bic: this.getElementValue('FinancialInstitutionBranch/ID'),
      bankName: this.getElementValue('FinancialInstitution/Name')
    };
  }

  private parseSeller() {
    const seller = this.xmlDoc.getElementsByTagName('cac:AccountingSupplierParty')[0];
    if (!seller) return this.createEmptyParty();

    return {
      name: this.getElementValue('PartyName/Name'),
      address: this.parseAddress(seller),
      taxId: this.getElementValue('PartyTaxScheme/CompanyID'),
      vatNumber: this.getElementValue('PartyTaxScheme/CompanyID'),
      contact: this.parseContact(seller)
    };
  }

  private parseBuyer() {
    const buyer = this.xmlDoc.getElementsByTagName('cac:AccountingCustomerParty')[0];
    if (!buyer) return this.createEmptyParty();

    return {
      name: this.getElementValue('PartyName/Name'),
      address: this.parseAddress(buyer),
      reference: this.getElementValue('BuyerReference'),
      vatNumber: this.getElementValue('PartyTaxScheme/CompanyID'),
      contact: this.parseContact(buyer)
    };
  }

  private parseAddress(party: Element) {
    const address = party.getElementsByTagName('cac:PostalAddress')[0];
    if (!address) return this.createEmptyAddress();

    return {
      street: this.getElementValue('StreetName'),
      city: this.getElementValue('CityName'),
      postcode: this.getElementValue('PostalZone'),
      country: this.getElementValue('Country/Name'),
      countryCode: this.getElementValue('Country/IdentificationCode')
    };
  }

  private parseContact(party: Element) {
    const contact = party.getElementsByTagName('cac:Contact')[0];
    if (!contact) return undefined;

    return {
      name: this.getElementValue('Name'),
      phone: this.getElementValue('Telephone'),
      email: this.getElementValue('ElectronicMail')
    };
  }

  private parseLineItems() {
    const items = this.xmlDoc.getElementsByTagName('cac:InvoiceLine');
    return Array.from(items).map(item => ({
      id: this.getElementFromNode(item, 'ID'),
      description: this.getElementFromNode(item, 'Item/Description'),
      quantity: parseFloat(this.getElementFromNode(item, 'InvoicedQuantity')),
      unitCode: this.getElementFromNode(item, 'InvoicedQuantity/@unitCode'),
      unitPrice: parseFloat(this.getElementFromNode(item, 'Price/PriceAmount')),
      vatRate: parseFloat(this.getElementFromNode(item, 'Item/ClassifiedTaxCategory/Percent')),
      lineTotal: parseFloat(this.getElementFromNode(item, 'LineExtensionAmount')),
      vatCategory: this.getElementFromNode(item, 'Item/ClassifiedTaxCategory/ID'),
      vatExemptionReason: this.getElementFromNode(item, 'Item/ClassifiedTaxCategory/TaxExemptionReason')
    }));
  }

  private parseTotals() {
    const legalMonetaryTotal = this.xmlDoc.getElementsByTagName('cac:LegalMonetaryTotal')[0];
    if (!legalMonetaryTotal) return this.createEmptyTotals();

    return {
      totalAmount: parseFloat(this.getElementValue('TaxInclusiveAmount')),
      vatTotal: parseFloat(this.getElementValue('TaxTotal/TaxAmount')),
      lineExtensionAmount: parseFloat(this.getElementValue('LineExtensionAmount')),
      taxExclusiveAmount: parseFloat(this.getElementValue('TaxExclusiveAmount')),
      taxInclusiveAmount: parseFloat(this.getElementValue('TaxInclusiveAmount')),
      payableAmount: parseFloat(this.getElementValue('PayableAmount'))
    };
  }

  private parseDelivery() {
    const delivery = this.xmlDoc.getElementsByTagName('cac:Delivery')[0];
    if (!delivery) return undefined;

    return {
      deliveryDate: this.getElementValue('ActualDeliveryDate'),
      deliveryLocation: this.parseAddress(delivery)
    };
  }

  private parseAttachments(): Attachment[] {
    const attachments = this.xmlDoc.getElementsByTagName('cac:AdditionalDocumentReference');
    return Array.from(attachments).map(attachment => ({
      id: this.getElementFromNode(attachment, 'ID'),
      filename: this.getElementFromNode(attachment, 'Attachment/EmbeddedDocumentBinaryObject/@filename'),
      mimeType: this.getElementFromNode(attachment, 'Attachment/EmbeddedDocumentBinaryObject/@mimeCode'),
      description: this.getElementFromNode(attachment, 'DocumentDescription'),
      data: this.getElementFromNode(attachment, 'Attachment/EmbeddedDocumentBinaryObject'),
      content: this.getElementFromNode(attachment, 'Attachment/EmbeddedDocumentBinaryObject')
    }));
  }

  private getElementFromNode(node: Element, path: string): string {
    const parts = path.split('/');
    let current = node;
    
    for (const part of parts) {
      if (part.startsWith('@')) {
        return current.getAttribute(part.substring(1)) || '';
      }
      const element = current.getElementsByTagName(`cbc:${part}`)[0];
      if (!element) return '';
      current = element;
    }
    
    return current.textContent || '';
  }

  private createEmptyParty() {
    return {
      name: '',
      address: this.createEmptyAddress(),
      taxId: '',
      vatNumber: '',
      contact: undefined
    };
  }

  private createEmptyAddress() {
    return {
      street: '',
      city: '',
      postcode: '',
      country: '',
      countryCode: ''
    };
  }

  private createEmptyTotals() {
    return {
      totalAmount: 0,
      vatTotal: 0,
      lineExtensionAmount: 0,
      taxExclusiveAmount: 0,
      taxInclusiveAmount: 0,
      payableAmount: 0
    };
  }

  private parsePaymentTerms(): string {
    const terms = this.xmlDoc.getElementsByTagName('cac:PaymentTerms')[0];
    if (!terms) return '';
    
    const note = terms.getElementsByTagName('cbc:Note')[0];
    return note?.textContent || '';
  }
} 