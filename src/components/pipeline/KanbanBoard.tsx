import { useState, useMemo, useCallback } from 'react';
import type { Deal, Client, DealStatus } from '../../lib/db/types';
import KanbanColumn from './KanbanColumn';

const PIPELINE_STATUSES: DealStatus[] = [
  'draft',
  'quoted',
  'sent',
  'negotiating',
  'accepted',
  'delivered',
  'paid',
];

const STATUS_LABELS: Record<DealStatus, string> = {
  draft: 'Borrador',
  quoted: 'Cotizado',
  sent: 'Enviado',
  negotiating: 'Negociando',
  accepted: 'Aceptado',
  delivered: 'Entregado',
  paid: 'Pagado',
  lost: 'Perdido',
};

interface KanbanBoardProps {
  deals: Deal[];
  clients: Client[];
  onMoveDeal: (dealId: string, newStatus: DealStatus) => void;
  dragEnabled: boolean;
  onDealClick: (dealId: string) => void;
}

export default function KanbanBoard({ deals, clients, onMoveDeal, dragEnabled, onDealClick }: KanbanBoardProps) {
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    for (const c of clients) {
      map.set(c.id, c);
    }
    return map;
  }, [clients]);

  const dealsByStatus = useMemo(() => {
    const map = new Map<DealStatus, Deal[]>();
    for (const status of PIPELINE_STATUSES) {
      map.set(status, []);
    }
    for (const deal of deals) {
      if (map.has(deal.status)) {
        map.get(deal.status)!.push(deal);
      }
    }
    return map;
  }, [deals]);

  const handleDragStart = useCallback((dealId: string) => {
    setDraggedDealId(dealId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedDealId(null);
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          label={STATUS_LABELS[status]}
          deals={dealsByStatus.get(status) || []}
          clients={clientMap}
          allStatuses={PIPELINE_STATUSES}
          onMoveDeal={onMoveDeal}
          dragEnabled={dragEnabled}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          draggedDealId={draggedDealId}
          onDealClick={onDealClick}
        />
      ))}
    </div>
  );
}
