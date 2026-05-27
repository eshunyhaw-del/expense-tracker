import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'expenses',
    loadComponent: () => import('./components/expense-list/expense-list')
      .then(m => m.ExpenseListComponent)
  }
];