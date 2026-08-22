export interface Invoice {
  id: string;
  clientId: string;
  number: string;
  description: string;
  amount: number;
  date: string;
  status: 'draft' | 'sent' | 'paid';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  rate: number;
  status: 'active' | 'past';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface DBState {
  invoices: Invoice[];
  clients: Client[];
  expenses: Expense[];
  nextInv: number;
}

const DB_KEY = 'fk_db_v1';

export function loadDB(): DBState {
  const defaultState: DBState = {
    invoices: [],
    clients: [],
    expenses: [],
    nextInv: 1
  };
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch { /* fresh start */ }
  return defaultState;
}

export function saveDB(db: DBState) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch {}
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function money(n: number): string {
  return '$' + Number(n || 0).toFixed(2);
}

export function monthKey(iso: string): string {
  return (iso || '').slice(0, 7);
}

export function esc(s: string | null | undefined): string {
  const div = document.createElement('div');
  div.textContent = String(s ?? '');
  return div.innerHTML;
}