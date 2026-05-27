import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="spinner-overlay">
        <div class="spinner"></div>
        @if (message()) {
          <p class="spinner-message">{{ message() }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border, #E7E5E4);
      border-top: 3px solid var(--primary, #0D9488);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-message {
      margin-top: 16px;
      font-family: var(--font-ui, 'Plus Jakarta Sans', sans-serif);
      font-weight: 400;
      font-size: 14px;
      color: #FFFFFF;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  visible = input<boolean>(false);
  message = input<string>('');
}