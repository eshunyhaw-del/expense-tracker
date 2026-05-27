import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private errorMessage = signal<string | null>(null);
  private isLoading = signal<boolean>(false);
  
  readonly error = this.errorMessage.asReadonly();
  readonly loading = this.isLoading.asReadonly();

  setError(message: string) {
    this.errorMessage.set(message);
    setTimeout(() => this.clearError(), 5000);
  }

  clearError() {
    this.errorMessage.set(null);
  }

  setLoading(state: boolean) {
    this.isLoading.set(state);
  }

  handleError(error: any, context: string = 'Application'): string {
    console.error(`[${context}] Error:`, error);
    
    let message = 'An unexpected error occurred. Please try again.';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    this.setError(message);
    return message;
  }

  safeOperation<T>(operation: () => T, context: string = 'Operation'): T | null {
    try {
      this.setLoading(true);
      return operation();
    } catch (error) {
      this.handleError(error, context);
      return null;
    } finally {
      this.setLoading(false);
    }
  }
}