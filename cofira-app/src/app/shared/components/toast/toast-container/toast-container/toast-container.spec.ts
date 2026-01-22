import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { ToastContainer } from './toast-container';
import { ToastService } from '../../../../../core/services/toast.service';
import { ToastMessage } from '../../../../models/toast.model';

describe('ToastContainer', () => {
  let component: ToastContainer;
  let fixture: ComponentFixture<ToastContainer>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('ToastService', ['dismiss', 'success', 'error', 'warning', 'info']);
    // Crear un signal para los toasts
    const toastsSignal = signal<ToastMessage[]>([]);
    Object.defineProperty(mockToastService, 'toasts', {
      get: () => toastsSignal
    });

    await TestBed.configureTestingModule({
      imports: [ToastContainer],
      providers: [
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Creacion del componente', () => {
    it('deberia crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('deberia inyectar ToastService correctamente', () => {
      expect(component.toastService).toBeTruthy();
    });
  });

  describe('dismissToast', () => {
    it('deberia llamar a toastService.dismiss con el id correcto', () => {
      const toastId = 'toast-123';

      component.dismissToast(toastId);

      expect(mockToastService.dismiss).toHaveBeenCalledWith(toastId);
      expect(mockToastService.dismiss).toHaveBeenCalledTimes(1);
    });

    it('deberia manejar multiples llamadas a dismissToast', () => {
      const primerToastId = 'toast-1';
      const segundoToastId = 'toast-2';

      component.dismissToast(primerToastId);
      component.dismissToast(segundoToastId);

      expect(mockToastService.dismiss).toHaveBeenCalledWith(primerToastId);
      expect(mockToastService.dismiss).toHaveBeenCalledWith(segundoToastId);
      expect(mockToastService.dismiss).toHaveBeenCalledTimes(2);
    });

    it('deberia manejar id vacio', () => {
      component.dismissToast('');

      expect(mockToastService.dismiss).toHaveBeenCalledWith('');
    });
  });
});
