import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import { Subject } from 'rxjs';

import { Breadcrumbs } from './breadcrumbs';

describe('Breadcrumbs', () => {
  let component: Breadcrumbs;
  let fixture: ComponentFixture<Breadcrumbs>;
  let routerEventsSubject: Subject<any>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();

    // Mock de ActivatedRoute con estructura anidada
    mockActivatedRoute = {
      root: {
        children: [],
        snapshot: {
          url: [],
          data: {}
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [Breadcrumbs],
      providers: [
        {
          provide: Router,
          useValue: {
            events: routerEventsSubject.asObservable(),
            // Métodos requeridos por RouterLink
            createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
            serializeUrl: jasmine.createSpy('serializeUrl').and.callFake((urlTree: any) => '/mock-url')
          }
        },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumbs);
    component = fixture.componentInstance;
  });

  describe('Creacion del componente', () => {
    it('deberia crear el componente correctamente', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('deberia tener breadcrumbs$ como Observable', () => {
      fixture.detectChanges();
      expect(component.breadcrumbs$).toBeTruthy();
    });
  });

  describe('breadcrumbs$ Observable', () => {
    it('deberia emitir breadcrumbs al inicializar (startWith)', fakeAsync(() => {
      fixture.detectChanges();

      let resultado: any[] = [];
      component.breadcrumbs$.subscribe(breadcrumbs => {
        resultado = breadcrumbs;
      });
      tick();

      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado)).toBe(true);
    }));

    it('deberia emitir breadcrumbs en NavigationEnd', fakeAsync(() => {
      fixture.detectChanges();

      let resultado: any[] = [];
      component.breadcrumbs$.subscribe(breadcrumbs => {
        resultado = breadcrumbs;
      });

      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
      tick();

      expect(resultado).toBeDefined();
    }));

    it('deberia ignorar eventos que no son NavigationEnd', fakeAsync(() => {
      fixture.detectChanges();

      let contadorEmisiones = 0;
      component.breadcrumbs$.subscribe(() => {
        contadorEmisiones++;
      });
      tick();

      const emisionesIniciales = contadorEmisiones;

      // Emitir un evento que no es NavigationEnd
      routerEventsSubject.next({ type: 'otro-evento' });
      tick();

      // El contador no deberia haber aumentado
      expect(contadorEmisiones).toBe(emisionesIniciales);
    }));
  });

  describe('buildBreadcrumbs (via breadcrumbs$)', () => {
    it('deberia devolver array vacio si no hay children', fakeAsync(() => {
      mockActivatedRoute.root.children = [];
      fixture.detectChanges();

      let resultado: any[] = [];
      component.breadcrumbs$.subscribe(breadcrumbs => {
        resultado = breadcrumbs;
      });
      tick();

      expect(resultado).toEqual([]);
    }));

    it('deberia construir breadcrumbs desde la ruta', fakeAsync(() => {
      // Configurar una estructura de ruta con children
      const mockChild = {
        snapshot: {
          url: [{ path: 'entrenamiento' }] as UrlSegment[],
          data: { breadcrumb: 'Entrenamiento' }
        },
        children: []
      };
      mockActivatedRoute.root.children = [mockChild];

      fixture.detectChanges();

      let resultado: any[] = [];
      component.breadcrumbs$.subscribe(breadcrumbs => {
        resultado = breadcrumbs;
      });
      tick();

      expect(resultado.length).toBe(1);
      expect(resultado[0].label).toBe('Entrenamiento');
      expect(resultado[0].url).toBe('/entrenamiento');
    }));

    it('deberia usar el path como label si no hay breadcrumb en data', fakeAsync(() => {
      const mockChild = {
        snapshot: {
          url: [{ path: 'mi-ruta' }] as UrlSegment[],
          data: {}
        },
        children: []
      };
      mockActivatedRoute.root.children = [mockChild];

      fixture.detectChanges();

      let resultado: any[] = [];
      component.breadcrumbs$.subscribe(breadcrumbs => {
        resultado = breadcrumbs;
      });
      tick();

      expect(resultado.length).toBe(1);
      expect(resultado[0].label).toBe('mi-ruta');
    }));

    it('deberia construir breadcrumbs anidados', fakeAsync(() => {
      const mockGrandchild = {
        snapshot: {
          url: [{ path: 'ejercicio' }] as UrlSegment[],
          data: { breadcrumb: 'Ejercicio' }
        },
        children: []
      };

      const mockChild = {
        snapshot: {
          url: [{ path: 'entrenamiento' }] as UrlSegment[],
          data: { breadcrumb: 'Entrenamiento' }
        },
        children: [mockGrandchild]
      };

      mockActivatedRoute.root.children = [mockChild];

      fixture.detectChanges();

      let resultado: any[] = [];
      component.breadcrumbs$.subscribe(breadcrumbs => {
        resultado = breadcrumbs;
      });
      tick();

      expect(resultado.length).toBe(2);
      expect(resultado[0].label).toBe('Entrenamiento');
      expect(resultado[0].url).toBe('/entrenamiento');
      expect(resultado[1].label).toBe('Ejercicio');
      expect(resultado[1].url).toBe('/entrenamiento/ejercicio');
    }));

    it('deberia incluir rutas con URL vacia si tienen label definido en data', fakeAsync(() => {
      const mockChild = {
        snapshot: {
          url: [] as UrlSegment[],
          data: { breadcrumb: 'Contenedor' }
        },
        children: [{
          snapshot: {
            url: [{ path: 'real' }] as UrlSegment[],
            data: { breadcrumb: 'Real' }
          },
          children: []
        }]
      };
      mockActivatedRoute.root.children = [mockChild];

      fixture.detectChanges();

      let resultado: any[] = [];
      component.breadcrumbs$.subscribe(breadcrumbs => {
        resultado = breadcrumbs;
      });
      tick();

      // Incluye ambos breadcrumbs porque ambos tienen label definido
      expect(resultado.length).toBe(2);
      expect(resultado[0].label).toBe('Contenedor');
      expect(resultado[1].label).toBe('Real');
    }));

    it('deberia no agregar breadcrumb si label esta vacio', fakeAsync(() => {
      const mockChild = {
        snapshot: {
          url: [{ path: '' }] as UrlSegment[],
          data: { breadcrumb: '' }
        },
        children: []
      };
      mockActivatedRoute.root.children = [mockChild];

      fixture.detectChanges();

      let resultado: any[] = [];
      component.breadcrumbs$.subscribe(breadcrumbs => {
        resultado = breadcrumbs;
      });
      tick();

      expect(resultado.length).toBe(0);
    }));
  });

  describe('Renderizado en el DOM', () => {
    it('deberia renderizar el componente', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });
});
