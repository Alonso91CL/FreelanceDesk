export type { StorageAdapter } from './storage';
export { LocalStorageAdapter } from './LocalStorageAdapter';
export {
  ClientRepository,
  DealRepository,
  DocumentRepository,
  TimeEntryRepository,
  FollowUpRepository,
  SettingsRepository,
} from './repository';
export { generateId } from './id';
export type {
  Client,
  Deal,
  Document,
  DocumentType,
  FollowUp,
  FreelancerProfile,
  NewClient,
  NewDeal,
  NewDocument,
  NewFollowUp,
  NewTimeEntry,
  Settings,
  TimeEntry,
  Currency,
  DealStatus,
  ClientSource,
  Counters,
} from './types';

import type { StorageAdapter } from './storage';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import {
  ClientRepository,
  DealRepository,
  DocumentRepository,
  TimeEntryRepository,
  FollowUpRepository,
  SettingsRepository,
} from './repository';

export interface Repositories {
  clients: ClientRepository;
  deals: DealRepository;
  documents: DocumentRepository;
  times: TimeEntryRepository;
  followups: FollowUpRepository;
  settings: SettingsRepository;
}

const DEFAULT_WORKSPACE = 'default';

export function createStorage(workspaceId: string = DEFAULT_WORKSPACE): StorageAdapter {
  return new LocalStorageAdapter(workspaceId);
}

export function createRepos(workspaceId: string = DEFAULT_WORKSPACE): Repositories {
  const storage = createStorage(workspaceId);
  return {
    clients: new ClientRepository(storage),
    deals: new DealRepository(storage),
    documents: new DocumentRepository(storage),
    times: new TimeEntryRepository(storage),
    followups: new FollowUpRepository(storage),
    settings: new SettingsRepository(storage),
  };
}

export const repos = createRepos();
