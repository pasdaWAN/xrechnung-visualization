import React, { useState } from 'react';
import { XRechnungData, Attachment } from '../types/index';
import { useTranslation } from '../contexts/TranslationContext';

interface Props {
  invoiceData: XRechnungData;
}

export const InvoiceViewer: React.FC<Props> = ({ invoiceData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { t, language } = useTranslation();

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
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', { 
      style: 'currency', 
      currency: invoiceData.currencyCode 
    }).format(amount);
  };

  return (
    <div className="invoice-viewer">
      <div className="invoice-header">
        <h1>{t('uebersicht')}</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {t('uebersicht')}
          </button>
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            {t('details')}
          </button>
          <button 
            className={`tab ${activeTab === 'attachments' ? 'active' : ''}`}
            onClick={() => setActiveTab('attachments')}
          >
            {t('anlagen')}
          </button>
        </div>
      </div>
      
      <div className="invoice-content">
        {activeTab === 'overview' && (
          <>
            <section className="basic-info">
              <h2>{t('uebersichtRechnungsInfo')}</h2>
              <div className="info-grid">
                <p><strong>{t('xr:Invoice_number')}:</strong> {invoiceData.invoiceNumber}</p>
                <p><strong>{t('xr:Invoice_issue_date')}:</strong> {invoiceData.issueDate}</p>
                <p><strong>{t('xr:Payment_due_date')}:</strong> {invoiceData.dueDate}</p>
                <p><strong>{t('xr:Invoice_type_code')}:</strong> {invoiceData.documentType}</p>
                {invoiceData.notes && <p><strong>{t('_invoice-note-group')}:</strong> {invoiceData.notes}</p>}
              </div>
            </section>

            <section className="seller-info">
              <h2>{t('verkaeuferInfo')}</h2>
              <div className="info-grid">
                <p><strong>{t('name')}:</strong> {invoiceData.seller.name}</p>
                <p><strong>{t('strasse')}:</strong> {invoiceData.seller.address.street}</p>
                <p><strong>{t('plz')}:</strong> {invoiceData.seller.address.postcode}</p>
                <p><strong>{t('ort')}:</strong> {invoiceData.seller.address.city}</p>
                <p><strong>{t('land')}:</strong> {invoiceData.seller.address.country}</p>
                <p><strong>{t('steuernummer')}:</strong> {invoiceData.seller.taxId}</p>
                {invoiceData.seller.vatNumber && (
                  <p><strong>{t('ustIdNr')}:</strong> {invoiceData.seller.vatNumber}</p>
                )}
                {invoiceData.seller.contact && (
                  <>
                    {invoiceData.seller.contact.name && <p><strong>{t('ansprechpartner')}:</strong> {invoiceData.seller.contact.name}</p>}
                    {invoiceData.seller.contact.phone && <p><strong>{t('telefon')}:</strong> {invoiceData.seller.contact.phone}</p>}
                    {invoiceData.seller.contact.email && <p><strong>{t('email')}:</strong> {invoiceData.seller.contact.email}</p>}
                  </>
                )}
              </div>
            </section>

            <section className="buyer-info">
              <h2>{t('kaeuferInfo')}</h2>
              <div className="info-grid">
                <p><strong>{t('name')}:</strong> {invoiceData.buyer.name}</p>
                <p><strong>{t('strasse')}:</strong> {invoiceData.buyer.address.street}</p>
                <p><strong>{t('plz')}:</strong> {invoiceData.buyer.address.postcode}</p>
                <p><strong>{t('ort')}:</strong> {invoiceData.buyer.address.city}</p>
                <p><strong>{t('land')}:</strong> {invoiceData.buyer.address.country}</p>
              </div>
            </section>
          </>
        )}

        {activeTab === 'details' && (
          <section className="invoice-details">
            <h2>{t('rechnungsDetails')}</h2>
            <div className="info-grid">
              <p><strong>{t('xr:Invoice_number')}:</strong> {invoiceData.invoiceNumber}</p>
              <p><strong>{t('xr:Invoice_issue_date')}:</strong> {invoiceData.issueDate}</p>
              <p><strong>{t('xr:Payment_due_date')}:</strong> {invoiceData.dueDate}</p>
              <p><strong>{t('waehrung')}:</strong> {invoiceData.currencyCode}</p>
            </div>
            
            <h3>{t('rechnungspositionen')}</h3>
            <table className="line-items-table">
              <thead>
                <tr>
                  <th>{t('beschreibung')}</th>
                  <th>{t('menge')}</th>
                  <th>{t('einzelpreis')}</th>
                  <th>{t('ustSatz')}</th>
                  <th>{t('gesamtpreis')}</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{item.vatRate}%</td>
                    <td>{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'attachments' && (
          <section className="attachments">
            <h2>{t('anlagen')}</h2>
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
                      {t('herunterladen')}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>{t('keineAnlagen')}</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}; 