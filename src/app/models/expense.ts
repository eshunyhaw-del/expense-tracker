export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  accountId: string;
  notes?: string;
  recurringId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash-book' | 'custom';
  createdAt: string;
  icon?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  accountId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDate: string;
  isActive: boolean;
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // 'YYYY-MM'
  accountId: string;
}

export interface AppSettings {
  defaultAccount: string;
  theme: 'light' | 'dark';
  currency: string;
}