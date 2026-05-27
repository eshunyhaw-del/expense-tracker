import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay -->
    <div class="overlay" [class.active]="isOpen()" (click)="close.emit()"></div>
    
    <!-- Side Menu -->
    <div class="side-menu" [class.open]="isOpen()">
      <div class="menu-header">
        <h2>Menu</h2>
        <button class="close-btn" (click)="close.emit()">✕</button>
      </div>
      
      <div class="menu-content">
        <div class="menu-section">
          <h3>Overview</h3>
          <button (click)="navigate('summary')">📊 Summary</button>
          <button (click)="navigate('account-summary')">💳 Account Summary</button>
          <button (click)="navigate('transactions')">📝 Transaction - All Accounts</button>
        </div>
        
        <div class="menu-section">
          <h3>Switch Mode</h3>
          <button (click)="navigate('switch-income-expense')">🔄 Switch to Income/Expense</button>
          <button (click)="navigate('switch-cash-in-out')">💵 Switch to Cash In/Cash Out</button>
        </div>
        
        <div class="menu-section">
          <h3>Tools</h3>
          <button (click)="navigate('notebook')">📓 Notebook</button>
          <button (click)="navigate('calculator')">🔢 Cash Calculator</button>
        </div>
        
        <div class="menu-section">
          <h3>Support</h3>
          <button (click)="navigate('help')">❓ Help</button>
          <button (click)="navigate('rate')">⭐ Rate Us</button>
          <button (click)="navigate('recommend')">📤 Recommend</button>
          <button (click)="navigate('settings')">⚙️ Settings</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 998;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }
    
    .overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .side-menu {
      position: fixed;
      top: 0;
      left: -300px;
      width: 300px;
      height: 100%;
      background: white;
      z-index: 999;
      transition: left 0.3s ease;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      overflow-y: auto;
    }
    
    .side-menu.open {
      left: 0;
    }
    
    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .menu-header h2 {
      margin: 0;
      font-size: 20px;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
    }
    
    .menu-content {
      padding: 15px;
    }
    
    .menu-section {
      margin-bottom: 20px;
    }
    
    .menu-section h3 {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }
    
    .menu-section button {
      display: block;
      width: 100%;
      padding: 12px 15px;
      border: none;
      background: none;
      text-align: left;
      font-size: 15px;
      cursor: pointer;
      border-radius: 8px;
      margin-bottom: 5px;
      transition: background 0.2s;
    }
    
    .menu-section button:hover {
      background: #f5f5f5;
    }
  `]
})
export class SideMenu {
  isOpen = input<boolean>(false);
  close = output<void>();
  menuItemSelected = output<string>();

  navigate(page: string) {
    this.menuItemSelected.emit(page);
    this.close.emit();
  }
}