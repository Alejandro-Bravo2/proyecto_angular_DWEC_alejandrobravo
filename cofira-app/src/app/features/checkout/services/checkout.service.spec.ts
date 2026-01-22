import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CheckoutService } from './checkout.service';
import {
  CheckoutRequest,
  CheckoutResponse,
  SubscripcionEstado,
} from '../models/checkout.model';
import { environment } from '../../../../environments/environment';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/checkout`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckoutService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CheckoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('procesarPago', () => {
    it('should process payment with card', (done) => {
      const request: CheckoutRequest = {
        tipoPlan: 'MENSUAL',
        metodoPago: 'TARJETA',
        nombreTitular: 'Juan Perez',
        numeroTarjeta: '4111111111111111',
        fechaExpiracion: '12/25',
        cvv: '123',
      };

      const mockResponse: CheckoutResponse = {
        planId: 1,
        tipoPlan: 'MENSUAL',
        precio: 19,
        metodoPago: 'TARJETA',
        fechaInicio: '2024-01-15',
        fechaFin: '2024-02-15',
        exitoso: true,
        mensaje: 'Pago procesado correctamente',
        transaccionId: 'TXN123456',
      };

      service.procesarPago(request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.exitoso).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/procesar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('should process payment with PayPal', (done) => {
      const request: CheckoutRequest = {
        tipoPlan: 'ANUAL',
        metodoPago: 'PAYPAL',
        emailPaypal: 'juan@example.com',
      };

      const mockResponse: CheckoutResponse = {
        planId: 2,
        tipoPlan: 'ANUAL',
        precio: 199,
        metodoPago: 'PAYPAL',
        fechaInicio: '2024-01-15',
        fechaFin: '2025-01-15',
        exitoso: true,
        mensaje: 'Pago procesado correctamente',
        transaccionId: 'TXN789012',
      };

      service.procesarPago(request).subscribe((response) => {
        expect(response.tipoPlan).toBe('ANUAL');
        expect(response.precio).toBe(199);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/procesar`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should process payment with Bizum', (done) => {
      const request: CheckoutRequest = {
        tipoPlan: 'INDIVIDUAL',
        metodoPago: 'BIZUM',
        telefonoBizum: '666123456',
      };

      const mockResponse: CheckoutResponse = {
        planId: 3,
        tipoPlan: 'INDIVIDUAL',
        precio: 9,
        metodoPago: 'BIZUM',
        fechaInicio: '2024-01-15',
        fechaFin: '2024-02-15',
        exitoso: true,
        mensaje: 'Pago procesado correctamente',
        transaccionId: 'TXN345678',
      };

      service.procesarPago(request).subscribe((response) => {
        expect(response.metodoPago).toBe('BIZUM');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/procesar`);
      req.flush(mockResponse);
    });
  });

  describe('cancelarSubscripcion', () => {
    it('should cancel subscription', (done) => {
      const mockResponse = {
        mensaje: 'Subscripcion cancelada correctamente',
        estado: 'CANCELADA',
      };

      service.cancelarSubscripcion().subscribe((response) => {
        expect(response.mensaje).toBe('Subscripcion cancelada correctamente');
        expect(response.estado).toBe('CANCELADA');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/cancelar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('obtenerEstadoSubscripcion', () => {
    it('should get active subscription status', (done) => {
      const mockEstado: SubscripcionEstado = {
        activa: true,
        tipoPlan: 'MENSUAL',
        nombrePlan: 'Mensual',
        precio: 19,
        fechaInicio: '2024-01-01',
        fechaFin: '2024-02-01',
        diasRestantes: 15,
        metodoPago: 'TARJETA',
        ultimosDigitosTarjeta: '1111',
      };

      service.obtenerEstadoSubscripcion().subscribe((estado) => {
        expect(estado).toEqual(mockEstado);
        expect(estado.activa).toBeTrue();
        expect(estado.diasRestantes).toBe(15);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/estado`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEstado);
    });

    it('should get inactive subscription status', (done) => {
      const mockEstado: SubscripcionEstado = {
        activa: false,
      };

      service.obtenerEstadoSubscripcion().subscribe((estado) => {
        expect(estado.activa).toBeFalse();
        expect(estado.tipoPlan).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/estado`);
      req.flush(mockEstado);
    });

    it('should get subscription with PayPal payment method', (done) => {
      const mockEstado: SubscripcionEstado = {
        activa: true,
        tipoPlan: 'ANUAL',
        nombrePlan: 'Anual',
        precio: 199,
        fechaInicio: '2024-01-01',
        fechaFin: '2025-01-01',
        diasRestantes: 350,
        metodoPago: 'PAYPAL',
      };

      service.obtenerEstadoSubscripcion().subscribe((estado) => {
        expect(estado.metodoPago).toBe('PAYPAL');
        expect(estado.ultimosDigitosTarjeta).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/estado`);
      req.flush(mockEstado);
    });
  });
});
