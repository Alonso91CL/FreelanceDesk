import type { StorageAdapter } from './storage';

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private workspaceId: string) {}

  private key(k: string): string {
    return `fd:${this.workspaceId}:${k}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(this.key(key));
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(this.key(key), JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.key(key));
  }

  async list<T>(prefix: string): Promise<T[]> {
    const results: T[] = [];
    const fullPrefix = this.key(prefix);
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            results.push(JSON.parse(raw) as T);
          } catch {
            // skip invalid entries
          }
        }
      }
    }
    return results;
  }

  async query<T>(prefix: string, predicate: (item: T) => boolean): Promise<T[]> {
    const all = await this.list<T>(prefix);
    return all.filter(predicate);
  }
}
