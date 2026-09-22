import { useState, useEffect, useCallback } from 'react';
import { GripVertical, ArrowLeftRight } from 'lucide-react';
import { repos } from '../../lib/db';
import type { Deal, Client, DealStatus } from '../../lib/db/types';
import KanbanBoard from './KanbanBoard';

const DRAG_ENABLED_KEY = 'freelancedesk:pipelineDragEnabled';

export default function PipelineApp() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragEnabled, setDragEnabled] = useState(() => {
    const stored = localStorage.getItem(DRAG_ENABLED_KEY);
    return stored !== null ? stored === 'true' : true;
  });

  const loadData = useCallback(() => {
    Promise.all([repos.deals.list(), repos.clients.list()]).then(([d, c]) => {
      setDeals(d);
      setClients(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMoveDeal = useCallback(
    (dealId: string, newStatus: DealStatus) => {
      repos.deals.updateStatus(dealId, newStatus).then(() => {
        loadData();
      });
    },
    [loadData]
  );

  const toggleDrag = () => {
    const newValue = !dragEnabled;
    setDragEnabled(newValue);
    localStorage.setItem(DRAG_ENABLED_KEY, String(newValue));
  };

  if (loading) {
    return <div className="text-gray-400">Cargando pipeline...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pipeline</h1>
        <button
          onClick={toggleDrag}
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
            dragEnabled
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title={dragEnabled ? 'Desactivar drag & drop' : 'Activar drag & drop'}
        >
          {dragEnabled ? <GripVertical size={14} /> : <ArrowLeftRight size={14} />}
          {dragEnabled ? 'Drag activado' : 'Drag desactivado'}
        </button>
      </div>

      {deals.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-400 mb-4">
            No hay deals en el pipeline. Crea una solicitud para empezar.
          </p>
          <a
            href="/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Crear Solicitud
          </a>
        </div>
      ) : (
        <KanbanBoard
          deals={deals}
          clients={clients}
          onMoveDeal={handleMoveDeal}
          dragEnabled={dragEnabled}
        />
      )}
    </div>
  );
}
