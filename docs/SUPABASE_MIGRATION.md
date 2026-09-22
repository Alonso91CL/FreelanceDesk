# Migración a Supabase — FreelanceDesk

> Guía para migrar de LocalStorage (local-first) a Supabase (nube/multi-tenant).

---

## Cuándo migrar

- Cuando necesites multi-dispositivo
- Cuando quieras ofrecer el servicio SaaS
- Cuando los datos superen el límite de LocalStorage (~5-10MB)
- Cuando necesites compartir datos entre usuarios (team)

---

## Preparación

El código ya está preparado con el patrón Repository + StorageAdapter.

### Interfaces existentes

```typescript
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list<T>(prefix: string): Promise<T[]>();
}
```

Solo necesitas implementar `SupabaseAdapter` con la misma interfaz.

---

## Paso 1: Crear proyecto Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nueva organización (para SaaS)
3. Crear proyecto
4. Guardar: Project URL, anon key, service_role key

---

## Paso 2: Schema SQL

Ejecutar en el SQL Editor de Supabase:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workspaces (tenants)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (managed by Supabase Auth, but we link to workspaces)
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  country TEXT,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  net_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  paypal_percent NUMERIC DEFAULT 5.4,
  paypal_fixed_usd NUMERIC DEFAULT 0.30,
  sii_percent NUMERIC DEFAULT 15.25,
  usd_rate NUMERIC DEFAULT 900,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  number TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time entries
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  note TEXT,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (per workspace)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  profile JSONB NOT NULL,
  defaults JSONB NOT NULL,
  counters JSONB NOT NULL,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Paso 3: Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Function to get current user's workspace
CREATE OR REPLACE FUNCTION get_current_workspace_id()
RETURNS UUID AS $$
SELECT workspace_id FROM workspace_members
WHERE user_id = auth.uid()
LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Policies for clients
CREATE POLICY "workspace_clients_select" ON clients
  FOR SELECT USING (workspace_id = get_current_workspace_id());
CREATE POLICY "workspace_clients_insert" ON clients
  FOR INSERT WITH CHECK (workspace_id = get_current_workspace_id());
CREATE POLICY "workspace_clients_update" ON clients
  FOR UPDATE USING (workspace_id = get_current_workspace_id());
CREATE POLICY "workspace_clients_delete" ON clients
  FOR DELETE USING (workspace_id = get_current_workspace_id());

-- Policies for deals
CREATE POLICY "workspace_deals_select" ON deals
  FOR SELECT USING (workspace_id = get_current_workspace_id());
CREATE POLICY "workspace_deals_insert" ON deals
  FOR INSERT WITH CHECK (workspace_id = get_current_workspace_id());
CREATE POLICY "workspace_deals_update" ON deals
  FOR UPDATE USING (workspace_id = get_current_workspace_id());
CREATE POLICY "workspace_deals_delete" ON deals
  FOR DELETE USING (workspace_id = get_current_workspace_id());

-- Same pattern for documents, time_entries, followups, settings...
```

---

## Paso 4: SupabaseAdapter

```typescript
// src/lib/db/SupabaseAdapter.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { StorageAdapter } from './storage';

export class SupabaseAdapter implements StorageAdapter {
  private client: SupabaseClient;
  private workspaceId: string;

  constructor(supabaseUrl: string, supabaseKey: string, workspaceId: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
    this.workspaceId = workspaceId;
  }

  async get<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as T;
  }

  async insert<T>(table: string, record: T & { workspace_id: string }): Promise<T> {
    const { data, error } = await this.client
      .from(table)
      .insert({ ...record, workspace_id: this.workspaceId })
      .select()
      .single();
    if (error) throw error;
    return data as T;
  }

  async update<T>(table: string, id: string, updates: Partial<T>): Promise<T> {
    const { data, error } = await this.client
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  }

  async remove(table: string, id: string): Promise<void> {
    const { error } = await this.client
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async list<T>(table: string, filters?: Record<string, unknown>): Promise<T[]> {
    let query = this.client.from(table).select('*');
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }
}
```

---

## Paso 5: Factory (elegir adapter)

```typescript
// src/lib/db/factory.ts
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SupabaseAdapter } from './SupabaseAdapter';

export function createStorage(): StorageAdapter {
  const mode = import.meta.env.PUBLIC_DATA_MODE;

  if (mode === 'supabase') {
    return new SupabaseAdapter(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      getWorkspaceIdFromSession()
    );
  }

  return new LocalStorageAdapter(getWorkspaceIdLocal());
}
```

---

## Paso 6: Variables de entorno

```env
# .env (local)
PUBLIC_DATA_MODE=local

# .env.production (hosted)
PUBLIC_DATA_MODE=supabase
PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## Paso 7: Migración de datos local → cloud

Función one-click en `/settings`:

```typescript
async function migrateToCloud(supabaseUrl: string, key: string, workspaceId: string) {
  const localData = await localRepos.exportAll(); // Export JSON from local
  const remoteRepos = createRepos(
    new SupabaseAdapter(supabaseUrl, key, workspaceId)
  );
  await remoteRepos.importAll(localData); // Import to Supabase
  // Optionally switch mode
  localStorage.setItem('data_mode', 'supabase');
}
```

---

## Verificación

- [ ] Datos se leen correctamente desde Supabase
- [ ] RLS impide acceso entre workspaces
- [ ] Performance aceptable (<200ms por query)
- [ ] Auth funciona (signup, login, logout)
- [ ] Timer persiste entre dispositivos
- [ ] PDFs se generan igual (no dependen de storage)

---

## Rollback

Si algo falla, el modo local sigue disponible. Cambiar `PUBLIC_DATA_MODE=local` y rebuild.
