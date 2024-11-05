import React, { useState } from 'react';
import { XRechnungData, Attachment } from '../types/index';

interface Props {
  invoiceData: XRechnungData;
}

export const InvoiceViewer: React.FC<Props> = ({ invoiceData }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleDownload = (attachment: Attachment) => {
    const blob = new Blob([atob(attachment.content)], { type: attachment.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: invoiceData.currencyCode 
    }).format(amount);
  };

  return (
    <div className="invoice-viewer">
      <div className="invoice-header">
        <h1>XRechnung Viewer</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Übersicht
          </button>
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`tab ${activeTab === 'attachments' ? 'active' : ''}`}
            onClick={() => setActiveTab('attachments')}
          >
            Anlagen
          </button>
        </div>
      </div>
      
      <div className="invoice-content">
        {activeTab === 'overview' && (
          <>
            <section className="basic-info">
              <h2>Rechnungsinformationen</h2>
              <div className="info-grid">
                <p><strong>Rechnungsnummer:</strong> {invoiceData.invoiceNumber}</p>
                <p><strong>Rechnungsdatum:</strong> {invoiceData.issueDate}</p>
                <p><strong>Fälligkeitsdatum:</strong> {invoiceData.dueDate}</p>
                <p><strong>Dokumentenart:</strong> {invoiceData.documentType}</p>
                {invoiceData.notes && <p><strong>Bemerkungen:</strong> {invoiceData.notes}</p>}
              </div>
            </section>

            <section className="seller-info">
              <h2>Verkäuferinformationen</h2>
              <div className="info-grid">
                <p><strong>Name:</strong> {invoiceData.seller.name}</p>
                <p><strong>Straße:</strong> {invoiceData.seller.address.street}</p>
                <p><strong>PLZ:</strong> {invoiceData.seller.address.postcode}</p>
                <p><strong>Ort:</strong> {invoiceData.seller.address.city}</p>
                <p><strong>Land:</strong> {invoiceData.seller.address.country}</p>
                <p><strong>Steuernummer:</strong> {invoiceData.seller.taxId}</p>
                {invoiceData.seller.vatNumber && (
                  <p><strong>USt-IdNr.:</strong> {invoiceData.seller.vatNumber}</p>
                )}
                {invoiceData.seller.contact && (
                  <>
                    {invoiceData.seller.contact.name && <p><strong>Ansprechpartner:</strong> {invoiceData.seller.contact.name}</p>}
                    {invoiceData.seller.contact.phone && <p><strong>Telefon:</strong> {invoiceData.seller.contact.phone}</p>}
                    {invoiceData.seller.contact.email && <p><strong>E-Mail:</strong> {invoiceData.seller.contact.email}</p>}
                  </>
                )}
              </div>
            </section>

            <section className="buyer-info">
              <h2>Käuferinformationen</h2>
              <div className="info-grid">
                <p><strong>Name:</strong> {invoiceData.buyer.name}</p>
                <p><strong>Straße:</strong> {invoiceData.buyer.address.street}</p>
                <p><strong>PLZ:</strong> {invoiceData.buyer.address.postcode}</p>
                <p><strong>Ort:</strong> {invoiceData.buyer.address.city}</p>
                <p><strong>Land:</strong> {invoiceData.buyer.address.country}</p>
              </div>
            </section>
          </>
        )}

        {activeTab === 'details' && (
          <section className="invoice-details">
            <h2>Invoice Details</h2>
            <div className="info-grid">
              <p><strong>Invoice Number:</strong> {invoiceData.invoiceNumber}</p>
              <p><strong>Issue Date:</strong> {invoiceData.issueDate}</p>
              <p><strong>Due Date:</strong> {invoiceData.dueDate}</p>
              <p><strong>Currency:</strong> {invoiceData.currencyCode}</p>
            </div>
            
            <h3>Line Items</h3>
            <table className="line-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>VAT Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitPrice}</td>
                    <td>{item.vatRate}%</td>
                    <td>{item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'attachments' && (
          <section className="attachments">
            <h2>Attachments</h2>
            {invoiceData.attachments?.length ? (
              <div className="attachments-list">
                {invoiceData.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <span className="attachment-icon">📎</span>
                    <span className="attachment-name">{attachment.filename}</span>
                    <span className="attachment-type">{attachment.mimeType}</span>
                    <button 
                      className="attachment-download"
                      onClick={() => handleDownload(attachment)}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No attachments available</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}; 