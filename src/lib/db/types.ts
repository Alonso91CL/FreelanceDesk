export type Currency = 'USD' | 'CLP';

export type DealStatus =
  | 'draft'
  | 'quoted'
  | 'sent'
  | 'negotiating'
  | 'accepted'
  | 'delivered'
  | 'paid'
  | 'lost';

export type DocumentType = 'quote' | 'payment_request' | 'reminder';

export type ClientSource = 'referral' | 'linkedin' | 'upwork' | 'other';

export interface FreelancerProfile {
  name: string;
  company?: string;
  website?: string;
  email?: string;
  phone?: string;
  taxId?: string;
}

export interface Client {
  id: string;
  workspaceId: string;
  name: string;
  company?: string;
  email?: string;
  country?: string;
  source?: ClientSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  workspaceId: string;
  clientId: string;
  title: string;
  description?: string;
  netAmount: number;
  currency: Currency;
  status: DealStatus;
  paypalPercent: number;
  paypalFixedUSD: number;
  siiPercent: number;
  usdRate: number;
  result?: {
    brutoNacional: number;
    brutoTotal: number;
    montoSii: number;
    montoPaypal: number;
    paypalFixedInCurrency: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  workspaceId: string;
  dealId: string;
  type: DocumentType;
  number: string;
  data: Deal & {
    profile: FreelancerProfile;
    client: Client;
  };
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  workspaceId: string;
  dealId: string;
  startTime: string;
  endTime?: string;
  note?: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  workspaceId: string;
  dealId: string;
  dueDate: string;
  note?: string;
  done: boolean;
  createdAt: string;
}

export interface Counters {
  quote: number;
  paymentRequest: number;
  reminder: number;
}

export interface Settings {
  workspaceId: string;
  profile: FreelancerProfile;
  defaults: {
    paypalPercent: number;
    paypalFixedUSD: number;
    siiPercent: number;
    fallbackUsdRate: number;
    currency: Currency;
  };
  counters: Counters;
  year: number;
}

export interface NewClient {
  name: string;
  company?: string;
  email?: string;
  country?: string;
  source?: ClientSource;
  notes?: string;
}

export interface NewDeal {
  clientId: string;
  title: string;
  description?: string;
  netAmount: number;
  currency: Currency;
  paypalPercent: number;
  paypalFixedUSD: number;
  siiPercent: number;
  usdRate: number;
}

export interface NewDocument {
  dealId: string;
  type: DocumentType;
  data: Deal & {
    profile: FreelancerProfile;
    client: Client;
  };
}

export interface NewTimeEntry {
  dealId: string;
  startTime: string;
  endTime?: string;
  note?: string;
}

export interface NewFollowUp {
  dealId: string;
  dueDate: string;
  note?: string;
}
