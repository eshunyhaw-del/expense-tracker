import { Component, output, inject, input, effect, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaction } from '../../models/expense';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="form-card">
      <h3>{{ editingExpense() ? 'Edit Transaction' : 'New Transaction' }}</h3>
      
      <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">
        <div class="type-toggle">
          <button 
            type="button"
            [class.active]="transactionType() === 'expense'"
            (click)="setTransactionType('expense')">
            <iconify-icon icon="ph:arrow-up-right" width="16" height="16"></iconify-icon>
            Cash Out
          </button>
          <button 
            type="button"
            [class.active]="transactionType() === 'income'"
            (click)="setTransactionType('income')">
            <iconify-icon icon="ph:arrow-down-left" width="16" height="16"></iconify-icon>
            Cash In
          </button>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <input 
            formControlName="title" 
            [placeholder]="transactionType() === 'income' ? 'What did you earn?' : 'What did you spend on?'" 
          />
          @if (expenseForm.get('title')?.invalid && expenseForm.get('title')?.touched) {
            <small class="error">Description is required</small>
          }
        </div>
        
        <div class="form-group">
          <label>Amount</label>
          <div class="amount-input-wrapper">
            <span class="currency-symbol">₵</span>
            <input 
              formControlName="amount" 
              type="number" 
              placeholder="0.00" 
              step="0.01" 
              class="amount-input"
            />
          </div>
          @if (expenseForm.get('amount')?.invalid && expenseForm.get('amount')?.touched) {
            <small class="error">Amount must be greater than 0</small>
          }
        </div>
        
        <div class="form-group">
          <label>Category</label>
          <select formControlName="category">
            <option value="">Select category</option>
            @if (transactionType() === 'income') {
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Business">Business</option>
              <option value="Investment">Investment</option>
              <option value="Gift">Gift</option>
              <option value="Other Income">Other Income</option>
            } @else {
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills">Bills</option>
              <option value="Shopping">Shopping</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            }
          </select>
          @if (expenseForm.get('category')?.invalid && expenseForm.get('category')?.touched) {
            <small class="error">Category is required</small>
          }
        </div>
        
        <div class="form-group">
          <label>Date</label>
          <input formControlName="date" type="date" />
        </div>
        
        <div class="form-group">
          <label>Notes (optional)</label>
          <textarea formControlName="notes" placeholder="Add a note..." rows="2"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" [disabled]="!expenseForm.valid" class="btn-primary" [class.income-btn]="transactionType() === 'income'">
            <iconify-icon [icon]="editingExpense() ? 'ph:pencil' : 'ph:plus-circle'" width="16" height="16" style="color: #fff; vertical-align: middle; margin-right: 4px;"></iconify-icon>
            {{ editingExpense() ? 'Update' : 'Add' }} {{ transactionType() === 'income' ? 'Income' : 'Expense' }}
          </button>
          @if (editingExpense()) {
            <button type="button" class="btn-cancel" (click)="cancelEdit()">Cancel</button>
          }
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-card {
      background: var(--card-bg, #FFFFFF);
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      padding: 24px;
    }
    
    h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: var(--text-primary, #1C1917);
      margin: 0 0 20px;
    }
    
    .type-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      background: var(--canvas, #FAFAF9);
      padding: 4px;
      border-radius: 8px;
    }
    
    .type-toggle button {
      flex: 1;
      padding: 10px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--text-secondary, #78716C);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s;
    }
    
    .type-toggle button.active {
      background: var(--expense, #BE185D);
      color: #FFFFFF;
    }
    
    .type-toggle button.active.income-btn,
    .type-toggle button.income-active {
      background: var(--income, #15803D);
      color: #FFFFFF;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    label {
      display: block;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 13px;
      color: var(--text-secondary, #78716C);
      margin-bottom: 6px;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      color: var(--text-primary, #1C1917);
      background: var(--card-bg, #FFFFFF);
      transition: border-color 0.15s;
    }
    
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary, #0D9488);
    }
    
    .amount-input-wrapper {
      position: relative;
    }
    
    .currency-symbol {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 500;
      color: var(--text-muted, #A8A29E);
      font-size: 14px;
    }
    
    .amount-input {
      font-family: 'IBM Plex Mono', monospace !important;
      font-weight: 500;
      padding-left: 28px !important;
    }
    
    textarea {
      resize: vertical;
      min-height: 60px;
    }
    
    .error {
      color: var(--expense, #BE185D);
      font-size: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      margin-top: 4px;
      display: block;
    }
    
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .btn-primary {
      flex: 1;
      padding: 12px;
      background: var(--expense, #BE185D);
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    
    .btn-primary:hover {
      background: #9D174D;
    }
    
    .btn-primary.income-btn {
      background: var(--income, #15803D);
    }
    
    .btn-primary.income-btn:hover {
      background: #166534;
    }
    
    .btn-primary:disabled {
      background: var(--border, #E7E5E4);
      cursor: not-allowed;
    }
    
    .btn-cancel {
      padding: 12px 20px;
      background: transparent;
      color: var(--text-secondary, #78716C);
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.15s;
    }
    
    .btn-cancel:hover {
      border-color: var(--border-hover, #D6D3D1);
      color: var(--text-primary, #1C1917);
    }

@media (max-width: 768px) {
  .form-card {
    padding: 16px;
  }
  
  h3 {
    font-size: 15px;
  }
  
  .type-toggle button {
    font-size: 12px;
    padding: 8px;
  }
  
  input, select, textarea {
    font-size: 16px; /* Prevents iOS zoom */
    padding: 10px 12px;
  }
  
  .btn-primary, .btn-cancel {
    font-size: 13px;
    padding: 10px;
  }
}

  `]
})
export class ExpenseFormComponent {
  expenseAdded = output<Omit<Transaction, 'id' | 'accountId'>>();
  expenseUpdated = output<Transaction>();
  editCancelled = output<void>();
  editingExpense = input<Transaction | null>(null);
  
  transactionType = signal<'income' | 'expense'>('expense');
  
  private fb = inject(FormBuilder);
  
  expenseForm = this.fb.group({
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    category: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    notes: ['']
  });

  constructor() {
    effect(() => {
      const expense = this.editingExpense();
      if (expense) {
        this.transactionType.set(expense.type);
        this.expenseForm.patchValue({
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          notes: expense.notes || ''
        });
      }
    });
  }

  setTransactionType(type: 'income' | 'expense') {
    this.transactionType.set(type);
    this.expenseForm.patchValue({ category: '' });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const transactionData = {
        title: formValue.title!,
        amount: Number(formValue.amount),
        category: formValue.category!,
        date: formValue.date!,
        type: this.transactionType(),
        notes: formValue.notes || ''
      };

      if (this.editingExpense()) {
        this.expenseUpdated.emit({
          ...transactionData,
          id: this.editingExpense()!.id,
          accountId: this.editingExpense()!.accountId
        });
      } else {
        this.expenseAdded.emit(transactionData);
      }
      
      this.expenseForm.reset({ 
        date: new Date().toISOString().split('T')[0],
        category: ''
      });
      this.transactionType.set('expense');
    }
  }

  cancelEdit() {
    this.expenseForm.reset({ date: new Date().toISOString().split('T')[0] });
    this.transactionType.set('expense');
    this.editCancelled.emit();
  }
}