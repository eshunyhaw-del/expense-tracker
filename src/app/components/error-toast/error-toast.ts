import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  template: `
    @if (message()) {
      <div class="error-toast" [class.success]="type() === 'success'">
        <div class="toast-content">
          <span class="toast-message">{{ message() }}</span>
          <button class="toast-close" (click)="dismiss.emit()">✕</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .error-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #BE185D;
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideUp 0.3s ease;
      max-width: 90%;
    }
    .error-toast.success {
      background: #15803D;
    }
    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .toast-message {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 14px;
    }
    .toast-close {
      background: none;
      border: none;
      color: #FFFFFF;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      opacity: 0.8;
    }
    .toast-close:hover {
      opacity: 1;
    }
    @keyframes slideUp {
      from { transform: translate(-50%, 100px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
  `]
})
export class ErrorToastComponent {
  message = input<string | null>(null);
  type = input<'error' | 'success'>('error');
  dismiss = output<void>();
}