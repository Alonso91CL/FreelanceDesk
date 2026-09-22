import { useState, useEffect } from 'react';
import { Save, X, Calculator } from 'lucide-react';
import { calculateReverse } from '../../lib/calculations';
import type { Deal, Client, NewDeal, Currency } from '../../lib/db/types';
import { formatCurrency } from '../../lib/formatters';

interface DealFormProps {
  deal?: Deal;
  clients: Client[];
  onSave: (data: NewDeal) => Promise<void>;
  onCancel: () => void;
  onNavigateToCalculator: () => void;
}

export default function DealForm({ deal, clients, onSave, onCancel, onNavigateToCalculator }: DealFormProps) {
  const [form, setForm] = useState<Omit<NewDeal, 'clientId'> & { clientId: string }>({
    clientId: deal?.clientId || '',
    title: deal?.title || '',
    description: deal?.description || '',
    netAmount: deal?.netAmount || 0,
    currency: deal?.currency || 'USD',
    paypalPercent: deal?.paypalPercent || 5.4,
    paypalFixedUSD: deal?.paypalFixedUSD || 0.30,
    siiPercent: deal?.siiPercent || 15.25,
    usdRate: deal?.usdRate || 950,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCalc, setShowCalc] = useState(false);

  const [calcResult, setCalcResult] = useState<ReturnType<typeof calculateReverse> | null>(null);

  useEffect(() => {
    if (form.netAmount > 0 && form.paypalPercent > 0 && form.siiPercent > 0) {
      setCalcResult(
        calculateReverse({
          netAmount: form.netAmount,
          currency: form.currency,
          paypalPercent: form.paypalPercent,
          paypalFixedUSD: form.paypalFixedUSD,
          siiPercent: form.siiPercent,
          usdRate: form.usdRate,
        })
      );
    } else {
      setCalcResult(null);
    }
  }, [form.netAmount, form.currency, form.paypalPercent, form.paypalFixedUSD, form.siiPercent, form.usdRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.clientId) {
      setError('Selecciona un cliente');
      return;
    }
    if (!form.title.trim()) {
      setError('El título es requerido');
      return;
    }
    if (form.netAmount <= 0) {
      setError('El monto neto debe ser mayor a 0');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        clientId: form.clientId,
        title: form.title,
        description: form.description,
        netAmount: form.netAmount,
        currency: form.currency as Currency,
        paypalPercent: form.paypalPercent,
        paypalFixedUSD: form.paypalFixedUSD,
        siiPercent: form.siiPercent,
        usdRate: form.usdRate,
      });
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Cliente *</label>
        <select
          value={form.clientId}
          onChange={(e) => setForm({ ...form, clientId: e.target.value })}
          className="input-base"
          required
        >
          <option value="">Seleccionar cliente...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.company ? ` (${c.company})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Título del Proyecto *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-base"
          placeholder="Rediseño web corporativo"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Descripción</label>
        <textarea
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-base min-h-[60px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Monto Neto *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.netAmount || ''}
            onChange={(e) => setForm({ ...form, netAmount: parseFloat(e.target.value) || 0 })}
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Moneda</label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
            className="input-base"
          >
            <option value="USD">USD</option>
            <option value="CLP">CLP</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCalc(!showCalc)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 text-left"
        >
          <span className="flex items-center gap-2 text-sm text-gray-300">
            <Calculator size={14} />
            Cálculo de comisiones
          </span>
          <span className="text-gray-500 text-xs">{showCalc ? 'Ocultar' : 'Mostrar'}</span>
        </button>

        {showCalc && (
          <div className="p-4 space-y-3 bg-gray-800/50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">PayPal (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.paypalPercent}
                  onChange={(e) => setForm({ ...form, paypalPercent: parseFloat(e.target.value) || 0 })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">PayPal fijo (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.paypalFixedUSD}
                  onChange={(e) => setForm({ ...form, paypalFixedUSD: parseFloat(e.target.value) || 0 })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">SII (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.siiPercent}
                  onChange={(e) => setForm({ ...form, siiPercent: parseFloat(e.target.value) || 0 })}
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">USD/CLP</label>
                <input
                  type="number"
                  step="1"
                  value={form.usdRate}
                  onChange={(e) => setForm({ ...form, usdRate: parseFloat(e.target.value) || 0 })}
                  className="input-base text-sm"
                />
              </div>
            </div>

            {calcResult && (
              <div className="mt-3 pt-3 border-t border-gray-700 space-y-1 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Bruto nacional:</span>
                  <span>{formatCurrency(calcResult.brutoNacional, form.currency)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>+ SII:</span>
                  <span>{formatCurrency(calcResult.montoSii, form.currency)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>+ PayPal:</span>
                  <span>{formatCurrency(calcResult.montoPaypal, form.currency)}</span>
                </div>
                <div className="flex justify-between text-green-400 font-semibold pt-1 border-t border-gray-700">
                  <span>Total a transferir:</span>
                  <span>{formatCurrency(calcResult.brutoTotal, form.currency)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Guardando...' : deal ? 'Actualizar' : 'Crear Deal'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          <X size={16} />
          Cancelar
        </button>
        <button
          type="button"
          onClick={onNavigateToCalculator}
          className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 text-sm"
        >
          <Calculator size={14} />
          Calculadora
        </button>
      </div>
    </form>
  );
}
