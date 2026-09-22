import { DollarSign, Clock, User } from 'lucide-react';
import type { Deal, Client } from '../../lib/db/types';
import { formatCurrency } from '../../lib/formatters';

interface DealCardProps {
  deal: Deal;
  client?: Client;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  draggable: boolean;
}

export default function DealCard({ deal, client, onMoveLeft, onMoveRight, canMoveLeft, canMoveRight, draggable }: DealCardProps) {
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      draggable={draggable}
      className={`card p-4 cursor-pointer hover:border-blue-500/50 transition-colors ${
        draggable ? 'active:cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-gray-200 text-sm leading-tight">{deal.title}</h4>
        <span className="text-xs text-gray-400 whitespace-nowrap">{deal.currency}</span>
      </div>

      {client && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <User size={10} />
          {client.name}
        </p>
      )}

      <p className="text-sm font-semibold text-green-400 mt-2 flex items-center gap-1">
        <DollarSign size={12} />
        {deal.result
          ? formatCurrency(deal.result.brutoTotal, deal.currency)
          : formatCurrency(deal.netAmount, deal.currency)}
      </p>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={10} />
          {daysSinceUpdate}d
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
            disabled={!canMoveLeft}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white"
            aria-label="Mover izquierda"
          >
            <span className="text-xs">←</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
            disabled={!canMoveRight}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white"
            aria-label="Mover derecha"
          >
            <span className="text-xs">→</span>
          </button>
        </div>
      </div>

      {daysSinceUpdate > 7 && (
        <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
          <Clock size={10} />
          Sin respuesta {daysSinceUpdate} días
        </div>
      )}
    </div>
  );
}
