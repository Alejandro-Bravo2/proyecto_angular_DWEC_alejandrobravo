import { Injectable, signal, Type } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModal = signal<{ component: Type<any>, inputs: Record<string, any> } | null>(null);

  constructor() { }

  open<T>(component: Type<T>, inputs?: Record<string, any>): void {
    this.activeModal.set({ component, inputs: inputs || {} });
    document.body.classList.add('modal-open'); // To prevent body scrolling
  }

  close(): void {
    this.activeModal.set(null);
    document.body.classList.remove('modal-open');
  }

  // Expose signal for modal component to subscribe
  get activeModal$() {
    return this.activeModal.asReadonly();
  }
}
