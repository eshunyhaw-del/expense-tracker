import { Component, output, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="modal-overlay" (click)="cancel.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <iconify-icon icon="ph:plus-circle" width="24" height="24" style="color: var(--primary)"></iconify-icon>
          <h3>Create New Account</h3>
        </div>
        
        <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Account Name</label>
            <input 
              formControlName="name" 
              type="text" 
              placeholder="e.g., Savings, Business Cash"
            />
            @if (accountForm.get('name')?.invalid && accountForm.get('name')?.touched) {
              <small class="error">Account name is required</small>
            }
          </div>
          
          <div class="form-group">
            <label>Account Type</label>
            <div class="type-options">
              <label class="type-option" [class.selected]="accountForm.get('type')?.value === 'cash-book'">
                <input type="radio" formControlName="type" value="cash-book" class="hidden-radio" />
                <iconify-icon icon="ph:book-open-duotone" width="24" height="24"></iconify-icon>
                <div class="type-info">
                  <span class="type-name">Cash Book</span>
                  <span class="type-desc">Track cash transactions</span>
                </div>
              </label>
              <label class="type-option" [class.selected]="accountForm.get('type')?.value === 'custom'">
                <input type="radio" formControlName="type" value="custom" class="hidden-radio" />
                <iconify-icon icon="ph:wallet-duotone" width="24" height="24"></iconify-icon>
                <div class="type-info">
                  <span class="type-name">Custom Account</span>
                  <span class="type-desc">General purpose account</span>
                </div>
              </label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="submit" [disabled]="!accountForm.valid" class="btn-primary">
              <iconify-icon icon="ph:check" width="16" height="16" style="color: #fff; vertical-align: middle; margin-right: 4px;"></iconify-icon>
              Create Account
            </button>
            <button type="button" (click)="cancel.emit()" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-card {
      background: var(--card-bg, #FFFFFF);
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      padding: 32px;
      width: 90%;
      max-width: 440px;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 18px;
      color: var(--text-primary, #1C1917);
      margin: 0;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 13px;
      color: var(--text-secondary, #78716C);
      margin-bottom: 6px;
    }
    
    input[type="text"] {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      color: var(--text-primary, #1C1917);
      background: var(--card-bg, #FFFFFF);
    }
    
    input:focus {
      outline: none;
      border-color: var(--primary, #0D9488);
    }
    
    .error {
      color: var(--expense, #BE185D);
      font-size: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      margin-top: 4px;
      display: block;
    }
    
    .type-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .type-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }
    
    .type-option:hover {
      border-color: var(--border-hover, #D6D3D1);
    }
    
    .type-option.selected {
      border-color: var(--primary, #0D9488);
      background: var(--primary-tint, #F0FDFA);
    }
    
    .hidden-radio {
      display: none;
    }
    
    .type-info {
      display: flex;
      flex-direction: column;
    }
    
    .type-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: var(--text-primary, #1C1917);
    }
    
    .type-desc {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 12px;
      color: var(--text-secondary, #78716C);
    }
    
    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 24px;
    }
    
    .btn-primary {
      flex: 1;
      padding: 12px;
      background: var(--primary, #0D9488);
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
      background: var(--primary-hover, #0F766E);
    }
    
    .btn-primary:disabled {
      background: var(--border, #E7E5E4);
      cursor: not-allowed;
    }
    
    .btn-secondary {
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
    
    .btn-secondary:hover {
      border-color: var(--border-hover, #D6D3D1);
      color: var(--text-primary, #1C1917);
    }
  `]
})
export class AccountFormComponent {
  accountCreated = output<{ name: string; type: 'cash-book' | 'custom' }>();
  cancel = output<void>();
  
  private fb = inject(FormBuilder);
  
  accountForm = this.fb.group({
    name: ['', Validators.required],
    type: ['cash-book', Validators.required]
  });

  onSubmit() {
    if (this.accountForm.valid) {
      this.accountCreated.emit({
        name: this.accountForm.value.name!,
        type: this.accountForm.value.type as 'cash-book' | 'custom'
      });
      this.accountForm.reset({ type: 'cash-book' });
    }
  }
}