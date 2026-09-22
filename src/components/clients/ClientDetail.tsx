import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Mail, Globe, Calendar, FileText } from 'lucide-react';
import { repos } from '../../lib/db';
import type { Client, Deal } from '../../lib/db/types';
import { formatCurrency } from '../../lib/formatters';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
  onViewDeal: (dealId: string) => void;
}

export default function ClientDetail({ client, onBack, onViewDeal }: ClientDetailProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    repos.deals.listByClient(client.id).then((d) => {
      setDeals(d);
      setLoading(false);
    });
  }, [client.id]);

  const totalRevenue = deals.reduce((sum, d) => sum + (d.result?.brutoTotal || d.netAmount), 0);
  const activeDeals = deals.filter((d) => !['paid', 'lost'].includes(d.status)).length;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a clientes
      </button>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{client.name}</h1>
            {client.company && (
              <p className="text-gray-400 flex items-center gap-2 mt-2">
                <Building2 size={16} />
                {client.company}
              </p>
            )}
            {client.email && (
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <Mail size={16} />
                {client.email}
              </p>
            )}
            {client.country && (
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <Globe size={16} />
                {client.country}
              </p>
            )}
            {client.source && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-blue-900/50 text-blue-300 capitalize">
                {client.source}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 flex items-center gap-1 justify-end">
              <Calendar size={12} />
              Cliente desde {new Date(client.createdAt).toLocaleDateString('es-CL')}
            </p>
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">{client.notes}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-400">Total Deals</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{deals.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-400">Deals Activos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{activeDeals}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-400">Ingresos Totales</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(totalRevenue, 'USD')}</p>
        </div>
      </div>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText size={18} />
          Deals Asociados
        </h2>
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : deals.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay deals para este cliente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 font-medium">Título</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium text-right">Monto</th>
                  <th className="pb-3 font-medium text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => onViewDeal(deal.id)}
                  >
                    <td className="py-3 text-gray-200">{deal.title}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 capitalize">
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-200">
                      {deal.result
                        ? formatCurrency(deal.result.brutoTotal, deal.currency)
                        : formatCurrency(deal.netAmount, deal.currency)}
                    </td>
                    <td className="py-3 text-right text-gray-400">
                      {new Date(deal.createdAt).toLocaleDateString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
