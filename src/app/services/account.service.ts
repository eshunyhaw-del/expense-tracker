import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Account } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly STORAGE_KEY = 'expense-tracker-accounts';
  
  private accounts = signal<Account[]>([]);
  private activeAccount = signal<Account | null>(null);
  
  readonly allAccounts = this.accounts.asReadonly();
  readonly currentAccount = this.activeAccount.asReadonly();
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Load data first
      this.loadAccounts();
      
      // Only then set up the save effect
      effect(() => {
        // Skip saving during initial load
        if (this.initialized) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.accounts()));
        }
      });
      
      this.initialized = true;
    } else {
      // Server-side: just set defaults
      this.accounts.set(this.getDefaultAccounts());
      if (this.accounts().length > 0) {
        this.activeAccount.set(this.accounts()[0]);
      }
    }
  }

  private loadAccounts(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          this.accounts.set(parsed);
        } else {
          this.accounts.set(this.getDefaultAccounts());
        }
      } catch {
        this.accounts.set(this.getDefaultAccounts());
      }
    } else {
      this.accounts.set(this.getDefaultAccounts());
    }
    
    // Set active account
    if (this.accounts().length > 0) {
      this.activeAccount.set(this.accounts()[0]);
    }
  }

  private getDefaultAccounts(): Account[] {
    return [
      {
        id: 'default-cash-book',
        name: 'Cash Book',
        type: 'cash-book' as const,
        createdAt: new Date().toISOString(),
        icon: '📒'
      }
    ];
  }

  setActiveAccount(accountId: string) {
    const account = this.accounts().find(a => a.id === accountId);
    if (account) {
      this.activeAccount.set(account);
    }
  }

  addAccount(name: string, type: 'cash-book' | 'custom' = 'custom') {
    const newAccount: Account = {
      id: crypto.randomUUID(),
      name,
      type,
      createdAt: new Date().toISOString(),
      icon: type === 'cash-book' ? '📒' : '💰'
    };
    this.accounts.update(list => [...list, newAccount]);
    this.activeAccount.set(newAccount);
    return newAccount;
  }

  deleteAccount(id: string) {
    if (this.accounts().length <= 1) return;
    
    this.accounts.update(list => list.filter(a => a.id !== id));
    if (this.activeAccount()?.id === id) {
      this.activeAccount.set(this.accounts()[0]);
    }
  }
}