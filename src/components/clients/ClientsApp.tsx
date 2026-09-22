import { useState, useEffect, useCallback } from 'react';
import { repos } from '../../lib/db';
import type { Client, NewClient } from '../../lib/db/types';
import ClientList from './ClientList';
import ClientForm from './ClientForm';
import ClientDetail from './ClientDetail';

type View = 'list' | 'create' | 'edit' | 'detail';

export default function ClientsApp() {
  const [clients, setClients] = useState<Client[]>([]);
  const [view, setView] = useState<View>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(() => {
    repos.clients.list().then((c) => {
      setClients(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleCreate = async (data: NewClient) => {
    await repos.clients.create(data);
    loadClients();
    setView('list');
  };

  const handleUpdate = async (data: NewClient) => {
    if (!selectedClient) return;
    await repos.clients.update(selectedClient.id, data);
    loadClients();
    setView('list');
    setSelectedClient(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await repos.clients.delete(id);
    loadClients();
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setView('detail');
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setView('edit');
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

  if (view === 'detail' && selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        onBack={() => {
          setView('list');
          setSelectedClient(null);
        }}
        onViewDeal={(dealId) => {
          console.log('View deal:', dealId);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Clientes</h1>
      </div>
      <ClientList
        clients={clients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreateNew={() => setView('create')}
      />
    </div>
  );
}
