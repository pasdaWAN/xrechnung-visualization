import { XRechnungData, Attachment } from '../types/index';

class XRechnungParser {
    private xmlContent: string;
    
    constructor(xmlContent: string) {
        this.xmlContent = this.cleanXmlContent(xmlContent);
    }

    private cleanXmlContent(content: string): string {
        return content.split('JVBERi')[0];
    }

    private getElementValue(doc: Document | Element, selector: string): string {
        // Using the standardized XRechnung keys from de.xml
        const element = doc instanceof Document ? 
            doc.querySelector(`xr\\:${selector}`) : 
            doc.querySelector(`[id="BT-${selector}"]`);
        return element?.textContent || '';
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

export default XRechnungParser; 