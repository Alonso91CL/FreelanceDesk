import { useState, useRef } from 'react';
import { Save, Upload, Download, Trash2 } from 'lucide-react';

interface ProfileFormProps {
  profile: { name: string; company?: string; email?: string; phone?: string; website?: string; taxId?: string };
  onSave: (data: any) => Promise<void>;
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
        <input
          type="tel"
          value={form.phone || ''}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="input-base"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Sitio Web</label>
        <input
          type="url"
          value={form.website || ''}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className="input-base"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">RUT / Tax ID</label>
        <input
          type="text"
          value={form.taxId || ''}
          onChange={(e) => setForm({ ...form, taxId: e.target.value })}
          className="input-base"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
      >
        <Save size={16} />
        {saving ? 'Guardando...' : 'Guardar Perfil'}
      </button>
    </form>
  );
}

interface DefaultsFormProps {
  defaults: { paypalPercent: number; paypalFixedUSD: number; siiPercent: number; fallbackUsdRate: number; currency: 'USD' | 'CLP' };
  onSave: (data: any) => Promise<void>;
}

export function DefaultsForm({ defaults, onSave }: DefaultsFormProps) {
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Moneda por defecto</label>
        <select
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value as 'USD' | 'CLP' })}
          className="input-base"
        >
          <option value="USD">USD</option>
          <option value="CLP">CLP</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Comisión PayPal (%)</label>
        <input
          type="number"
          step="0.01"
          value={form.paypalPercent}
          onChange={(e) => setForm({ ...form, paypalPercent: parseFloat(e.target.value) || 0 })}
          className="input-base"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Comisión fija PayPal (USD)</label>
        <input
          type="number"
          step="0.01"
          value={form.paypalFixedUSD}
          onChange={(e) => setForm({ ...form, paypalFixedUSD: parseFloat(e.target.value) || 0 })}
          className="input-base"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Retención SII (%)</label>
        <input
          type="number"
          step="0.01"
          value={form.siiPercent}
          onChange={(e) => setForm({ ...form, siiPercent: parseFloat(e.target.value) || 0 })}
          className="input-base"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Tasa USD/CLP fallback</label>
        <input
          type="number"
          step="1"
          value={form.fallbackUsdRate}
          onChange={(e) => setForm({ ...form, fallbackUsdRate: parseFloat(e.target.value) || 0 })}
          className="input-base"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
      >
        <Save size={16} />
        {saving ? 'Guardando...' : 'Guardar Valores'}
      </button>
    </form>
  );
}

interface BackupPanelProps {
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

export function BackupPanel({ onExport, onImport }: BackupPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    await onImport(file);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onExport}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
      >
        <Download size={16} />
        Exportar Configuración
      </button>
      <div>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
        >
          <Upload size={16} />
          {importing ? 'Importando...' : 'Importar Configuración'}
        </button>
      </div>
    </div>
  );
}

interface ResetPanelProps {
  onReset: () => Promise<void>;
}

export function ResetPanel({ onReset }: ResetPanelProps) {
  const [confirming, setConfirming] = useState(false);

  const handleReset = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await onReset();
    setConfirming(false);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400">Elimina todos los datos de la aplicación. Esta acción no se puede deshacer.</p>
      <button
        onClick={handleReset}
        className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
          confirming
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        <Trash2 size={16} />
        {confirming ? '¿Estás seguro? Click de nuevo para confirmar' : 'Resetear Todo'}
      </button>
    </div>
  );
}
