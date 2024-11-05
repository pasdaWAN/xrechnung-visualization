export interface XRechnungData {
  // Document Level
  id: string;
  documentType: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  invoiceTypeCode: string;
  buyerReference: string;
  currencyCode: string;
  notes?: string;
  paymentTerms?: string;
  paymentMeans: {
    type: string;
    paymentMeansCode: string;
    paymentID?: string;
    bankAccount?: {
      iban: string;
      bic?: string;
      bankName?: string;
    };
  };
  
  // Seller Information
  seller: {
    name: string;
    address: {
      street: string;
      city: string;
      postcode: string;
      country: string;
      countryCode: string;
    };
    taxId: string;
    vatNumber?: string;
    contact?: {
      name?: string;
      phone?: string;
      email?: string;
    };
  };
  
  // Buyer Information
  buyer: {
    name: string;
    address: {
      street: string;
      city: string;
      postcode: string;
      country: string;
      countryCode: string;
    };
    reference?: string;
    vatNumber?: string;
    contact?: {
      name?: string;
      phone?: string;
      email?: string;
    };
  };
  
  // Line Items
  items: Array<{
    id: string | number;
    description: string;
    quantity: number;
    unitCode: string;
    unitPrice: number;
    vatRate: number;
    lineTotal: number;
    vatCategory: string;
    vatExemptionReason?: string;
  }>;
  
  // Totals
  totalAmount: number;
  vatTotal: number;
  lineExtensionAmount: number;
  taxExclusiveAmount: number;
  taxInclusiveAmount: number;
  payableAmount: number;
  
  // Delivery Information
  delivery?: {
    deliveryDate?: string;
    deliveryLocation?: {
      street: string;
      city: string;
      postcode: string;
      country: string;
      countryCode: string;
    };
  };

  // Attachments
  attachments?: Array<Attachment>;
  
  // Additional Fields
  precedingInvoiceReference?: string;
  contractReference?: string;
  projectReference?: string;
}

export interface Attachment {
    filename: string;
    mimeType: string;
    content: string;
  }

export * from './validation';