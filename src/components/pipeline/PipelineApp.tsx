import { useState, useEffect, useCallback } from 'react';
import { GripVertical, ArrowLeftRight, Plus } from 'lucide-react';
import { repos } from '../../lib/db';
import type { Deal, Client, DealStatus, NewDeal } from '../../lib/db/types';
import KanbanBoard from './KanbanBoard';
import DealForm from './DealForm';
import DealDetail from './DealDetail';

const DRAG_ENABLED_KEY = 'freelancedesk:pipelineDragEnabled';

type View = 'board' | 'create' | 'edit' | 'detail';

export default function PipelineApp() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [view, setView] = useState<View>('board');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragEnabled, setDragEnabled] = useState(() => {
    const stored = localStorage.getItem(DRAG_ENABLED_KEY);
    return stored !== null ? stored === 'true' : true;
  });

  const selectedDeal = deals.find((d) => d.id === selectedDealId);
  const selectedClient = selectedDeal ? clients.find((c) => c.id === selectedDeal.clientId) : undefined;

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

  const handleCreateDeal = async (data: NewDeal) => {
    const result = await repos.deals.create(data);
    const calcInput = {
      netAmount: data.netAmount,
      currency: data.currency,
      paypalPercent: data.paypalPercent,
      paypalFixedUSD: data.paypalFixedUSD,
      siiPercent: data.siiPercent,
      usdRate: data.usdRate,
    };
    const { calculateReverse } = await import('../../lib/calculations');
    const calcResult = calculateReverse(calcInput);
    await repos.deals.update(result.id, { result: calcResult });
    loadData();
    setView('board');
  };

  const handleUpdateDeal = async (data: NewDeal) => {
    if (!selectedDealId) return;
    const calcInput = {
      netAmount: data.netAmount,
      currency: data.currency,
      paypalPercent: data.paypalPercent,
      paypalFixedUSD: data.paypalFixedUSD,
      siiPercent: data.siiPercent,
      usdRate: data.usdRate,
    };
    const { calculateReverse } = await import('../../lib/calculations');
    const calcResult = calculateReverse(calcInput);
    await repos.deals.update(selectedDealId, { ...data, result: calcResult });
    loadData();
    setView('board');
    setSelectedDealId(null);
  };

  const handleDealClick = (dealId: string) => {
    setSelectedDealId(dealId);
    setView('detail');
  };

  const toggleDrag = () => {
    const newValue = !dragEnabled;
    setDragEnabled(newValue);
    localStorage.setItem(DRAG_ENABLED_KEY, String(newValue));
  };

  const navigateToCalculator = () => {
    window.location.href = '/new';
  };

  if (loading) {
    return <div className="text-gray-400">Cargando pipeline...</div>;
  }

  if (view === 'create') {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold mb-4">Nuevo Deal</h1>
        <div className="card p-6">
          <DealForm
            clients={clients}
            onSave={handleCreateDeal}
            onCancel={() => setView('board')}
            onNavigateToCalculator={navigateToCalculator}
          />
        </div>
      </div>
    );
  }

  if (view === 'edit' && selectedDeal) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold mb-4">Editar Deal</h1>
        <div className="card p-6">
          <DealForm
            deal={selectedDeal}
            clients={clients}
            onSave={handleUpdateDeal}
            onCancel={() => {
              setView('board');
              setSelectedDealId(null);
            }}
            onNavigateToCalculator={navigateToCalculator}
          />
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedDeal) {
    return (
      <DealDetail
        deal={selectedDeal}
        client={selectedClient}
        onBack={() => {
          setView('board');
          setSelectedDealId(null);
        }}
        onUpdate={() => {
          loadData();
          setView('board');
          setSelectedDealId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pipeline</h1>
        <div className="flex items-center gap-3">
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
            {dragEnabled ? 'Drag ON' : 'Drag OFF'}
          </button>
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <Plus size={16} />
            Nuevo Deal
          </button>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-400 mb-4">
            No hay deals en el pipeline. Crea tu primer proyecto.
          </p>
          <button
            onClick={() => setView('create')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <Plus size={16} />
            Nuevo Deal
          </button>
        </div>
      ) : (
        <KanbanBoard
          deals={deals}
          clients={clients}
          onMoveDeal={handleMoveDeal}
          dragEnabled={dragEnabled}
          onDealClick={handleDealClick}
        />
      )}
    </div>
  );
}
