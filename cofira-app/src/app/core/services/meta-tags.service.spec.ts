import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { MetaTagsService, MetaTagsConfig } from './meta-tags.service';

describe('MetaTagsService', () => {
  let service: MetaTagsService;
  let mockMeta: jasmine.SpyObj<Meta>;
  let mockTitle: jasmine.SpyObj<Title>;
  let mockRouter: { events: Subject<any>; url: string };
  let mockDocument: any;
  let routerEvents: Subject<any>;

  beforeEach(() => {
    mockMeta = jasmine.createSpyObj('Meta', ['updateTag']);
    mockTitle = jasmine.createSpyObj('Title', ['setTitle']);
    routerEvents = new Subject();
    mockRouter = {
      events: routerEvents,
      url: '/',
    };

    mockDocument = {
      querySelector: jasmine.createSpy('querySelector').and.returnValue(null),
      createElement: jasmine.createSpy('createElement').and.returnValue({
        rel: '',
        href: '',
      }),
      head: {
        appendChild: jasmine.createSpy('appendChild'),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        MetaTagsService,
        { provide: Meta, useValue: mockMeta },
        { provide: Title, useValue: mockTitle },
        { provide: Router, useValue: mockRouter },
        { provide: DOCUMENT, useValue: mockDocument },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(MetaTagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('inicializar', () => {
    it('should update meta tags for initial route', () => {
      mockRouter.url = '/login';
      service.inicializar();

      expect(mockTitle.setTitle).toHaveBeenCalledWith('Iniciar Sesión - COFIRA');
    });

    it('should update meta tags on navigation', () => {
      service.inicializar();

      routerEvents.next(new NavigationEnd(1, '/entrenamiento', '/entrenamiento'));

      expect(mockTitle.setTitle).toHaveBeenCalledWith('Entrenamiento - COFIRA');
    });

    it('should not run on server-side', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          MetaTagsService,
          { provide: Meta, useValue: mockMeta },
          { provide: Title, useValue: mockTitle },
          { provide: Router, useValue: mockRouter },
          { provide: DOCUMENT, useValue: mockDocument },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const ssrService = TestBed.inject(MetaTagsService);
      mockTitle.setTitle.calls.reset();

      ssrService.inicializar();

      expect(mockTitle.setTitle).not.toHaveBeenCalled();
    });
  });

  describe('actualizarMetaTags', () => {
    it('should set page title', () => {
      const config: MetaTagsConfig = {
        titulo: 'Test Title',
        descripcion: 'Test description',
      };

      service.actualizarMetaTags(config);

      expect(mockTitle.setTitle).toHaveBeenCalledWith('Test Title');
    });

    it('should update description meta tag', () => {
      const config: MetaTagsConfig = {
        titulo: 'Test Title',
        descripcion: 'Test description',
      };

      service.actualizarMetaTags(config);

      expect(mockMeta.updateTag).toHaveBeenCalledWith({
        name: 'description',
        content: 'Test description',
      });
    });

    it('should update Open Graph meta tags', () => {
      const config: MetaTagsConfig = {
        titulo: 'Test Title',
        descripcion: 'Test description',
        urlCanonica: 'https://cofira.com/test',
      };

      service.actualizarMetaTags(config);

      expect(mockMeta.updateTag).toHaveBeenCalledWith({
        property: 'og:title',
        content: 'Test Title',
      });
      expect(mockMeta.updateTag).toHaveBeenCalledWith({
        property: 'og:description',
        content: 'Test description',
      });
    });

    it('should update Twitter Card meta tags', () => {
      const config: MetaTagsConfig = {
        titulo: 'Test Title',
        descripcion: 'Test description',
      };

      service.actualizarMetaTags(config);

      expect(mockMeta.updateTag).toHaveBeenCalledWith({
        name: 'twitter:title',
        content: 'Test Title',
      });
    });

    it('should create canonical link when none exists', () => {
      mockDocument.querySelector.and.returnValue(null);

      const config: MetaTagsConfig = {
        titulo: 'Test',
        descripcion: 'Test',
        urlCanonica: 'https://cofira.com/test',
      };

      service.actualizarMetaTags(config);

      expect(mockDocument.createElement).toHaveBeenCalledWith('link');
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it('should update existing canonical link', () => {
      const existingLink = { rel: 'canonical', href: '' };
      mockDocument.querySelector.and.returnValue(existingLink);

      const config: MetaTagsConfig = {
        titulo: 'Test',
        descripcion: 'Test',
        urlCanonica: 'https://cofira.com/nuevo',
      };

      service.actualizarMetaTags(config);

      expect(existingLink.href).toBe('https://cofira.com/nuevo');
    });

    it('should update image tags when provided', () => {
      const config: MetaTagsConfig = {
        titulo: 'Test',
        descripcion: 'Test',
        imagen: 'https://cofira.com/image.jpg',
      };

      service.actualizarMetaTags(config);

      expect(mockMeta.updateTag).toHaveBeenCalledWith({
        property: 'og:image',
        content: 'https://cofira.com/image.jpg',
      });
      expect(mockMeta.updateTag).toHaveBeenCalledWith({
        name: 'twitter:image',
        content: 'https://cofira.com/image.jpg',
      });
    });
  });

  describe('route-based meta tags', () => {
    beforeEach(() => {
      service.inicializar();
    });

    it('should use default tags for unknown routes', () => {
      routerEvents.next(new NavigationEnd(1, '/ruta-desconocida', '/ruta-desconocida'));

      expect(mockTitle.setTitle).toHaveBeenCalledWith('COFIRA - Tu entrenamiento, nutrición y progreso');
    });

    it('should handle routes with query params', () => {
      routerEvents.next(new NavigationEnd(1, '/login?returnUrl=/dashboard', '/login?returnUrl=/dashboard'));

      expect(mockTitle.setTitle).toHaveBeenCalledWith('Iniciar Sesión - COFIRA');
    });

    it('should handle routes with hash fragments', () => {
      routerEvents.next(new NavigationEnd(1, '/seguimiento#stats', '/seguimiento#stats'));

      expect(mockTitle.setTitle).toHaveBeenCalledWith('Seguimiento - COFIRA');
    });
  });
});
