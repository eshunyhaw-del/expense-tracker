import { Component, input, output, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/expense';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="list-card">
      <div class="list-header">
        <h3>Transactions ({{ filteredTransactions().length }})</h3>
        <div class="filter-wrapper">
          <iconify-icon icon="ph:funnel" width="16" height="16" class="filter-icon"></iconify-icon>
          <select (change)="filterCategory($event)" class="filter-select">
            <option value="">All Categories</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
      </div>
      
      <div class="transactions-table">
        @for (transaction of filteredTransactions(); track transaction.id) {
          <div class="transaction-row">
            <div class="transaction-type-icon" [class.income-type]="transaction.type === 'income'" [class.expense-type]="transaction.type === 'expense'">
              <iconify-icon 
                [icon]="transaction.type === 'income' ? 'ph:arrow-down-left' : 'ph:arrow-up-right'" 
                width="18" height="18"
              ></iconify-icon>
            </div>
            <div class="transaction-info">
              <div class="transaction-title">{{ transaction.title }}</div>
              <div class="transaction-meta">
                <span class="transaction-category">{{ transaction.category }}</span>
                @if (transaction.notes) {
                  <span class="transaction-note">{{ transaction.notes }}</span>
                }
              </div>
            </div>
            <div class="transaction-date">
              {{ formatDate(transaction.date) }}
            </div>
            <div class="transaction-amount" [class.income-amount]="transaction.type === 'income'" [class.expense-amount]="transaction.type === 'expense'">
              {{ transaction.type === 'income' ? '+' : '−' }}₵{{ transaction.amount | number:'1.2-2' }}
            </div>
            <div class="transaction-actions">
              <button class="action-btn" (click)="edit.emit(transaction)" title="Edit">
                <iconify-icon icon="ph:pencil" width="16" height="16"></iconify-icon>
              </button>
              <button class="action-btn delete-btn" (click)="delete.emit(transaction.id)" title="Delete">
                <iconify-icon icon="ph:trash" width="16" height="16"></iconify-icon>
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <iconify-icon icon="ph:receipt" width="48" height="48" class="empty-icon"></iconify-icon>
            <p>No transactions found</p>
            <span>Add one using the form</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .list-card {
      background: var(--card-bg, #FFFFFF);
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border, #E7E5E4);
    }
    
    h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: var(--text-primary, #1C1917);
      margin: 0;
    }
    
    .filter-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .filter-icon {
      color: var(--text-muted, #A8A29E);
    }
    
    .filter-select {
      padding: 6px 12px;
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      color: var(--text-primary, #1C1917);
      background: var(--card-bg, #FFFFFF);
      cursor: pointer;
    }
    
    .transactions-table {
      background: var(--card-bg, #FFFFFF);
    }
    
    .transaction-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border, #E7E5E4);
      transition: background 0.15s;
    }
    
    .transaction-row:nth-child(even) {
      background: var(--canvas, #FAFAF9);
    }
    
    .transaction-row:hover {
      background: var(--primary-tint, #F0FDFA);
    }
    
    .transaction-row:last-child {
      border-bottom: none;
    }
    
    .transaction-type-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .income-type {
      background: var(--income-tint, #F0FDF4);
      color: var(--income, #15803D);
    }
    
    .expense-type {
      background: var(--expense-tint, #FDF2F8);
      color: var(--expense, #BE185D);
    }
    
    .transaction-info {
      flex: 1;
      min-width: 0;
    }
    
    .transaction-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: var(--text-primary, #1C1917);
      margin-bottom: 2px;
    }
    
    .transaction-meta {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .transaction-category {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 12px;
      color: var(--text-secondary, #78716C);
    }
    
    .transaction-note {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 12px;
      color: var(--text-muted, #A8A29E);
      font-style: italic;
    }
    
    .transaction-date {
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 400;
      font-size: 12px;
      color: var(--text-muted, #A8A29E);
      white-space: nowrap;
      min-width: 90px;
      text-align: right;
    }
    
    .transaction-amount {
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 500;
      font-size: 14px;
      font-variant-numeric: tabular-nums;
      min-width: 120px;
      text-align: right;
      white-space: nowrap;
    }
    
    .income-amount {
      color: var(--income, #15803D);
    }
    
    .expense-amount {
      color: var(--expense, #BE185D);
    }
    
    .transaction-actions {
      display: flex;
      gap: 4px;
    }
    
    .action-btn {
      width: 32px;
      height: 32px;
      border: 1px solid var(--border, #E7E5E4);
      background: var(--card-bg, #FFFFFF);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary, #78716C);
      transition: all 0.15s;
    }
    
    .action-btn:hover {
      border-color: var(--border-hover, #D6D3D1);
      color: var(--text-primary, #1C1917);
    }
    
    .delete-btn:hover {
      border-color: var(--expense, #BE185D);
      color: var(--expense, #BE185D);
      background: var(--expense-tint, #FDF2F8);
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }
    
    .empty-icon {
      color: var(--text-muted, #A8A29E);
      margin-bottom: 16px;
    }
    
    .empty-state p {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 15px;
      color: var(--text-primary, #1C1917);
      margin: 0 0 4px;
    }
    
    .empty-state span {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 13px;
      color: var(--text-secondary, #78716C);
    }

    @media (max-width: 768px) {
  .list-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  h3 {
    font-size: 15px;
  }
  
  .transaction-row {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .transaction-info {
    flex: 1 1 100%;
    order: 2;
  }
  
  .transaction-type-icon {
    order: 1;
  }
  
  .transaction-date {
    order: 3;
    min-width: auto;
    font-size: 11px;
  }
  
  .transaction-amount {
    order: 4;
    min-width: auto;
    font-size: 13px;
  }
  
  .transaction-actions {
    order: 5;
  }
  
  .filter-select {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .transaction-row {
    padding: 10px 12px;
  }
  
  .transaction-title {
    font-size: 13px;
  }
  
  .transaction-amount {
    font-size: 12px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
}


  `]
})
export class ExpenseListComponent {
  expenses = input.required<Transaction[]>();
  delete = output<string>();
  edit = output<Transaction>();
  
  categories = input<string[]>([]);
  selectedCategory = signal<string>('');
  
  filteredTransactions(): Transaction[] {
    const cat = this.selectedCategory();
    if (!cat) return this.expenses();
    return this.expenses().filter(e => e.category === cat);
  }

  filterCategory(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedCategory.set(select.value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}