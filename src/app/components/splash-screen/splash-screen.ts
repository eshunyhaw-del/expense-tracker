import { Component, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="splash" [class.fade-out]="isFading">
      <div class="splash-content">
        <iconify-icon icon="ph:wallet-duotone" width="80" height="80" class="logo-icon"></iconify-icon>
        <h1>FinancePro</h1>
        <p class="tagline">Manage your money, master your life</p>
        <div class="loader"></div>
      </div>
    </div>
  `,
  styles: [`
    .splash {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s ease-out;
    }
    .fade-out {
      opacity: 0;
      pointer-events: none;
    }
    .splash-content {
      text-align: center;
      color: white;
    }
    .logo-icon {
      color: white;
      animation: pulse 2s infinite;
      margin-bottom: 20px;
    }
    h1 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 40px;
      margin: 20px 0 10px;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    .loader {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SplashScreenComponent implements OnInit {
  splashDone = output<void>();
  isFading = false;

  ngOnInit() {
    setTimeout(() => {
      this.startFadeOut();
    }, 2500);
  }

  startFadeOut() {
    this.isFading = true;
    setTimeout(() => {
      this.splashDone.emit();
    }, 500);
  }
}