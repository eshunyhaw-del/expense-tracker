import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/assets/sw.js').then(
      (registration) => {
        console.log('Service Worker registered:', registration.scope);
      },
      (error) => {
        console.log('Service Worker registration failed:', error);
      }
    );
  });
}