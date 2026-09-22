import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, FileText } from 'lucide-react';
import { repos } from '../../lib/db';
import type { Client, NewClient, Deal } from '../../lib/db/types';
import ClientForm from './ClientForm';

type View = 'list' | 'create' | 'edit';

export default function ClientsApp() {
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [view, setView] = useState<View>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const loadData = useCallback(() => {
    Promise.all([repos.clients.list(), repos.deals.list()]).then(([c, d]) => {
      setClients(c);
      setDeals(d);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getClientStats = useCallback(
    (clientId: string) => {
      const clientDeals = deals.filter((d) => d.clientId === clientId);
      const totalRevenue = clientDeals.reduce(
        (sum, d) => sum + (d.result?.brutoTotal || d.netAmount),
        0
      );
      const activeDeals = clientDeals.filter(
        (d) => !['paid', 'lost'].includes(d.status)
      ).length;
      return { totalDeals: clientDeals.length, totalRevenue, activeDeals };
    },
    [deals]
  );

  const filtered = useMemo(() => {
    let result = clients;
    const q = search.toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.country?.toLowerCase().includes(q) ||
          c.source?.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q)
      );
    }
    if (sourceFilter) {
      result = result.filter((c) => c.source === sourceFilter);
    }
    return result;
  }, [clients, search, sourceFilter]);

  const handleCreate = async (data: NewClient) => {
    await repos.clients.create(data);
    loadData();
    setView('list');
  };

  const handleUpdate = async (data: NewClient) => {
    if (!selectedClient) return;
    await repos.clients.update(selectedClient.id, data);
    loadData();
    setView('list');
    setSelectedClient(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await repos.clients.delete(id);
    loadData();
  };

  if (loading) {
    return <div className="text-gray-400">Cargando...</div>;
  }

  if (view === 'create') {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold mb-4">Nuevo Cliente</h1>
        <div className="card p-6">
          <ClientForm onSave={handleCreate} onCancel={() => setView('list')} />
        </div>
      </div>
    );
  }

  if (view === 'edit' && selectedClient) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold mb-4">Editar Cliente</h1>
        <div className="card p-6">
          <ClientForm
            client={selectedClient}
            onSave={handleUpdate}
            onCancel={() => {
              setView('list');
              setSelectedClient(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Clientes ({clients.length})</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas las fuentes</option>
            <option value="referral">Referido</option>
            <option value="linkedin">LinkedIn</option>
            <option value="upwork">Upwork</option>
            <option value="other">Otro</option>
          </select>
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded whitespace-nowrap"
          >
            <Plus size={16} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-400 mb-4">No hay clientes registrados.</p>
          <button
            onClick={() => setView('create')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <Plus size={16} />
            Crear primer cliente
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700 bg-gray-800/50">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">País</th>
                  <th className="px-4 py-3 font-medium">Fuente</th>
                  <th className="px-4 py-3 font-medium text-center">Deals</th>
                  <th className="px-4 py-3 font-medium">Activos</th>
                  <th className="px-4 py-3 font-medium text-right">Ingresos</th>
                  <th className="px-4 py-3 font-medium">Desde</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const stats = getClientStats(client.id);
                  return (
                    <tr
                      key={client.id}
                      className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-200">{client.name}</td>
                      <td className="px-4 py-3 text-gray-400">{client.company || '-'}</td>
                      <td className="px-4 py-3 text-gray-400">{client.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-400">{client.country || '-'}</td>
                      <td className="px-4 py-3">
                        {client.source ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 capitalize">
                            {client.source}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-300">{stats.totalDeals}</td>
                      <td className="px-4 py-3 text-center text-gray-300">{stats.activeDeals}</td>
                      <td className="px-4 py-3 text-right text-green-400 font-medium">
                        ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(client.createdAt).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setView('edit');
                            }}
                            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                            aria-label="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="p-1.5 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && clients.length > 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No se encontraron clientes con esos filtros.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
