import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor() { }

  success(message: string): void {
    console.log('Toast Success:', message);
    // Placeholder for actual toast display logic
  }

  error(message: string): void {
    console.error('Toast Error:', message);
    // Placeholder for actual toast display logic
  }
}
