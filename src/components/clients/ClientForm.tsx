import { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { Client, NewClient, ClientSource } from '../../lib/db/types';

interface ClientFormProps {
  client?: Client;
  onSave: (data: NewClient) => Promise<void>;
  onCancel: () => void;
}

export default function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [form, setForm] = useState<NewClient>({
    name: client?.name || '',
    company: client?.company || '',
    email: client?.email || '',
    country: client?.country || '',
    source: client?.source || undefined,
    notes: client?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email inválido');
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
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
        <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-base"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Empresa</label>
        <input
          type="text"
          value={form.company || ''}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="input-base"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          type="email"
          value={form.email || ''}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-base"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">País</label>
        <input
          type="text"
          value={form.country || ''}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className="input-base"
          placeholder="Chile, México, Colombia..."
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Fuente</label>
        <select
          value={form.source || ''}
          onChange={(e) => setForm({ ...form, source: (e.target.value || undefined) as ClientSource })}
          className="input-base"
        >
          <option value="">Seleccionar...</option>
          <option value="referral">Referido</option>
          <option value="linkedin">LinkedIn</option>
          <option value="upwork">Upwork</option>
          <option value="other">Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Notas</label>
        <textarea
          value={form.notes || ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="input-base min-h-[80px]"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Guardando...' : client ? 'Actualizar' : 'Crear Cliente'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          <X size={16} />
          Cancelar
        </button>
      </div>
    </form>
  );
}
