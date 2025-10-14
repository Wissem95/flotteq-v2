import { useState, useEffect } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { billingService, type Invoice } from '@/api/services/billing.service';
import { format } from 'date-fns';

export default function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await billingService.getInvoices();
      setInvoices(data);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      setError(err.response?.data?.message || 'Erreur de chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoiceId: string) => {
    billingService.downloadInvoice(invoiceId);
  };

  const formatAmount = (amount: number, currency: string) => {
    const value = amount / 100; // Stripe amounts are in cents
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: 'Payée', className: 'bg-green-100 text-green-700' },
      open: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
      draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
      uncollectible: { label: 'Échec', className: 'bg-red-100 text-red-700' },
      void: { label: 'Annulée', className: 'bg-gray-100 text-gray-700' },
    };

    const { label, className } = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Historique des factures</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-flotteq-blue" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Historique des factures</h2>
        </div>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Historique des factures</h2>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Aucune facture disponible</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Numéro</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Statut</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                    {invoice.number || invoice.id.slice(-8)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {format(new Date(invoice.created), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 font-semibold">
                    {formatAmount(invoice.amountPaid, invoice.currency)}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-flotteq-blue hover:text-flotteq-navy transition-colors text-sm font-medium"
                      >
                        <Download className="h-4 w-4" />
                        Voir PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
