import { useState, useMemo } from 'react';
import { Search, Building2, Mail, Globe, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Client } from '../../lib/db/types';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onView: (client: Client) => void;
  onCreateNew: () => void;
}

export default function ClientList({ clients, onEdit, onDelete, onView, onCreateNew }: ClientListProps) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const filtered = useMemo(() => {
    let result = clients;
    const q = search.toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.country?.toLowerCase().includes(q)
      );
    }
    if (sourceFilter) {
      result = result.filter((c) => c.source === sourceFilter);
    }
    return result;
  }, [clients, search, sourceFilter]);

  if (clients.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-400 mb-4">No hay clientes registrados.</p>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <Plus size={16} />
          Crear primer cliente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa, email, país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded pl-10 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las fuentes</option>
          <option value="referral">Referido</option>
          <option value="linkedin">LinkedIn</option>
          <option value="upwork">Upwork</option>
          <option value="other">Otro</option>
        </select>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded whitespace-nowrap"
        >
          <Plus size={16} />
          Nuevo Cliente
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">No se encontraron clientes.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => onEdit(client)}
              onDelete={() => onDelete(client.id)}
              onView={() => onView(client)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ClientCardProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

function ClientCard({ client, onEdit, onDelete, onView }: ClientCardProps) {
  return (
    <div className="card p-4 flex flex-col">
      <button onClick={onView} className="text-left flex-1">
        <h3 className="font-semibold text-gray-100 hover:text-blue-400 transition-colors">
          {client.name}
        </h3>
        {client.company && (
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <Building2 size={12} />
            {client.company}
          </p>
        )}
        {client.email && (
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <Mail size={12} />
            {client.email}
          </p>
        )}
        {client.country && (
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <Globe size={12} />
            {client.country}
          </p>
        )}
      </button>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
          aria-label="Editar"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400"
          aria-label="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
