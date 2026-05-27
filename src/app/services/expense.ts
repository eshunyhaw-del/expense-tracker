import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Transaction } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly STORAGE_KEY = 'expense-tracker-transactions';
  
  private transactions = signal<Transaction[]>([]);
  
  readonly allTransactions = this.transactions.asReadonly();
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Load data first
      this.loadTransactions();
      
      // Only then set up the save effect
      effect(() => {
        // Skip saving during initial load
        if (this.initialized) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions()));
        }
      });
      
      this.initialized = true;
    }
  }

  private loadTransactions(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.transactions.set(parsed || []);
      } catch {
        this.transactions.set([]);
      }
    } else {
      this.transactions.set([]);
    }
  }

  getTransactionsByAccount(accountId: string): Transaction[] {
    return this.transactions().filter(t => t.accountId === accountId);
  }

  getTransactionsByPeriod(accountId: string, period: string): Transaction[] {
    const accountTransactions = this.getTransactionsByAccount(accountId);
    const now = new Date();
    
    switch(period) {
      case 'daily':
        return accountTransactions.filter(t => 
          new Date(t.date).toDateString() === now.toDateString()
        );
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return accountTransactions.filter(t => new Date(t.date) >= weekAgo);
      case 'monthly':
        return accountTransactions.filter(t => 
          new Date(t.date).getMonth() === now.getMonth() &&
          new Date(t.date).getFullYear() === now.getFullYear()
        );
      case 'yearly':
        return accountTransactions.filter(t => 
          new Date(t.date).getFullYear() === now.getFullYear()
        );
      default:
        return accountTransactions;
    }
  }

  getIncomeTotal(accountId: string, period: string = 'all'): number {
    return this.getTransactionsByPeriod(accountId, period)
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getExpenseTotal(accountId: string, period: string = 'all'): number {
    return this.getTransactionsByPeriod(accountId, period)
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getNetTotal(accountId: string, period: string = 'all'): number {
    return this.getIncomeTotal(accountId, period) - this.getExpenseTotal(accountId, period);
  }

  addTransaction(transaction: Omit<Transaction, 'id'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID()
    };
    this.transactions.update(list => [newTransaction, ...list]);
  }

  updateTransaction(updatedTransaction: Transaction) {
    this.transactions.update(list => 
      list.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  }

  deleteTransaction(id: string) {
    this.transactions.update(list => list.filter(t => t.id !== id));
  }

  getCategories(type?: 'income' | 'expense'): string[] {
    const transactions = type 
      ? this.transactions().filter(t => t.type === type)
      : this.transactions();
    return [...new Set(transactions.map(t => t.category))];
  }

  getAllTransactions(): Transaction[] {
    return this.transactions();
  }

  exportToCSV(): string {
    const transactions = this.transactions();
    if (transactions.length === 0) return '';
    
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Notes', 'Account ID'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount.toString(),
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.accountId
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}