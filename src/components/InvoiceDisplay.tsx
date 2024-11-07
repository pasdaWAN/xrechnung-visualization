import React from 'react';
import { Receipt, Building2, User, FileText, Calendar, CreditCard, Paperclip } from 'lucide-react';
import { Attachment, XRechnungData } from '.';
import { useTranslation } from '../contexts/TranslationContext';

interface Props {
  invoice: XRechnungData;
}

const InvoiceDisplay: React.FC<Props> = ({ invoice }) => {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: invoice.currencyCode
    }).format(amount);
  };

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <Receipt className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">{t('rechnungsDetails')}</h2>
        </div>
        <div className="flex space-x-4">
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            {invoice.documentType}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('verkaeuferInfo')}</h3>
              <p className="text-gray-900">{invoice.seller.name}</p>
              <p className="text-sm text-gray-600">
                {invoice.seller.address.street}<br />
                {invoice.seller.address.postcode} {invoice.seller.address.city}<br />
                {invoice.seller.address.country}
              </p>
              {invoice.seller.vatNumber && (
                <p className="text-sm text-gray-600 mt-1">
                  {t('ustIdNr')}: {invoice.seller.vatNumber}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('kaeuferInfo')}</h3>
              <p className="text-gray-900">{invoice.buyer.name}</p>
              <p className="text-sm text-gray-600">
                {invoice.buyer.address.street}<br />
                {invoice.buyer.address.postcode} {invoice.buyer.address.city}<br />
                {invoice.buyer.address.country}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('xr:Invoice_number')}</h3>
              <p className="text-gray-900">{invoice.invoiceNumber}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('xr:Invoice_issue_date')}</h3>
              <p className="text-gray-900">{invoice.issueDate}</p>
              <p className="text-sm text-gray-600 mt-1">
                {t('xr:Payment_due_date')}: {invoice.dueDate}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('zahlungsInfo')}</h3>
              <p className="text-gray-900">{invoice.paymentMeans.type}</p>
              {invoice.paymentMeans.bankAccount?.iban && (
                <p className="text-sm text-gray-600">
                  IBAN: {invoice.paymentMeans.bankAccount.iban}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('beschreibung')}
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('menge')}
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('einzelpreis')}
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('ustSatz')}
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('gesamtpreis')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-4 text-sm text-gray-900">{item.description}</td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">{item.vatRate}%</td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                {t('gesamtpreis')}
              </td>
              <td className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                {formatCurrency(invoice.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {invoice.attachments && (
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <Paperclip className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">{t('anlagen')}</h3>
          </div>
          
          {invoice.attachments.length > 0 ? (
            <div className="grid gap-3">
              {invoice.attachments.map((attachment, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.mimeType}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-500 
                             hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {t('herunterladen')}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('keineAnlagen')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceDisplay;