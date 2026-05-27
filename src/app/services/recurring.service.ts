import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RecurringTransaction } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class RecurringService {
  private readonly STORAGE_KEY = 'expense-tracker-recurring';
  
  private recurring = signal<RecurringTransaction[]>([]);
  
  readonly allRecurring = this.recurring.asReadonly();
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRecurring();
      
      effect(() => {
        if (this.initialized) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recurring()));
        }
      });
      
      this.initialized = true;
      this.processDueTransactions();
    }
  }

  private loadRecurring(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.recurring.set(parsed || []);
      } catch {
        this.recurring.set([]);
      }
    }
  }

  getRecurringByAccount(accountId: string): RecurringTransaction[] {
    return this.recurring().filter(r => r.accountId === accountId);
  }

 addRecurring(transaction: Omit<RecurringTransaction, 'id' | 'nextDate'>): void {
    const nextDate = this.calculateNextDate(transaction.startDate || new Date().toISOString().split('T')[0], transaction.frequency);
    const newRecurring: RecurringTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      nextDate,
      amount: Number(transaction.amount) // Ensure amount is a number
    };
    this.recurring.update(list => [...list, newRecurring]);
  }

  updateRecurring(updated: RecurringTransaction): void {
    this.recurring.update(list => list.map(r => r.id === updated.id ? updated : r));
  }

  deleteRecurring(id: string): void {
    this.recurring.update(list => list.filter(r => r.id !== id));
  }

  toggleActive(id: string): void {
    this.recurring.update(list => list.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  }

  getDueTransactions(accountId: string): RecurringTransaction[] {
    const today = new Date().toISOString().split('T')[0];
    return this.recurring().filter(r => 
      r.accountId === accountId && 
      r.isActive && 
      r.nextDate <= today
    );
  }

  processDueTransactions(): RecurringTransaction[] {
    const due: RecurringTransaction[] = [];
    
    this.recurring.update(list => {
      const today = new Date().toISOString().split('T')[0];
      
      return list.map(r => {
        if (r.isActive && r.nextDate <= today) {
          due.push(r);
          return {
            ...r,
            nextDate: this.calculateNextDate(r.nextDate, r.frequency)
          };
        }
        return r;
      });
    });
    
    return due;
  }

  private calculateNextDate(currentDate: string, frequency: string): string {
    const date = new Date(currentDate);
    
    switch(frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  }
}