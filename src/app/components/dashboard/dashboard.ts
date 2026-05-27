import { Component, computed, input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/expense';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="dashboard">
      <div class="breakdown-section">
        <div class="section-header">
          <iconify-icon icon="ph:arrow-down-left" width="20" height="20" style="color: var(--income)"></iconify-icon>
          <h3>Income Breakdown</h3>
        </div>
        <div class="category-list">
          @for (cat of incomeCategories(); track cat.category) {
            <div class="category-item">
              <div class="category-header">
                <span class="category-name">{{ cat.category }}</span>
                <span class="category-amount income-amount amount">₵{{ cat.total | number:'1.2-2' }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill income-fill" [style.width.%]="cat.percentage"></div>
              </div>
              <div class="category-percentage amount">{{ cat.percentage | number:'1.1-1' }}%</div>
            </div>
          } @empty {
            <div class="no-data">
              <iconify-icon icon="ph:receipt" width="32" height="32" class="no-data-icon"></iconify-icon>
              <p>No income recorded yet</p>
            </div>
          }
        </div>
      </div>

      <div class="breakdown-section">
        <div class="section-header">
          <iconify-icon icon="ph:arrow-up-right" width="20" height="20" style="color: var(--expense)"></iconify-icon>
          <h3>Expense Breakdown</h3>
        </div>
        <div class="category-list">
          @for (cat of expenseCategories(); track cat.category) {
            <div class="category-item">
              <div class="category-header">
                <span class="category-name">{{ cat.category }}</span>
                <span class="category-amount expense-amount amount">₵{{ cat.total | number:'1.2-2' }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill expense-fill" [style.width.%]="cat.percentage" [style.background]="getCategoryColor(cat.category)"></div>
              </div>
              <div class="category-meta">
                <span class="category-percentage amount">{{ cat.percentage | number:'1.1-1' }}%</span>
                @if (getBudgetAlert(cat.category, cat.total)) {
                  <span class="budget-alert">
                    <iconify-icon icon="ph:warning" width="14" height="14"></iconify-icon>
                    Over budget
                  </span>
                }
              </div>
            </div>
          } @empty {
            <div class="no-data">
              <iconify-icon icon="ph:receipt" width="32" height="32" class="no-data-icon"></iconify-icon>
              <p>No expenses recorded yet</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .breakdown-section {
      background: var(--card-bg, #FFFFFF);
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      padding: 24px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    
    h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: var(--text-primary, #1C1917);
      margin: 0;
    }
    
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .category-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: var(--text-primary, #1C1917);
    }
    
    .category-amount {
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 500;
      font-size: 14px;
      font-variant-numeric: tabular-nums;
    }
    
    .income-amount {
      color: var(--income, #15803D);
    }
    
    .expense-amount {
      color: var(--expense, #BE185D);
    }
    
    .progress-bar {
      height: 6px;
      background: var(--canvas, #FAFAF9);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    
    .income-fill {
      background: var(--income, #15803D);
    }
    
    .expense-fill {
      background: var(--expense, #BE185D);
    }
    
    .category-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
    }
    
    .category-percentage {
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 400;
      font-size: 12px;
      color: var(--text-muted, #A8A29E);
      font-variant-numeric: tabular-nums;
    }
    
    .budget-alert {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 12px;
      color: var(--warning, #D97706);
    }
    
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      text-align: center;
    }
    
    .no-data-icon {
      color: var(--text-muted, #A8A29E);
      margin-bottom: 12px;
    }
    
    .no-data p {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: var(--text-secondary, #78716C);
      margin: 0;
    }

@media (max-width: 768px) {
  .breakdown-section {
    padding: 16px;
  }
  
  h3 {
    font-size: 15px;
  }
  
  .category-name {
    font-size: 13px;
  }
  
  .category-amount {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .breakdown-section {
    padding: 12px;
  }
  
  .category-item {
    gap: 10px;
  }
}

  `]
})
export class DashboardComponent {
  expenses = input.required<Transaction[]>();
  
  private budgets: Record<string, number> = {
    'Food': 500,
    'Transport': 300,
    'Entertainment': 200,
    'Bills': 600,
    'Shopping': 300,
    'Healthcare': 400,
    'Other': 200
  };

  totalIncome = computed(() => 
    this.expenses()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  totalExpenses = computed(() => 
    this.expenses()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  incomeCategories = computed(() => {
    const incomeTransactions = this.expenses().filter(t => t.type === 'income');
    const categories = [...new Set(incomeTransactions.map(t => t.category))];
    const total = this.totalIncome();
    
    return categories.map(category => {
      const catTotal = incomeTransactions
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category,
        total: catTotal,
        percentage: total > 0 ? (catTotal / total) * 100 : 0
      };
    }).sort((a, b) => b.total - a.total);
  });

  expenseCategories = computed(() => {
    const expenseTransactions = this.expenses().filter(t => t.type === 'expense');
    const categories = [...new Set(expenseTransactions.map(t => t.category))];
    const total = this.totalExpenses();
    
    return categories.map(category => {
      const catTotal = expenseTransactions
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category,
        total: catTotal,
        percentage: total > 0 ? (catTotal / total) * 100 : 0
      };
    }).sort((a, b) => b.total - a.total);
  });

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Food': '#BE185D',
      'Transport': '#9D174D',
      'Entertainment': '#DB2777',
      'Bills': '#E11D48',
      'Shopping': '#FB7185',
      'Healthcare': '#F43F5E',
      'Other': '#FDA4AF'
    };
    return colors[category] || 'var(--expense)';
  }

  getBudgetAlert(category: string, total: number): boolean {
    const limit = this.budgets[category];
    return limit ? total > limit : false;
  }
}