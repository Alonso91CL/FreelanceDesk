import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Trash2 } from 'lucide-react';
import { repos } from '../../lib/db';
import type { Deal, Client, Document } from '../../lib/db/types';
import { formatCurrency } from '../../lib/formatters';
import {
  downloadQuotePdf,
  downloadPaymentRequestPdf,
  downloadReminderPdf,
  type QuoteData,
  type ReminderData,
  type PaymentRequestData,
} from '../../lib/pdf';

interface DealDetailProps {
  deal: Deal;
  client?: Client;
  onBack: () => void;
  onUpdate: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  quoted: 'Cotizado',
  sent: 'Enviado',
  negotiating: 'Negociando',
  accepted: 'Aceptado',
  delivered: 'Entregado',
  paid: 'Pagado',
  lost: 'Perdido',
};

export default function DealDetail({ deal, client, onBack, onUpdate }: DealDetailProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    repos.documents.listByDeal(deal.id).then((docs) => {
      setDocuments(docs);
      setLoading(false);
    });
  }, [deal.id]);

  const refreshDocuments = () => {
    repos.documents.listByDeal(deal.id).then(setDocuments);
  };

  const generateDocument = async (type: 'quote' | 'payment_request' | 'reminder') => {
    const settings = await repos.settings.getDefaultSettings();
    const profile = settings.profile;
    const date = new Date().toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const result = deal.result || {
      brutoNacional: deal.netAmount,
      brutoTotal: deal.netAmount,
      montoSii: 0,
      montoPaypal: 0,
      paypalFixedInCurrency: 0,
    };

    const dealData = {
      ...deal,
      profile,
      client: client || { id: '', workspaceId: '', name: '', createdAt: '', updatedAt: '' },
    };

    if (type === 'quote') {
      const number = await repos.settings.nextNumber('quote');
      const data: QuoteData = {
        quoteId: number,
        client: { name: client?.name || '', company: client?.company, email: client?.email, country: client?.country },
        serviceDesc: deal.description || deal.title,
        currency: deal.currency,
        date,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL'),
        result,
        netAmount: deal.netAmount,
        siiPercent: deal.siiPercent,
        profile,
      };
      downloadQuotePdf(data);
      await repos.documents.create({ dealId: deal.id, type, number, data: dealData });
    } else if (type === 'payment_request') {
      const number = await repos.settings.nextNumber('paymentRequest');
      const data: PaymentRequestData = {
        solicitudId: number,
        clientName: client?.name || '',
        serviceDesc: deal.description || deal.title,
        currency: deal.currency,
        date,
        result,
        netAmount: deal.netAmount,
        siiPercent: deal.siiPercent,
        profile,
      };
      downloadPaymentRequestPdf(data);
      await repos.documents.create({ dealId: deal.id, type, number, data: dealData });
    } else {
      const number = await repos.settings.nextNumber('reminder');
      const data: ReminderData = {
        reminderId: number,
        client: { name: client?.name || '', company: client?.company, email: client?.email, country: client?.country },
        serviceDesc: deal.description || deal.title,
        currency: deal.currency,
        date,
        dueAmount: result.brutoTotal,
        pendingSince: new Date(deal.createdAt).toLocaleDateString('es-CL'),
        profile,
      };
      downloadReminderPdf(data);
      await repos.documents.create({ dealId: deal.id, type, number, data: dealData });
    }

    refreshDocuments();
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este deal?')) return;
    setDeleting(true);
    await repos.deals.delete(deal.id);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al pipeline
      </button>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{deal.title}</h1>
            <p className="text-gray-400 mt-1">{deal.description}</p>
            {client && (
              <p className="text-sm text-blue-400 mt-2">
                <a href={`/clients?id=${client.id}`} className="hover:underline">
                  {client.name}
                </a>
              </p>
            )}
          </div>
          <div className="text-right space-y-2">
            <span className="inline-block px-3 py-1 rounded text-sm bg-gray-700 text-gray-300">
              {STATUS_LABELS[deal.status] || deal.status}
            </span>
            <p className="text-xl font-bold text-green-400">
              {deal.result
                ? formatCurrency(deal.result.brutoTotal, deal.currency)
                : formatCurrency(deal.netAmount, deal.currency)}
            </p>
          </div>
        </div>
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText size={18} />
            Documentos
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateDocument('quote')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            >
              <Download size={14} />
              Cotización
            </button>
            <button
              onClick={() => generateDocument('payment_request')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
            >
              <Download size={14} />
              Solicitud de Pago
            </button>
            <button
              onClick={() => generateDocument('reminder')}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm"
            >
              <Download size={14} />
              Recordatorio
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : documents.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay documentos generados para este deal.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded"
              >
                <div>
                  <p className="text-sm text-gray-200">{doc.number}</p>
                  <p className="text-xs text-gray-400 capitalize">{doc.type.replace('_', ' ')}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString('es-CL')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-6 border-red-900/50">
        <h2 className="text-lg font-semibold mb-4 text-red-400">Zona de Peligro</h2>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900 text-red-300 px-4 py-2 rounded transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
          {deleting ? 'Eliminando...' : 'Eliminar Deal'}
        </button>
      </section>
    </div>
  );
}
