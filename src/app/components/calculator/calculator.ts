import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calculator">
      <h2>🔢 Cash Calculator</h2>
      
      <div class="display">
        <div class="expression">{{ expression() || '0' }}</div>
        <div class="result">{{ result() }}</div>
      </div>
      
      <div class="buttons">
        <button class="btn-clear" (click)="clear()">C</button>
        <button class="btn-operator" (click)="appendOperator('(')">(</button>
        <button class="btn-operator" (click)="appendOperator(')')">)</button>
        <button class="btn-operator" (click)="appendOperator('/')">/</button>
        
        <button class="btn-number" (click)="appendNumber('7')">7</button>
        <button class="btn-number" (click)="appendNumber('8')">8</button>
        <button class="btn-number" (click)="appendNumber('9')">9</button>
        <button class="btn-operator" (click)="appendOperator('*')">×</button>
        
        <button class="btn-number" (click)="appendNumber('4')">4</button>
        <button class="btn-number" (click)="appendNumber('5')">5</button>
        <button class="btn-number" (click)="appendNumber('6')">6</button>
        <button class="btn-operator" (click)="appendOperator('-')">-</button>
        
        <button class="btn-number" (click)="appendNumber('1')">1</button>
        <button class="btn-number" (click)="appendNumber('2')">2</button>
        <button class="btn-number" (click)="appendNumber('3')">3</button>
        <button class="btn-operator" (click)="appendOperator('+')">+</button>
        
        <button class="btn-number zero" (click)="appendNumber('0')">0</button>
        <button class="btn-number" (click)="appendNumber('.')">.</button>
        <button class="btn-equals" (click)="calculate()">=</button>
      </div>
      
      <div class="quick-actions">
        <button (click)="addAmount(10)">+$10</button>
        <button (click)="addAmount(50)">+$50</button>
        <button (click)="addAmount(100)">+$100</button>
        <button (click)="addAmount(500)">+$500</button>
      </div>
    </div>
  `,
  styles: [`
    .calculator {
      max-width: 350px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }
    
    h2 {
      text-align: center;
      margin-bottom: 20px;
      color: #333;
    }
    
    .display {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      text-align: right;
      min-height: 60px;
    }
    
    .expression {
      font-size: 14px;
      color: #999;
      margin-bottom: 5px;
      min-height: 20px;
      word-wrap: break-word;
    }
    
    .result {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      min-height: 38px;
    }
    
    .buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    
    button {
      padding: 15px;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.1s;
    }
    
    button:active {
      transform: scale(0.95);
    }
    
    .btn-number {
      background: #f0f0f0;
      color: #333;
    }
    
    .btn-number:hover {
      background: #e0e0e0;
    }
    
    .btn-operator {
      background: #667eea;
      color: white;
    }
    
    .btn-operator:hover {
      background: #5a6fd6;
    }
    
    .btn-clear {
      background: #ff5252;
      color: white;
    }
    
    .btn-clear:hover {
      background: #ff3838;
    }
    
    .btn-equals {
      background: #4CAF50;
      color: white;
    }
    
    .btn-equals:hover {
      background: #45a049;
    }
    
    .zero {
      grid-column: span 2;
    }
    
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    
    .quick-actions button {
      background: #e3f2fd;
      color: #1976d2;
      font-size: 14px;
      padding: 10px;
    }
    
    .quick-actions button:hover {
      background: #bbdefb;
    }
  `]
})
export class CalculatorComponent {
  expression = signal('');
  result = signal('');

  appendNumber(num: string) {
    this.expression.update(exp => exp + num);
  }

  appendOperator(op: string) {
    this.expression.update(exp => exp + ' ' + op + ' ');
  }

  clear() {
    this.expression.set('');
    this.result.set('');
  }

  calculate() {
  try {
    // Use Function constructor instead of eval to avoid bundler warnings
    const result = new Function('return ' + this.expression())();
    this.result.set('= ' + result.toString());
  } catch {
    this.result.set('Error');
  }
}

  addAmount(amount: number) {
    this.expression.update(exp => {
      const current = exp.trim();
      if (current && !isNaN(Number(current[current.length - 1]))) {
        return exp + ' + ' + amount;
      }
      return exp + amount;
    });
  }
}