import type { StorageAdapter } from './storage';
import type {
  Client,
  Deal,
  Document,
  FollowUp,
  NewClient,
  NewDeal,
  NewDocument,
  NewFollowUp,
  NewTimeEntry,
  Settings,
  TimeEntry,
} from './types';
import { generateId } from './id';

export class ClientRepository {
  constructor(private storage: StorageAdapter) {}

  async create(data: NewClient): Promise<Client> {
    const now = new Date().toISOString();
    const client: Client = {
      id: generateId(),
      workspaceId: '',
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await this.storage.set(`clients:${client.id}`, client);
    return client;
  }

  async get(id: string): Promise<Client | null> {
    return this.storage.get<Client>(`clients:${id}`);
  }

  async list(): Promise<Client[]> {
    return this.storage.list<Client>('clients:');
  }

  async update(id: string, data: Partial<NewClient>): Promise<Client | null> {
    const existing = await this.get(id);
    if (!existing) return null;
    const updated: Client = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await this.storage.set(`clients:${id}`, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(`clients:${id}`);
  }
}

export class DealRepository {
  constructor(private storage: StorageAdapter) {}

  async create(data: NewDeal): Promise<Deal> {
    const now = new Date().toISOString();
    const deal: Deal = {
      id: generateId(),
      workspaceId: '',
      ...data,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    await this.storage.set(`deals:${deal.id}`, deal);
    return deal;
  }

  async get(id: string): Promise<Deal | null> {
    return this.storage.get<Deal>(`deals:${id}`);
  }

  async list(): Promise<Deal[]> {
    return this.storage.list<Deal>('deals:');
  }

  async listByClient(clientId: string): Promise<Deal[]> {
    return this.storage.query<Deal>('deals:', (d) => d.clientId === clientId);
  }

  async update(id: string, data: Partial<Deal>): Promise<Deal | null> {
    const existing = await this.get(id);
    if (!existing) return null;
    const updated: Deal = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await this.storage.set(`deals:${id}`, updated);
    return updated;
  }

  async updateStatus(id: string, status: Deal['status']): Promise<Deal | null> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(`deals:${id}`);
  }
}

export class DocumentRepository {
  constructor(private storage: StorageAdapter) {}

  async create(data: NewDocument & { number: string }): Promise<Document> {
    const doc: Document = {
      id: generateId(),
      workspaceId: '',
      dealId: data.dealId,
      type: data.type,
      number: data.number,
      data: data.data,
      createdAt: new Date().toISOString(),
    };
    await this.storage.set(`documents:${doc.id}`, doc);
    return doc;
  }

  async get(id: string): Promise<Document | null> {
    return this.storage.get<Document>(`documents:${id}`);
  }

  async list(): Promise<Document[]> {
    return this.storage.list<Document>('documents:');
  }

  async listByDeal(dealId: string): Promise<Document[]> {
    return this.storage.query<Document>('documents:', (d) => d.dealId === dealId);
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(`documents:${id}`);
  }
}

export class TimeEntryRepository {
  constructor(private storage: StorageAdapter) {}

  async create(data: NewTimeEntry): Promise<TimeEntry> {
    const entry: TimeEntry = {
      id: generateId(),
      workspaceId: '',
      ...data,
      createdAt: new Date().toISOString(),
    };
    await this.storage.set(`times:${entry.id}`, entry);
    return entry;
  }

  async get(id: string): Promise<TimeEntry | null> {
    return this.storage.get<TimeEntry>(`times:${id}`);
  }

  async list(): Promise<TimeEntry[]> {
    return this.storage.list<TimeEntry>('times:');
  }

  async listByDeal(dealId: string): Promise<TimeEntry[]> {
    return this.storage.query<TimeEntry>('times:', (e) => e.dealId === dealId);
  }

  async update(id: string, data: Partial<TimeEntry>): Promise<TimeEntry | null> {
    const existing = await this.get(id);
    if (!existing) return null;
    const updated: TimeEntry = { ...existing, ...data };
    await this.storage.set(`times:${id}`, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(`times:${id}`);
  }
}

export class FollowUpRepository {
  constructor(private storage: StorageAdapter) {}

  async create(data: NewFollowUp): Promise<FollowUp> {
    const followUp: FollowUp = {
      id: generateId(),
      workspaceId: '',
      ...data,
      done: false,
      createdAt: new Date().toISOString(),
    };
    await this.storage.set(`followups:${followUp.id}`, followUp);
    return followUp;
  }

  async get(id: string): Promise<FollowUp | null> {
    return this.storage.get<FollowUp>(`followups:${id}`);
  }

  async list(): Promise<FollowUp[]> {
    return this.storage.list<FollowUp>('followups:');
  }

  async pending(): Promise<FollowUp[]> {
    return this.storage.query<FollowUp>('followups:', (f) => !f.done);
  }

  async markDone(id: string): Promise<FollowUp | null> {
    const existing = await this.get(id);
    if (!existing) return null;
    const updated: FollowUp = { ...existing, done: true };
    await this.storage.set(`followups:${id}`, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(`followups:${id}`);
  }
}

export class SettingsRepository {
  constructor(private storage: StorageAdapter) {}

  async get(): Promise<Settings | null> {
    return this.storage.get<Settings>('settings:main');
  }

  async save(settings: Settings): Promise<void> {
    await this.storage.set('settings:main', settings);
  }

  async getDefaultSettings(): Promise<Settings> {
    const existing = await this.get();
    if (existing) return existing;
    const defaults: Settings = {
      workspaceId: '',
      profile: { name: '' },
      defaults: {
        paypalPercent: 4.99,
        paypalFixedUSD: 0.49,
        siiPercent: 14.99,
        fallbackUsdRate: 950,
        currency: 'USD',
      },
      counters: { quote: 0, paymentRequest: 0, reminder: 0 },
      year: new Date().getFullYear(),
    };
    await this.save(defaults);
    return defaults;
  }

  async nextNumber(type: 'quote' | 'paymentRequest' | 'reminder'): Promise<string> {
    const settings = await this.getDefaultSettings();
    const year = new Date().getFullYear();

    if (settings.year !== year) {
      settings.counters = { quote: 0, paymentRequest: 0, reminder: 0 };
      settings.year = year;
    }

    settings.counters[type] += 1;
    const count = settings.counters[type];
    await this.save(settings);

    const prefix = type === 'quote' ? 'COT' : type === 'paymentRequest' ? 'SOL' : 'REM';
    return `${prefix}-${year}-${count.toString().padStart(3, '0')}`;
  }

  async updateProfile(data: Partial<Settings['profile']>): Promise<Settings> {
    const settings = await this.getDefaultSettings();
    settings.profile = { ...settings.profile, ...data };
    await this.save(settings);
    return settings;
  }

  async updateDefaults(data: Partial<Settings['defaults']>): Promise<Settings> {
    const settings = await this.getDefaultSettings();
    settings.defaults = { ...settings.defaults, ...data };
    await this.save(settings);
    return settings;
  }

  async reset(): Promise<void> {
    await this.storage.delete('settings:main');
  }
}
