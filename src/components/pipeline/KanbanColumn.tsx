import { useState } from 'react';
import type { Deal, Client, DealStatus } from '../../lib/db/types';
import DealCard from './DealCard';

interface KanbanColumnProps {
  status: DealStatus;
  label: string;
  deals: Deal[];
  clients: Map<string, Client>;
  allStatuses: DealStatus[];
  onMoveDeal: (dealId: string, newStatus: DealStatus) => void;
  dragEnabled: boolean;
  onDragStart: (dealId: string) => void;
  onDragEnd: () => void;
  draggedDealId: string | null;
  onDealClick: (dealId: string) => void;
}

export default function KanbanColumn({
  status,
  label,
  deals,
  clients,
  allStatuses,
  onMoveDeal,
  dragEnabled,
  onDragStart,
  onDragEnd,
  draggedDealId,
  onDealClick,
}: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  const currentIndex = allStatuses.indexOf(status);
  const prevStatus = currentIndex > 0 ? allStatuses[currentIndex - 1] : null;
  const nextStatus = currentIndex < allStatuses.length - 1 ? allStatuses[currentIndex + 1] : null;

  const handleDragOver = (e: React.DragEvent) => {
    if (!dragEnabled) return;
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!dragEnabled) return;
    e.preventDefault();
    setDragOver(false);
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      onMoveDeal(dealId, status);
    }
  };

  return (
    <div
      className={`flex flex-col min-w-[280px] max-w-[320px] bg-gray-800/50 rounded-lg border transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">{label}</h3>
        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
          {deals.length}
        </span>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {deals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            {dragEnabled ? 'Arrastra deals aquí' : 'Sin deals'}
          </div>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              draggable={dragEnabled}
              onDragStart={(e) => {
                if (!dragEnabled) return;
                e.dataTransfer.setData('text/plain', deal.id);
                e.dataTransfer.effectAllowed = 'move';
                onDragStart(deal.id);
              }}
              onDragEnd={onDragEnd}
              onClick={() => onDealClick(deal.id)}
              className={`${draggedDealId === deal.id && dragEnabled ? 'opacity-50' : ''}`}
            >
              <DealCard
                deal={deal}
                client={clients.get(deal.clientId)}
                onMoveLeft={() => prevStatus && onMoveDeal(deal.id, prevStatus)}
                onMoveRight={() => nextStatus && onMoveDeal(deal.id, nextStatus)}
                canMoveLeft={!!prevStatus}
                canMoveRight={!!nextStatus}
                draggable={dragEnabled}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
