import { useSettings } from '../../hooks/useSettings';
import { ProfileForm, DefaultsForm, BackupPanel, ResetPanel } from '../../components/settings/SettingsForms';

export default function SettingsApp() {
  const { settings, loading, updateProfile, updateDefaults, resetAll, exportData, importData } = useSettings();

  if (loading) {
    return <div className="text-gray-400">Cargando...</div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Perfil del Freelancer</h2>
        <ProfileForm profile={settings.profile} onSave={updateProfile} />
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Valores por Defecto</h2>
        <DefaultsForm defaults={settings.defaults} onSave={updateDefaults} />
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Copia de Seguridad</h2>
        <BackupPanel onExport={exportData} onImport={importData} />
      </section>
      <section className="card p-6 border-red-900/50">
        <h2 className="text-lg font-semibold mb-4 text-red-400">Zona de Peligro</h2>
        <ResetPanel onReset={resetAll} />
      </section>
    </div>
  );
}
