import { Component, signal, output, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="settings">
      <div class="settings-card">
        <h2>Settings</h2>
        
        <div class="settings-section">
          <h3>Appearance</h3>
          <div class="setting-item">
            <span>Theme</span>
            <select [(ngModel)]="theme" (change)="saveSettings()">
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
            </select>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Currency</h3>
          <div class="setting-item">
            <span>Currency Symbol</span>
            <select [(ngModel)]="currency" (change)="saveSettings()">
              <option value="₵">₵ GHS</option>
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="£">£ GBP</option>
              <option value="¥">¥ JPY</option>
              <option value="₹">₹ INR</option>
            </select>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Data Management</h3>
          <button class="btn-outline" (click)="exportData()">
            <iconify-icon icon="ph:download" width="16" height="16"></iconify-icon>
            Export Data
          </button>
          <button class="btn-outline" (click)="importData()">
            <iconify-icon icon="ph:upload" width="16" height="16"></iconify-icon>
            Import Data
          </button>
          <button class="btn-danger" (click)="clearAllData()">
            <iconify-icon icon="ph:trash" width="16" height="16"></iconify-icon>
            Clear All Data
          </button>
        </div>
        
        <div class="settings-section">
          <h3>About</h3>
          <div class="about-info">
            <p><strong>FinancePro</strong></p>
            <p>Version 1.0.0</p>
            <p>Manage your money, master your life</p>
          </div>
        </div>
      </div>
      
      @if (showMessage()) {
        <div class="message" [class.success]="messageType() === 'success'" [class.error]="messageType() === 'error'">
          {{ message() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .settings {
      max-width: 600px;
    }
    
    .settings-card {
      background: var(--card-bg, #FFFFFF);
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 8px;
      overflow: hidden;
    }
    
    h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 18px;
      color: var(--text-primary, #1C1917);
      padding: 24px;
      margin: 0;
      border-bottom: 1px solid var(--border, #E7E5E4);
    }
    
    .settings-section {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border, #E7E5E4);
    }
    
    .settings-section:last-child {
      border-bottom: none;
    }
    
    .settings-section h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary, #1C1917);
      margin: 0 0 12px;
    }
    
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    
    .setting-item span {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: var(--text-secondary, #78716C);
    }
    
    select {
      padding: 8px 12px;
      border: 1px solid var(--border, #E7E5E4);
      border-radius: 6px;
      font-size: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      color: var(--text-primary, #1C1917);
      background: var(--card-bg, #FFFFFF);
      cursor: pointer;
    }
    
    .btn-outline, .btn-danger {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 12px 16px;
      margin-bottom: 8px;
      border: 1px solid var(--border, #E7E5E4);
      background: var(--card-bg, #FFFFFF);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      color: var(--text-primary, #1C1917);
      transition: all 0.15s;
    }
    
    .btn-outline:hover {
      border-color: var(--border-hover, #D6D3D1);
      background: var(--canvas, #FAFAF9);
    }
    
    .btn-danger:hover {
      border-color: var(--expense, #BE185D);
      color: var(--expense, #BE185D);
      background: var(--expense-tint, #FDF2F8);
    }
    
    .btn-outline:last-child, .btn-danger:last-child {
      margin-bottom: 0;
    }
    
    .about-info {
      text-align: center;
      padding: 16px;
    }
    
    .about-info p {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: var(--text-secondary, #78716C);
      margin: 4px 0;
    }
    
    .message {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 8px;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 14px;
      z-index: 1000;
      animation: slideUp 0.3s ease;
    }
    
    .success {
      background: var(--income, #15803D);
    }
    
    .error {
      background: var(--expense, #BE185D);
    }
    
    @keyframes slideUp {
      from {
        transform: translate(-50%, 100px);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
  `]
})
export class SettingsComponent {
  themeChanged = output<string>();
  theme = signal('light');
  currency = signal('₵');
  showMessage = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('app-settings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          this.theme.set(settings.theme || 'light');
          this.currency.set(settings.currency || '₵');
        } catch {}
      }
    }
  }

  saveSettings() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const settings = {
      theme: this.theme(),
      currency: this.currency()
    };
    localStorage.setItem('app-settings', JSON.stringify(settings));
    this.themeChanged.emit(this.theme());
    this.showNotification('Settings saved!', 'success');
  }

  exportData() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const data = {
      transactions: localStorage.getItem('expense-tracker-transactions'),
      accounts: localStorage.getItem('expense-tracker-accounts'),
      notes: localStorage.getItem('expense-tracker-notes'),
      settings: localStorage.getItem('app-settings')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financepro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    this.showNotification('Data exported successfully!', 'success');
  }

  importData() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.transactions) localStorage.setItem('expense-tracker-transactions', data.transactions);
          if (data.accounts) localStorage.setItem('expense-tracker-accounts', data.accounts);
          if (data.notes) localStorage.setItem('expense-tracker-notes', data.notes);
          if (data.settings) {
            localStorage.setItem('app-settings', data.settings);
            try {
              const settings = JSON.parse(data.settings);
              if (settings.theme) {
                this.theme.set(settings.theme);
                this.themeChanged.emit(settings.theme);
              }
              if (settings.currency) this.currency.set(settings.currency);
            } catch {}
          }
          this.showNotification('Data imported! Please refresh.', 'success');
        } catch {
          this.showNotification('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  clearAllData() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (confirm('This will delete ALL your data. Are you sure?')) {
      if (confirm('Final warning: This cannot be undone!')) {
        localStorage.removeItem('expense-tracker-transactions');
        localStorage.removeItem('expense-tracker-accounts');
        localStorage.removeItem('expense-tracker-notes');
        this.showNotification('All data cleared. Please refresh.', 'success');
      }
    }
  }

  showNotification(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
    this.showMessage.set(true);
    setTimeout(() => this.showMessage.set(false), 3000);
  }
}