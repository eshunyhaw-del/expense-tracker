import { Component, computed, inject, signal, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SplashScreenComponent } from './components/splash-screen/splash-screen';
import { ExpenseFormComponent } from './components/expense-form/expense-form';
import { ExpenseListComponent } from './components/expense-list/expense-list';
import { AccountFormComponent } from './components/account-form/account-form';
import { NotebookComponent } from './components/notebook/notebook';
import { CalculatorComponent } from './components/calculator/calculator';
import { SettingsComponent } from './components/settings/settings';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner';
import { ErrorToastComponent } from './components/error-toast/error-toast';
import { TransactionService } from './services/expense';
import { AccountService } from './services/account.service';
import { BudgetService } from './services/budget.service';
import { RecurringService } from './services/recurring.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { Transaction, RecurringTransaction, Budget } from './models/expense';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SplashScreenComponent,
    ExpenseFormComponent,
    ExpenseListComponent,
    AccountFormComponent,
    NotebookComponent,
    CalculatorComponent,
    SettingsComponent,
    LoadingSpinnerComponent,
    ErrorToastComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (showSplash()) {
      <app-splash-screen (splashDone)="showSplash.set(false)" />
    }

    <div class="app-layout" [class.dark]="isDarkMode()">
      <!-- Sidebar -->
      <aside class="sidebar" [class.mobile-open]="menuOpen()">
        <div class="sidebar-brand">
          <iconify-icon icon="ph:wallet-duotone" width="28" height="28" style="color: var(--primary)"></iconify-icon>
          <span class="brand-name">FinancePro</span>
        </div>
        
        <nav class="sidebar-nav">
          <a class="nav-item" [class.active]="currentPage() === 'home'" (click)="navigateTo('home'); menuOpen.set(false)">
            <iconify-icon icon="ph:squares-four-duotone" width="20" height="20"></iconify-icon>
            <span class="nav-label">Dashboard</span>
          </a>
          <a class="nav-item" [class.active]="currentPage() === 'transactions'" (click)="navigateTo('transactions'); menuOpen.set(false)">
            <iconify-icon icon="ph:list-numbers-duotone" width="20" height="20"></iconify-icon>
            <span class="nav-label">Transactions</span>
          </a>
          <a class="nav-item" [class.active]="currentPage() === 'recurring'" (click)="navigateTo('recurring'); menuOpen.set(false)">
            <iconify-icon icon="ph:repeat-duotone" width="20" height="20"></iconify-icon>
            <span class="nav-label">Recurring</span>
          </a>
          <a class="nav-item" [class.active]="currentPage() === 'budgets'" (click)="navigateTo('budgets'); menuOpen.set(false)">
            <iconify-icon icon="ph:target-duotone" width="20" height="20"></iconify-icon>
            <span class="nav-label">Budgets</span>
          </a>
          <a class="nav-item" [class.active]="currentPage() === 'account-summary'" (click)="navigateTo('account-summary'); menuOpen.set(false)">
            <iconify-icon icon="ph:buildings-duotone" width="20" height="20"></iconify-icon>
            <span class="nav-label">Accounts</span>
          </a>
          <a class="nav-item" [class.active]="currentPage() === 'notebook'" (click)="navigateTo('notebook'); menuOpen.set(false)">
            <iconify-icon icon="ph:note-duotone" width="20" height="20"></iconify-icon>
            <span class="nav-label">Notes</span>
          </a>
          <a class="nav-item" [class.active]="currentPage() === 'calculator'" (click)="navigateTo('calculator'); menuOpen.set(false)">
            <iconify-icon icon="ph:calculator-duotone" width="20" height="20"></iconify-icon>
            <span class="nav-label">Calculator</span>
          </a>
          <a class="nav-item" [class.active]="currentPage() === 'settings'" (click)="navigateTo('settings'); menuOpen.set(false)">
            <iconify-icon icon="ph:gear-duotone" width="20" height="20"></iconify-icon>
            <span class="nav-label">Settings</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="help-btn" (click)="navigateTo('help'); menuOpen.set(false)">
            <iconify-icon icon="ph:question-duotone" width="18" height="18"></iconify-icon>
            Help & Support
          </button>
          <button class="help-btn privacy-btn" (click)="navigateTo('privacy'); menuOpen.set(false)" style="margin-top: 8px;">
            <iconify-icon icon="ph:shield-check-duotone" width="18" height="18"></iconify-icon>
            Privacy Policy
          </button>
        </div>
      </aside>

      @if (menuOpen()) {
        <div class="sidebar-overlay" (click)="menuOpen.set(false)"></div>
      }

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar">
          <div class="top-bar-left">
            <button class="menu-toggle" (click)="menuOpen.set(true)">
              <span></span><span></span><span></span>
            </button>
            <div class="account-selector">
              <div class="selected-account" (click)="showAccounts.set(!showAccounts())">
                <iconify-icon icon="ph:book-open-duotone" width="20" height="20" style="color: var(--primary)"></iconify-icon>
                <span class="account-name">{{ currentAccount()?.name || 'Select Account' }}</span>
                <iconify-icon icon="ph:caret-down" width="12" height="12" class="dropdown-arrow"></iconify-icon>
              </div>
              @if (showAccounts()) {
                <div class="account-dropdown">
                  @for (account of accounts(); track account.id) {
                    <div 
                      class="account-option" 
                      [class.active]="account.id === currentAccount()?.id"
                      (click)="switchAccount(account.id)"
                    >
                      <iconify-icon [icon]="account.type === 'cash-book' ? 'ph:book-open-duotone' : 'ph:wallet-duotone'" width="18" height="18"></iconify-icon>
                      <span>{{ account.name }}</span>
                      @if (account.id === currentAccount()?.id) {
                        <iconify-icon icon="ph:check" width="16" height="16" class="check"></iconify-icon>
                      }
                    </div>
                  }
                  <div class="account-option add-new" (click)="showAccountForm.set(true); showAccounts.set(false)">
                    <iconify-icon icon="ph:plus-circle" width="18" height="18"></iconify-icon>
                    <span>Create New Account</span>
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="top-bar-right">
            <button class="icon-btn" (click)="toggleDarkMode()" [title]="isDarkMode() ? 'Light mode' : 'Dark mode'">
              <iconify-icon [icon]="isDarkMode() ? 'ph:sun-duotone' : 'ph:moon-duotone'" width="18" height="18"></iconify-icon>
            </button>
            <button class="icon-btn" (click)="navigateTo('settings')" title="Settings">
              <iconify-icon icon="ph:gear-duotone" width="18" height="18"></iconify-icon>
            </button>
          </div>
        </header>

        @if (currentPage() === 'home' || currentPage() === 'transactions') {
          <div class="period-bar">
            <div class="period-filters">
              <button [class.active]="selectedPeriod() === 'all'" (click)="selectedPeriod.set('all')">All Time</button>
              <button [class.active]="selectedPeriod() === 'daily'" (click)="selectedPeriod.set('daily')">Today</button>
              <button [class.active]="selectedPeriod() === 'weekly'" (click)="selectedPeriod.set('weekly')">This Week</button>
              <button [class.active]="selectedPeriod() === 'monthly'" (click)="selectedPeriod.set('monthly')">This Month</button>
              <button [class.active]="selectedPeriod() === 'yearly'" (click)="selectedPeriod.set('yearly')">This Year</button>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="card-icon income-icon">
                <iconify-icon icon="ph:arrow-down-left-duotone" width="24" height="24" style="color: var(--income)"></iconify-icon>
              </div>
              <div class="card-info">
                <div class="card-label">Total Income</div>
                <div class="card-value income-value amount">₵{{ totalIncome() | number:'1.2-2' }}</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-icon expense-icon">
                <iconify-icon icon="ph:arrow-up-right-duotone" width="24" height="24" style="color: var(--expense)"></iconify-icon>
              </div>
              <div class="card-info">
                <div class="card-label">Total Expenses</div>
                <div class="card-value expense-value amount">₵{{ totalExpense() | number:'1.2-2' }}</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="card-icon balance-icon">
                <iconify-icon icon="ph:scale-duotone" width="24" height="24" style="color: var(--primary)"></iconify-icon>
              </div>
              <div class="card-info">
                <div class="card-label">Net Balance</div>
                <div class="card-value amount" [class.income-value]="netTotal() >= 0" [class.expense-value]="netTotal() < 0">
                  ₵{{ netTotal() | number:'1.2-2' }}
                </div>
              </div>
            </div>
          </div>
        }

        <div class="page-content">
          @if (currentPage() === 'home') {
            <div class="charts-grid">
              <div class="chart-card">
                <h3>Income vs Expenses</h3>
                <div class="bar-chart">
                  <div class="bar-group">
                    <div class="bar-label">This Month</div>
                    <div class="bar-container">
                      <div class="bar income-bar" [style.width.%]="getIncomePercentage()">
                        <span class="bar-value">₵{{ monthlyIncome() | number:'1.0-0' }}</span>
                      </div>
                    </div>
                    <div class="bar-container">
                      <div class="bar expense-bar" [style.width.%]="getExpensePercentage()">
                        <span class="bar-value">₵{{ monthlyExpense() | number:'1.0-0' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="chart-legend">
                  <span class="legend-item"><span class="legend-dot income-dot"></span> Income</span>
                  <span class="legend-item"><span class="legend-dot expense-dot"></span> Expenses</span>
                </div>
              </div>

              <div class="chart-card">
                <h3>Spending by Category</h3>
                <div class="pie-chart-container">
                  @for (cat of categoryPercentages(); track cat.category) {
                    <div class="pie-legend-item">
                      <span class="pie-dot" [style.background]="cat.color"></span>
                      <span class="pie-label">{{ cat.category }}</span>
                      <span class="pie-value amount">{{ cat.percentage | number:'1.0-0' }}%</span>
                    </div>
                  } @empty {
                    <p class="no-data">No expense data</p>
                  }
                </div>
              </div>
            </div>

            <div class="home-layout">
              <div class="home-sidebar">
                <app-expense-form 
                  (expenseAdded)="add($event)"
                  (expenseUpdated)="update($event)"
                  (editCancelled)="cancelEdit()"
                  [editingExpense]="editingExpense()"
                />
              </div>
              <div class="home-main">
                <app-expense-list 
                  [expenses]="currentTransactions()" 
                  [categories]="categories()"
                  (delete)="remove($event)"
                  (edit)="startEdit($event)"
                />
              </div>
            </div>
          } @else if (currentPage() === 'transactions') {
            <div class="transactions-header">
              <h2>All Transactions</h2>
              <div class="export-buttons">
                <button class="btn-secondary" (click)="exportCSV()">
                  <iconify-icon icon="ph:file-csv" width="16" height="16"></iconify-icon>
                  Export CSV
                </button>
                <button class="btn-secondary" (click)="exportPDF()">
                  <iconify-icon icon="ph:file-pdf" width="16" height="16"></iconify-icon>
                  Export PDF
                </button>
              </div>
            </div>
            <app-expense-list 
              [expenses]="allTransactions()" 
              [categories]="allCategories()"
              (delete)="remove($event)"
              (edit)="startEdit($event)"
            />
          } @else if (currentPage() === 'recurring') {
            <div class="recurring-page">
              <div class="page-header">
                <h2>Recurring Transactions</h2>
                <button class="btn-primary" (click)="showRecurringForm.set(true)">
                  <iconify-icon icon="ph:plus" width="16" height="16" style="color: #fff; vertical-align: middle; margin-right: 4px;"></iconify-icon>
                  Add Recurring
                </button>
              </div>

              @if (showRecurringForm()) {
                <div class="recurring-form-card">
                  <h3>New Recurring Transaction</h3>
                  <div class="form-row">
                    <input [(ngModel)]="newRecurring.title" placeholder="Title" class="form-input" />
                    <input [(ngModel)]="newRecurring.amount" type="number" placeholder="Amount" class="form-input" />
                  </div>
                  <div class="form-row">
                    <select [(ngModel)]="newRecurring.type" class="form-input">
                      <option value="expense">Cash Out</option>
                      <option value="income">Cash In</option>
                    </select>
                    <select [(ngModel)]="newRecurring.category" class="form-input">
                      <option value="">Category</option>
                      @if (newRecurring.type === 'income') {
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Business">Business</option>
                      } @else {
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Bills">Bills</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Shopping">Shopping</option>
                      }
                    </select>
                  </div>
                  <div class="form-row">
                    <select [(ngModel)]="newRecurring.frequency" class="form-input">
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <input [(ngModel)]="newRecurring.startDate" type="date" class="form-input" />
                  </div>
                  <div class="form-actions">
                    <button class="btn-primary" (click)="addRecurring()">Save</button>
                    <button class="btn-secondary" (click)="showRecurringForm.set(false)">Cancel</button>
                  </div>
                </div>
              }

              <div class="recurring-list">
                @for (item of currentRecurring(); track item.id) {
                  <div class="recurring-item" [class.inactive]="!item.isActive">
                    <div class="recurring-info">
                      <div class="recurring-title">{{ item.title }}</div>
                      <div class="recurring-meta">
                        <span class="recurring-amount" [class.income-amount]="item.type === 'income'" [class.expense-amount]="item.type === 'expense'">
                          {{ item.type === 'income' ? '+' : '−' }}₵{{ item.amount }}
                        </span>
                        <span class="recurring-freq">{{ item.frequency }}</span>
                        <span class="recurring-next">Next: {{ item.nextDate }}</span>
                      </div>
                    </div>
                    <div class="recurring-actions">
                      <button class="action-btn" (click)="toggleRecurring(item.id)">
                        <iconify-icon [icon]="item.isActive ? 'ph:pause' : 'ph:play'" width="16" height="16"></iconify-icon>
                      </button>
                      <button class="action-btn delete-btn" (click)="deleteRecurring(item.id)">
                        <iconify-icon icon="ph:trash" width="16" height="16"></iconify-icon>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <iconify-icon icon="ph:repeat" width="48" height="48" class="empty-icon"></iconify-icon>
                    <p>No recurring transactions</p>
                  </div>
                }
              </div>
            </div>
          } @else if (currentPage() === 'budgets') {
            <div class="budgets-page">
              <div class="page-header">
                <h2>Budget Planning</h2>
              </div>

              <div class="budget-form-card">
                <h3>Set Monthly Budget</h3>
                <div class="form-row">
                  <select [(ngModel)]="newBudget.category" class="form-input">
                    <option value="">Category</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                  <input [(ngModel)]="newBudget.amount" type="number" placeholder="Budget amount" class="form-input" />
                  <button class="btn-primary" (click)="setBudget()">Set Budget</button>
                </div>
              </div>

              <div class="budgets-list">
                @for (budget of currentBudgets(); track budget.id) {
                  <div class="budget-item">
                    <div class="budget-info">
                      <span class="budget-category">{{ budget.category }}</span>
                      <div class="budget-bar-container">
                        <div class="budget-bar" [style.width.%]="getBudgetPercentage(budget)">
                          <div class="budget-fill" [class.over-budget]="getBudgetSpent(budget) > budget.amount"></div>
                        </div>
                      </div>
                    </div>
                    <div class="budget-amounts">
                      <span class="budget-spent amount" [class.over-budget-text]="getBudgetSpent(budget) > budget.amount">
                        ₵{{ getBudgetSpent(budget) | number:'1.2-2' }}
                      </span>
                      <span class="budget-limit amount">/ ₵{{ budget.amount | number:'1.2-2' }}</span>
                      <button class="action-btn delete-btn" (click)="deleteBudget(budget.id)">
                        <iconify-icon icon="ph:trash" width="14" height="14"></iconify-icon>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <iconify-icon icon="ph:target" width="48" height="48" class="empty-icon"></iconify-icon>
                    <p>No budgets set</p>
                  </div>
                }
              </div>
            </div>
          } @else if (currentPage() === 'account-summary') {
            <div class="accounts-page">
              <div class="page-header">
                <h2>Your Accounts</h2>
                <button class="btn-primary" (click)="showAccountForm.set(true)">
                  <iconify-icon icon="ph:plus" width="16" height="16" style="color: #fff; vertical-align: middle; margin-right: 4px;"></iconify-icon>
                  New Account
                </button>
              </div>
              <div class="accounts-grid">
                @for (account of accounts(); track account.id) {
                  <div class="account-card" [class.active]="account.id === currentAccount()?.id">
                    <iconify-icon 
                      [icon]="account.type === 'cash-book' ? 'ph:book-open-duotone' : 'ph:wallet-duotone'" 
                      width="40" height="40" 
                      class="account-card-icon" 
                      [style.color]="account.id === currentAccount()?.id ? 'var(--primary)' : 'var(--text-secondary)'"
                    ></iconify-icon>
                    <h3>{{ account.name }}</h3>
                    <p>{{ account.type === 'cash-book' ? 'Cash Book' : 'Custom Account' }}</p>
                    <div class="account-stats">
                      <span class="amount">{{ getAccountTransactionCount(account.id) }}</span> transactions
                    </div>
                    <button class="btn-secondary" (click)="switchAccount(account.id)">
                      {{ account.id === currentAccount()?.id ? 'Current' : 'Switch to' }}
                    </button>
                  </div>
                }
              </div>
            </div>
          } @else if (currentPage() === 'help') {
            <div class="help-page">
              <div class="help-card">
                <h2>Help & Support</h2>
                
                <div class="help-section">
                  <h3>Getting Started</h3>
                  <div class="help-item">
                    <iconify-icon icon="ph:info-duotone" width="20" height="20" style="color: var(--primary)"></iconify-icon>
                    <div>
                      <strong>Adding Transactions</strong>
                      <p>Use the form on the home page to add your income and expenses. Select "Cash In" for money received and "Cash Out" for money spent.</p>
                    </div>
                  </div>
                  <div class="help-item">
                    <iconify-icon icon="ph:info-duotone" width="20" height="20" style="color: var(--primary)"></iconify-icon>
                    <div>
                      <strong>Recurring Transactions</strong>
                      <p>Set up bills or income that repeat daily, weekly, monthly, or yearly. The app will automatically process them on their due dates.</p>
                    </div>
                  </div>
                  <div class="help-item">
                    <iconify-icon icon="ph:info-duotone" width="20" height="20" style="color: var(--primary)"></iconify-icon>
                    <div>
                      <strong>Budget Planning</strong>
                      <p>Set monthly budgets for each category and track your spending against them. Visual bars show your progress.</p>
                    </div>
                  </div>
                </div>
                
                <div class="help-section">
                  <h3>Contact Support</h3>
                  <div class="contact-card">
                    <iconify-icon icon="ph:envelope-duotone" width="24" height="24" style="color: var(--primary)"></iconify-icon>
                    <p>Need help or have suggestions?</p>
                    <a href="mailto:eshunyhaw@gmail.com" class="contact-email">eshunyhaw@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>
          } @else if (currentPage() === 'privacy') {
            <div class="help-page">
              <div class="help-card">
                <h2>Privacy Policy</h2>
                
                <div class="help-section">
                  <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
                    Last updated: June 2026
                  </p>
                  
                  <h3>1. Information We Collect</h3>
                  <p class="privacy-text">
                    FinancePro stores all your financial data <strong>locally on your device</strong> using browser storage (localStorage). 
                    We do not collect, transmit, or store any of your personal or financial information on external servers.
                  </p>

                  <h3>2. How We Use Your Information</h3>
                  <p class="privacy-text">
                    Your financial data is used solely to provide you with the features of the app: tracking income and expenses, managing budgets and recurring transactions, generating reports and analytics, and exporting your data in CSV/PDF formats.
                  </p>

                  <h3>3. Data Storage & Security</h3>
                  <p class="privacy-text">
                    All your transaction data, account information, notes, budgets, and settings are stored exclusively in your browser's localStorage. This data remains on your device and is never uploaded to any cloud server or third-party service.
                  </p>

                  <h3>4. Third-Party Services</h3>
                  <p class="privacy-text">
                    FinancePro uses Google Fonts (typography), Iconify (icons), and Firebase Hosting (serving the application). These services may collect anonymous usage data according to their respective privacy policies.
                  </p>

                  <h3>5. Your Rights</h3>
                  <p class="privacy-text">
                    You have full control over your data: access it within the app, export as JSON or CSV anytime, delete all data from Settings, or delete individual transactions. All data processing happens locally on your device.
                  </p>

                  <h3>6. Contact Us</h3>
                  <div class="contact-card">
                    <iconify-icon icon="ph:envelope-duotone" width="24" height="24" style="color: var(--primary)"></iconify-icon>
                    <p>If you have questions about this Privacy Policy:</p>
                    <a href="mailto:eshunyhaw@gmail.com" class="contact-email">eshunyhaw@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>
          } @else if (currentPage() === 'notebook') {
            <app-notebook />
          } @else if (currentPage() === 'calculator') {
            <app-calculator />
          } @else if (currentPage() === 'settings') {
            <app-settings (themeChanged)="onThemeChanged($event)" />
          }
        </div>
      </main>

      @if (showAccountForm()) {
        <app-account-form
          (accountCreated)="createAccount($event)"
          (cancel)="showAccountForm.set(false)"
        />
      }

      <!-- Loading Spinner -->
      <app-loading-spinner [visible]="isLoading()" message="Processing..." />

      <!-- Error Toast -->
      <app-error-toast 
        [message]="errorMessage()" 
        [type]="errorType()"
        (dismiss)="clearError()"
      />
    </div>
  `,
  styles: [`
    :root {
      --font-ui: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-numeric: 'IBM Plex Mono', monospace;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-ui);
      font-weight: 400;
    }

    .amount, .transaction-id, .percentage, td.numeric {
      font-family: var(--font-numeric);
      font-variant-numeric: tabular-nums;
    }

    .app-layout {
      --canvas: #FAFAF9;
      --card-bg: #FFFFFF;
      --text-primary: #1C1917;
      --text-secondary: #78716C;
      --text-muted: #A8A29E;
      --border: #E7E5E4;
      --border-hover: #D6D3D1;
      --primary: #0D9488;
      --primary-hover: #0F766E;
      --primary-tint: #F0FDFA;
      --income: #15803D;
      --income-tint: #F0FDF4;
      --expense: #BE185D;
      --expense-tint: #FDF2F8;
      --warning: #D97706;
      --sidebar-bg: #1C1917;
      --sidebar-text: #F5F5F4;
      --sidebar-text-secondary: #A8A29E;
      --sidebar-border: #44403C;
      --sidebar-hover: #292524;
      display: flex;
      min-height: 100vh;
      background: var(--canvas);
      font-family: var(--font-ui);
      font-weight: 400;
      color: var(--text-primary);
    }

    .app-layout.dark {
      --canvas: #1C1917;
      --card-bg: #292524;
      --text-primary: #F5F5F4;
      --text-secondary: #A8A29E;
      --text-muted: #78716C;
      --border: #44403C;
      --border-hover: #57534E;
      --primary: #2DD4BF;
      --primary-hover: #5EEAD4;
      --primary-tint: #134E4A;
      --income: #4ADE80;
      --income-tint: #14532D;
      --expense: #FB7185;
      --expense-tint: #4C0519;
      --warning: #FBBF24;
      --sidebar-bg: #0C0A09;
      --sidebar-text: #F5F5F4;
      --sidebar-text-secondary: #A8A29E;
      --sidebar-border: #44403C;
      --sidebar-hover: #1C1917;
    }

    .sidebar {
      width: 240px;
      background: var(--sidebar-bg);
      color: var(--sidebar-text);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 40;
      transition: transform 0.3s ease;
    }

    .sidebar-brand {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--sidebar-border);
    }

    .brand-name {
      font-size: 20px;
      font-weight: 600;
      font-family: var(--font-ui);
      color: var(--sidebar-text);
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 400;
      color: var(--sidebar-text-secondary);
      text-decoration: none;
      transition: all 0.15s;
      font-family: var(--font-ui);
    }

    .nav-item:hover {
      background: var(--sidebar-hover);
      color: var(--sidebar-text);
    }

    .nav-item.active {
      background: var(--primary);
      color: #FFFFFF;
      font-weight: 500;
    }

    .nav-item.active iconify-icon {
      color: #FFFFFF !important;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--sidebar-border);
    }

    .help-btn {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: 1px solid var(--sidebar-border);
      color: var(--sidebar-text);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 400;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      font-family: var(--font-ui);
      transition: all 0.15s;
    }

    .help-btn:hover {
      background: var(--sidebar-hover);
      border-color: var(--sidebar-text-secondary);
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 35;
    }

    .main-content {
      flex: 1;
      margin-left: 240px;
      min-width: 0;
    }

    .top-bar {
      background: var(--card-bg);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .menu-toggle span {
      width: 20px;
      height: 2px;
      background: var(--text-primary);
      border-radius: 1px;
    }

    .account-selector {
      position: relative;
    }

    .selected-account {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--canvas);
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 400;
      font-size: 14px;
      color: var(--text-primary);
      font-family: var(--font-ui);
    }

    .dropdown-arrow {
      color: var(--text-muted);
    }

    .account-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 4px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      min-width: 240px;
      z-index: 30;
      overflow: hidden;
    }

    .account-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 400;
      color: var(--text-primary);
      font-family: var(--font-ui);
      transition: background 0.15s;
    }

    .account-option:hover {
      background: var(--canvas);
    }

    .account-option.active {
      background: var(--primary-tint);
      color: var(--primary);
    }

    .check {
      margin-left: auto;
      color: var(--primary);
    }

    .add-new {
      border-top: 1px solid var(--border);
      color: var(--primary);
      font-weight: 500;
    }

    .top-bar-right {
      display: flex;
      gap: 8px;
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      color: var(--text-secondary);
    }

    .icon-btn:hover {
      border-color: var(--border-hover);
      background: var(--canvas);
      color: var(--text-primary);
    }

    .period-bar {
      padding: 12px 24px;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
    }

    .period-filters {
      display: flex;
      gap: 4px;
      background: var(--canvas);
      padding: 4px;
      border-radius: 8px;
      width: fit-content;
    }

    .period-filters button {
      padding: 6px 14px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 400;
      color: var(--text-secondary);
      font-family: var(--font-ui);
      transition: all 0.15s;
    }

    .period-filters button.active {
      background: var(--card-bg);
      color: var(--primary);
      font-weight: 500;
      border: 1px solid var(--border);
    }

    .period-filters button:hover:not(.active) {
      color: var(--text-primary);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 24px;
    }

    .summary-card {
      background: var(--card-bg);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      border: 1px solid var(--border);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .income-icon { background: var(--income-tint); }
    .expense-icon { background: var(--expense-tint); }
    .balance-icon { background: var(--primary-tint); }

    .card-label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      font-family: var(--font-ui);
    }

    .card-value {
      font-size: 22px;
      font-weight: 600;
      color: var(--text-primary);
      font-family: var(--font-numeric);
      font-variant-numeric: tabular-nums;
    }

    .income-value { color: var(--income) !important; }
    .expense-value { color: var(--expense) !important; }

    .page-content {
      padding: 24px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .chart-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
    }

    .chart-card h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
      font-family: var(--font-ui);
    }

    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bar-label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
      font-family: var(--font-ui);
    }

    .bar-container {
      height: 24px;
      background: var(--canvas);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      min-width: fit-content;
      transition: width 0.5s ease;
    }

    .income-bar { background: var(--income); }
    .expense-bar { background: var(--expense); }

    .bar-value {
      font-size: 11px;
      color: #fff;
      font-weight: 500;
      font-family: var(--font-numeric);
      white-space: nowrap;
    }

    .chart-legend {
      display: flex;
      gap: 16px;
      margin-top: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary);
      font-family: var(--font-ui);
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .income-dot { background: var(--income); }
    .expense-dot { background: var(--expense); }

    .pie-chart-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pie-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pie-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .pie-label {
      flex: 1;
      font-size: 13px;
      color: var(--text-primary);
      font-family: var(--font-ui);
      font-weight: 400;
    }

    .pie-value {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .no-data {
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
      padding: 20px;
      font-family: var(--font-ui);
    }

    .recurring-page {
      max-width: 700px;
    }

    .recurring-form-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .recurring-form-card h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      font-family: var(--font-ui);
      color: var(--text-primary);
    }

    .form-row {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
    }

    .form-input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      font-family: var(--font-ui);
      font-weight: 400;
      color: var(--text-primary);
      background: var(--card-bg);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .form-actions {
      display: flex;
      gap: 10px;
    }

    .recurring-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .recurring-item {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .recurring-item.inactive {
      opacity: 0.5;
    }

    .recurring-title {
      font-weight: 500;
      font-size: 14px;
      color: var(--text-primary);
      font-family: var(--font-ui);
      margin-bottom: 4px;
    }

    .recurring-meta {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .recurring-amount {
      font-weight: 500;
      font-size: 13px;
      font-family: var(--font-numeric);
    }

    .income-amount { color: var(--income); }
    .expense-amount { color: var(--expense); }

    .recurring-freq {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: capitalize;
    }

    .recurring-next {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .recurring-actions {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all 0.15s;
    }

    .action-btn:hover {
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .delete-btn:hover {
      border-color: var(--expense);
      color: var(--expense);
      background: var(--expense-tint);
    }

    .budgets-page {
      max-width: 700px;
    }

    .budget-form-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .budget-form-card h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      font-family: var(--font-ui);
      color: var(--text-primary);
    }

    .budgets-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .budget-item {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .budget-info {
      flex: 1;
      margin-right: 16px;
    }

    .budget-category {
      font-weight: 500;
      font-size: 14px;
      color: var(--text-primary);
      font-family: var(--font-ui);
      display: block;
      margin-bottom: 8px;
    }

    .budget-bar-container {
      height: 8px;
      background: var(--canvas);
      border-radius: 4px;
      overflow: hidden;
    }

    .budget-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .budget-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 4px;
    }

    .budget-fill.over-budget {
      background: var(--expense);
    }

    .budget-amounts {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .budget-spent {
      font-weight: 500;
      font-size: 14px;
      color: var(--text-primary);
    }

    .over-budget-text {
      color: var(--expense) !important;
    }

    .budget-limit {
      font-size: 13px;
      color: var(--text-muted);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .page-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      font-family: var(--font-ui);
    }

    .transactions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .transactions-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      font-family: var(--font-ui);
    }

    .export-buttons {
      display: flex;
      gap: 8px;
    }

    .btn-primary {
      padding: 10px 20px;
      background: var(--primary);
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: var(--font-ui);
      transition: background 0.15s;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
    }

    .btn-secondary {
      padding: 8px 16px;
      background: transparent;
      color: var(--primary);
      border: 1px solid var(--primary);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      font-family: var(--font-ui);
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .btn-secondary:hover {
      background: var(--primary-tint);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      text-align: center;
    }

    .empty-icon {
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .empty-state p {
      font-family: var(--font-ui);
      font-weight: 400;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .privacy-text {
      font-family: var(--font-ui);
      font-weight: 400;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 12px;
    }

    .help-page {
      max-width: 700px;
    }

    .help-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .help-card > h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      font-family: var(--font-ui);
      padding: 24px;
      margin: 0;
      border-bottom: 1px solid var(--border);
    }

    .help-section {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
    }

    .help-section:last-child {
      border-bottom: none;
    }

    .help-section h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      font-family: var(--font-ui);
    }

    .help-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
    }

    .help-item strong {
      display: block;
      font-weight: 500;
      font-size: 14px;
      color: var(--text-primary);
      margin-bottom: 4px;
      font-family: var(--font-ui);
    }

    .help-item p {
      font-weight: 400;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      font-family: var(--font-ui);
    }

    .contact-card {
      text-align: center;
      padding: 24px;
      background: var(--canvas);
      border-radius: 8px;
    }

    .contact-card p {
      font-weight: 400;
      font-size: 14px;
      color: var(--text-secondary);
      margin: 12px 0;
      font-family: var(--font-ui);
    }

    .contact-email {
      display: inline-block;
      font-weight: 600;
      font-size: 16px;
      color: var(--primary);
      text-decoration: none;
      font-family: var(--font-ui);
      transition: color 0.15s;
    }

    .contact-email:hover {
      color: var(--primary-hover);
      text-decoration: underline;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .account-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 24px;
      text-align: center;
    }

    .account-card.active {
      border-color: var(--primary);
      background: var(--primary-tint);
    }

    .account-card-icon {
      margin-bottom: 12px;
    }

    .account-card h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text-primary);
      font-family: var(--font-ui);
    }

    .account-card p {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 400;
      margin-bottom: 12px;
      font-family: var(--font-ui);
    }

    .account-stats {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 16px;
      font-weight: 400;
      font-family: var(--font-ui);
    }

    .account-stats .amount {
      font-family: var(--font-numeric);
      font-weight: 500;
    }

    .home-layout {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
      align-items: start;
    }

    .home-sidebar {
      position: sticky;
      top: 80px;
    }

    @media (max-width: 1024px) {
      .charts-grid { grid-template-columns: 1fr; }
      .summary-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; }
      .summary-card { padding: 16px; gap: 12px; }
      .card-value { font-size: 18px; }
      .home-layout { grid-template-columns: 1fr; }
      .home-sidebar { position: static; }
    }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.mobile-open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.3); }
      .sidebar-overlay { display: block; }
      .main-content { margin-left: 0; }
      .menu-toggle { display: flex; }
      .top-bar { padding: 10px 16px; }
      .summary-grid { grid-template-columns: 1fr; padding: 12px; gap: 8px; }
      .page-content { padding: 12px; }
      .form-row { flex-direction: column; }
      .period-filters { width: 100%; overflow-x: auto; }
    }

    @media (max-width: 480px) {
      .top-bar { padding: 8px 12px; }
      .selected-account { font-size: 12px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
      .card-value { font-size: 16px; }
    }
  `]
})
export class AppComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private budgetService = inject(BudgetService);
  private recurringService = inject(RecurringService);
  private errorHandler = inject(ErrorHandlerService);
  
  showSplash = signal(true);
  menuOpen = signal(false);
  showAccounts = signal(false);
  showAccountForm = signal(false);
  showRecurringForm = signal(false);
  currentPage = signal('home');
  selectedPeriod = signal('all');
  editingExpense = signal<Transaction | null>(null);
  isDarkMode = signal(false);
  
  isLoading = this.errorHandler.loading;
  errorMessage = this.errorHandler.error;
  errorType = signal<'error' | 'success'>('error');
  
  accounts = this.accountService.allAccounts;
  currentAccount = this.accountService.currentAccount;
  
  currentTransactions = computed(() => {
    const account = this.currentAccount();
    if (!account) return [];
    return this.transactionService.getTransactionsByPeriod(account.id, this.selectedPeriod());
  });
  
  allTransactions = computed(() => this.transactionService.allTransactions());
  
  totalIncome = computed(() => {
    const account = this.currentAccount();
    if (!account) return 0;
    return this.transactionService.getIncomeTotal(account.id, this.selectedPeriod());
  });
  
  totalExpense = computed(() => {
    const account = this.currentAccount();
    if (!account) return 0;
    return this.transactionService.getExpenseTotal(account.id, this.selectedPeriod());
  });
  
  netTotal = computed(() => {
    const account = this.currentAccount();
    if (!account) return 0;
    return this.transactionService.getNetTotal(account.id, this.selectedPeriod());
  });
  
  monthlyIncome = computed(() => {
    const account = this.currentAccount();
    if (!account) return 0;
    return this.transactionService.getIncomeTotal(account.id, 'monthly');
  });
  
  monthlyExpense = computed(() => {
    const account = this.currentAccount();
    if (!account) return 0;
    return this.transactionService.getExpenseTotal(account.id, 'monthly');
  });
  
  categories = computed(() => this.transactionService.getCategories());
  allCategories = computed(() => this.transactionService.getCategories());
  
  currentRecurring = computed(() => {
    const account = this.currentAccount();
    if (!account) return [];
    return this.recurringService.getRecurringByAccount(account.id);
  });
  
  currentBudgets = computed(() => {
    const account = this.currentAccount();
    if (!account) return [];
    return this.budgetService.getCurrentMonthBudgets(account.id);
  });

  newRecurring = {
    title: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0]
  };

  newBudget = { category: '', amount: 0 };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('app-settings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          if (settings.theme === 'dark') this.isDarkMode.set(true);
        } catch {}
      }
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) this.processRecurringTransactions();
  }

  processRecurringTransactions() {
    const account = this.currentAccount();
    if (!account) return;
    const due = this.recurringService.getDueTransactions(account.id);
    due.forEach(r => {
      this.transactionService.addTransaction({
        title: r.title, amount: r.amount, category: r.category,
        date: new Date().toISOString().split('T')[0], type: r.type,
        accountId: r.accountId, notes: r.notes, recurringId: r.id
      });
    });
    if (due.length > 0) this.recurringService.processDueTransactions();
  }

  getIncomePercentage(): number {
    const total = this.monthlyIncome() + this.monthlyExpense();
    return total === 0 ? 0 : (this.monthlyIncome() / total) * 100;
  }

  getExpensePercentage(): number {
    const total = this.monthlyIncome() + this.monthlyExpense();
    return total === 0 ? 0 : (this.monthlyExpense() / total) * 100;
  }

  categoryPercentages = computed(() => {
    const transactions = this.currentTransactions().filter(t => t.type === 'expense');
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const categories = [...new Set(transactions.map(t => t.category))];
    const colors = ['#BE185D', '#0D9488', '#D97706', '#2563EB', '#7C3AED', '#DB2777', '#059669', '#DC2626'];
    return categories.map((cat, i) => {
      const catTotal = transactions.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0);
      return { category: cat, percentage: total > 0 ? (catTotal / total) * 100 : 0, color: colors[i % colors.length] };
    }).sort((a, b) => b.percentage - a.percentage);
  });

  getBudgetSpent(budget: Budget): number {
    const account = this.currentAccount();
    if (!account) return 0;
    const now = new Date();
    return this.transactionService.getTransactionsByAccount(account.id)
      .filter(t => { const d = new Date(t.date); return t.type === 'expense' && t.category === budget.category && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBudgetPercentage(budget: Budget): number {
    const spent = this.getBudgetSpent(budget);
    return budget.amount === 0 ? 0 : Math.min((spent / budget.amount) * 100, 100);
  }

  navigateTo(page: string) { this.currentPage.set(page); }

  switchAccount(accountId: string) {
    this.accountService.setActiveAccount(accountId);
    this.showAccounts.set(false);
    this.processRecurringTransactions();
  }

  createAccount(data: { name: string; type: 'cash-book' | 'custom' }) {
    try {
      this.accountService.addAccount(data.name, data.type);
      this.showAccountForm.set(false);
      this.showSuccess('Account created!');
    } catch (error) { this.handleError(error, 'Create Account'); }
  }

  getAccountTransactionCount(accountId: string): number {
    return this.transactionService.getTransactionsByAccount(accountId).length;
  }

  add(transaction: Omit<Transaction, 'id' | 'accountId'>) {
    const account = this.currentAccount();
    if (!account) { this.handleError('No account selected', 'Add Transaction'); return; }
    try {
      this.transactionService.addTransaction({ ...transaction, accountId: account.id });
    } catch (error) { this.handleError(error, 'Add Transaction'); }
  }

  update(transaction: Transaction) {
    try {
      this.transactionService.updateTransaction(transaction);
      this.editingExpense.set(null);
    } catch (error) { this.handleError(error, 'Update Transaction'); }
  }

  remove(id: string) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try { this.transactionService.deleteTransaction(id); } catch (error) { this.handleError(error, 'Delete Transaction'); }
    }
  }

  startEdit(transaction: Transaction) { this.editingExpense.set(transaction); }
  cancelEdit() { this.editingExpense.set(null); }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('app-settings');
      let settings: any = {};
      if (saved) { try { settings = JSON.parse(saved); } catch {} }
      settings.theme = this.isDarkMode() ? 'dark' : 'light';
      localStorage.setItem('app-settings', JSON.stringify(settings));
    }
  }

  onThemeChanged(theme: string) { this.isDarkMode.set(theme === 'dark'); }

  addRecurring() {
    const account = this.currentAccount();
    if (!account || !this.newRecurring.title || !this.newRecurring.category) return;
    if (Number(this.newRecurring.amount) <= 0) { alert('Amount must be greater than 0'); return; }
    try {
      this.recurringService.addRecurring({
        title: this.newRecurring.title, amount: Number(this.newRecurring.amount),
        category: this.newRecurring.category, type: this.newRecurring.type,
        accountId: account.id, frequency: this.newRecurring.frequency,
        startDate: this.newRecurring.startDate, isActive: true
      });
      this.newRecurring = { title: '', amount: 0, type: 'expense', category: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0] };
      this.showRecurringForm.set(false);
      this.showSuccess('Recurring transaction saved!');
    } catch (error) { this.handleError(error, 'Add Recurring'); }
  }

  toggleRecurring(id: string) { this.recurringService.toggleActive(id); }

  deleteRecurring(id: string) {
    if (confirm('Delete this recurring transaction?')) {
      try { this.recurringService.deleteRecurring(id); } catch (error) { this.handleError(error, 'Delete Recurring'); }
    }
  }

  setBudget() {
    const account = this.currentAccount();
    if (!account || !this.newBudget.category || !this.newBudget.amount) return;
    try {
      this.budgetService.setBudget(account.id, this.newBudget.category, Number(this.newBudget.amount));
      this.newBudget = { category: '', amount: 0 };
      this.showSuccess('Budget set!');
    } catch (error) { this.handleError(error, 'Set Budget'); }
  }

  deleteBudget(id: string) { this.budgetService.deleteBudget(id); }

  clearError() { this.errorHandler.clearError(); }

  showSuccess(message: string) {
    this.errorType.set('success');
    this.errorHandler.setError(message);
    setTimeout(() => this.errorType.set('error'), 5000);
  }

  handleError(error: any, context: string) { this.errorHandler.handleError(error, context); }

  exportCSV() {
    if (!isPlatformBrowser(this.platformId)) return;
    const csv = this.transactionService.exportToCSV();
    if (!csv) { alert('No transactions to export'); return; }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  exportPDF() {
    if (!isPlatformBrowser(this.platformId)) return;
    const transactions = this.transactionService.getAllTransactions();
    if (transactions.length === 0) { alert('No transactions to export'); return; }
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Transactions Export</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:30px;color:#1C1917}h1{font-size:22px;font-weight:600;margin-bottom:6px;color:#0D9488}.date-range{font-size:12px;color:#78716C;margin-bottom:20px}table{width:100%;border-collapse:collapse}th{background:#FAFAF9;padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#78716C;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #E7E5E4}td{padding:10px 12px;font-size:13px;border-bottom:1px solid #E7E5E4}td.title-cell{font-weight:500}td.amount-cell{font-family:'Courier New',monospace}tr:nth-child(even) td{background:#FAFAF9}.income-amount{color:#15803D;font-weight:600}.expense-amount{color:#BE185D;font-weight:600}.type-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:500}.income-badge{background:#F0FDF4;color:#15803D}.expense-badge{background:#FDF2F8;color:#BE185D}.summary{margin-top:24px;padding:16px;background:#FAFAF9;border-radius:8px;display:flex;justify-content:space-around}.summary-item{text-align:center}.summary-label{font-size:11px;color:#78716C;text-transform:uppercase}.summary-value{font-size:18px;font-weight:600;margin-top:4px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><h1>Transaction Report</h1><div class="date-range">Generated on ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead><tbody>`;
    let totalIncome = 0, totalExpense = 0;
    transactions.forEach(t => {
      if(t.type==='income') totalIncome+=t.amount; else totalExpense+=t.amount;
      const d = new Date(t.date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
      html += `<tr><td>${d}</td><td class="title-cell">${this.escapeHtml(t.title)}</td><td>${this.escapeHtml(t.category)}</td><td><span class="type-badge ${t.type==='income'?'income-badge':'expense-badge'}">${t.type==='income'?'Cash In':'Cash Out'}</span></td><td class="amount-cell ${t.type==='income'?'income-amount':'expense-amount'}">${t.type==='income'?'+':'−'}₵${t.amount.toFixed(2)}</td></tr>`;
    });
    const net = totalIncome - totalExpense;
    html += `</tbody></table><div class="summary"><div class="summary-item"><div class="summary-label">Total Income</div><div class="summary-value" style="color:#15803D">₵${totalIncome.toFixed(2)}</div></div><div class="summary-item"><div class="summary-label">Total Expenses</div><div class="summary-value" style="color:#BE185D">₵${totalExpense.toFixed(2)}</div></div><div class="summary-item"><div class="summary-label">Net Balance</div><div class="summary-value" style="color:${net>=0?'#15803D':'#BE185D'}">₵${net.toFixed(2)}</div></div></div></body></html>`;
    const blob = new Blob([html],{type:'text/html'});
    const url = URL.createObjectURL(blob);
    const w = window.open(url,'_blank');
    if(w){ w.onload=()=>w.print(); } else { alert('Please allow popups'); }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}