export const SCHEMA_VERSION = 1;

export interface Migration {
  version: number;
  up: () => void | Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: () => {
      // Initial schema - no data migration needed
    },
  },
];

export function getCurrentVersion(): number {
  const raw = localStorage.getItem('fd:_meta:schemaVersion');
  return raw ? parseInt(raw, 10) : 0;
}

export async function runMigrations(): Promise<void> {
  const current = getCurrentVersion();
  for (const migration of migrations) {
    if (migration.version > current) {
      await migration.up();
    }
  }
  localStorage.setItem('fd:_meta:schemaVersion', String(SCHEMA_VERSION));
}
