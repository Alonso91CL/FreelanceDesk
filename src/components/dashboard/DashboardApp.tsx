import { useState, useEffect } from 'react';
import { repos } from '../../lib/db';
import type { Deal } from '../../lib/db/types';
import { formatCurrency } from '../../lib/formatters';

interface KpiData {
  openDeals: number;
  paidThisMonth: number;
  lostDeals: number;
  totalRevenue: number;
}

function calculateKpis(deals: Deal[]): KpiData {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let openDeals = 0;
  let paidThisMonth = 0;
  let lostDeals = 0;
  let totalRevenue = 0;

  for (const deal of deals) {
    if (deal.status === 'lost') {
      lostDeals++;
      continue;
    }

    if (deal.status === 'paid') {
      const dealDate = new Date(deal.updatedAt);
      if (dealDate.getMonth() === currentMonth && dealDate.getFullYear() === currentYear) {
        paidThisMonth += deal.result?.brutoTotal || deal.netAmount;
      }
      totalRevenue += deal.result?.brutoTotal || deal.netAmount;
      continue;
    }

    if (!['draft', 'quoted', 'sent', 'negotiating', 'accepted', 'delivered'].includes(deal.status)) {
      continue;
    }

    openDeals++;
  }

  return { openDeals, paidThisMonth, lostDeals, totalRevenue };
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-600 text-gray-200',
    quoted: 'bg-blue-600 text-white',
    sent: 'bg-blue-500 text-white',
    negotiating: 'bg-yellow-600 text-white',
    accepted: 'bg-green-600 text-white',
    delivered: 'bg-green-500 text-white',
    paid: 'bg-emerald-600 text-white',
    lost: 'bg-red-600 text-white',
  };

  const labels: Record<string, string> = {
    draft: 'Borrador',
    quoted: 'Cotizado',
    sent: 'Enviado',
    negotiating: 'Negociando',
    accepted: 'Aceptado',
    delivered: 'Entregado',
    paid: 'Pagado',
    lost: 'Perdido',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-600 text-gray-200'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function DashboardApp() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    repos.deals.list().then((d) => {
      setDeals(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-gray-400">Cargando...</div>;
  }

  const kpis = calculateKpis(deals);
  const recentDeals = deals.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard label="Deals Abiertos" value={String(kpis.openDeals)} color="text-blue-400" />
        <KpiCard label="Pagado este Mes" value={formatCurrency(kpis.paidThisMonth, 'USD')} color="text-green-400" />
        <KpiCard label="Deals Perdidos" value={String(kpis.lostDeals)} color="text-red-400" />
        <KpiCard label="Ingresos Totales" value={formatCurrency(kpis.totalRevenue, 'USD')} color="text-purple-400" />
      </div>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Últimos Deals</h2>
        {recentDeals.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No hay deals aún. Crea tu primera solicitud en{' '}
            <a href="/new" className="text-blue-400 hover:underline">Nueva Solicitud</a>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 font-medium">Título</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal) => (
                  <tr key={deal.id} className="border-b border-gray-800 last:border-0">
                    <td className="py-3 text-gray-200">{deal.title}</td>
                    <td className="py-3 text-gray-400">{deal.clientId || '-'}</td>
                    <td className="py-3">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="py-3 text-right text-gray-200">
                      {deal.result
                        ? formatCurrency(deal.result.brutoTotal, deal.currency)
                        : formatCurrency(deal.netAmount, deal.currency)}
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
