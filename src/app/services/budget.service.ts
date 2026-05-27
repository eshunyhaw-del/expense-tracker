import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Budget } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly STORAGE_KEY = 'expense-tracker-budgets';
  
  private budgets = signal<Budget[]>([]);
  
  readonly allBudgets = this.budgets.asReadonly();
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBudgets();
      
      effect(() => {
        if (this.initialized) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.budgets()));
        }
      });
      
      this.initialized = true;
    }
  }

  private loadBudgets(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.budgets.set(parsed || []);
      } catch {
        this.budgets.set([]);
      }
    }
  }

  getBudgetsByAccount(accountId: string): Budget[] {
    return this.budgets().filter(b => b.accountId === accountId);
  }

  getBudgetsByMonth(accountId: string, month: string): Budget[] {
    return this.budgets().filter(b => b.accountId === accountId && b.month === month);
  }

  getCurrentMonthBudgets(accountId: string): Budget[] {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.getBudgetsByMonth(accountId, month);
  }

  setBudget(accountId: string, category: string, amount: number): void {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const existing = this.budgets().find(b => 
      b.accountId === accountId && b.category === category && b.month === month
    );
    
    if (existing) {
      this.budgets.update(list => list.map(b => 
        b.id === existing.id ? { ...b, amount } : b
      ));
    } else {
      const budget: Budget = {
        id: crypto.randomUUID(),
        category,
        amount,
        month,
        accountId
      };
      this.budgets.update(list => [...list, budget]);
    }
  }

  deleteBudget(id: string): void {
    this.budgets.update(list => list.filter(b => b.id !== id));
  }

  getBudgetAmount(accountId: string, category: string): number {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const budget = this.budgets().find(b => 
      b.accountId === accountId && b.category === category && b.month === month
    );
    return budget ? budget.amount : 0;
  }
}