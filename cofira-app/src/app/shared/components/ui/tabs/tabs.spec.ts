import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Tabs, TabPanel, Tab } from './tabs';

/**
 * Componente host para probar Tabs con TabPanel
 */
@Component({
  standalone: true,
  imports: [Tabs, TabPanel],
  template: `
    <app-tabs [tabs]="tabs" [defaultTab]="defaultTab()" (tabChanged)="onTabChange($event)">
      <app-tab-panel [tabId]="'profile'" [isActive]="activeTab() === 'profile'">
        <p>Contenido del perfil</p>
      </app-tab-panel>
      <app-tab-panel [tabId]="'settings'" [isActive]="activeTab() === 'settings'">
        <p>Contenido de configuracion</p>
      </app-tab-panel>
      <app-tab-panel [tabId]="'notifications'" [isActive]="activeTab() === 'notifications'">
        <p>Contenido de notificaciones</p>
      </app-tab-panel>
    </app-tabs>
  `
})
class ComponenteHostDePruebas {
  tabs: Tab[] = [
    { id: 'profile', label: 'Perfil' },
    { id: 'settings', label: 'Configuracion' },
    { id: 'notifications', label: 'Notificaciones' }
  ];

  defaultTab = signal<string>('');
  activeTab = signal<string>('profile');
  tabChangedEvents: string[] = [];

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId);
    this.tabChangedEvents.push(tabId);
  }
}

/**
 * Componente host con tabs deshabilitados
 */
@Component({
  standalone: true,
  imports: [Tabs, TabPanel],
  template: `
    <app-tabs [tabs]="tabs" (tabChanged)="onTabChange($event)">
      <app-tab-panel [tabId]="'active'" [isActive]="activeTab() === 'active'">
        <p>Tab activo</p>
      </app-tab-panel>
      <app-tab-panel [tabId]="'disabled'" [isActive]="activeTab() === 'disabled'">
        <p>Tab deshabilitado</p>
      </app-tab-panel>
    </app-tabs>
  `
})
class ComponenteHostConTabsDeshabilitados {
  tabs: Tab[] = [
    { id: 'active', label: 'Activo' },
    { id: 'disabled', label: 'Deshabilitado', disabled: true }
  ];

  activeTab = signal<string>('active');

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId);
  }
}

describe('Tabs', () => {
  let component: Tabs;
  let fixture: ComponentFixture<Tabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabs, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Tabs);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    const tabsDePrueba: Tab[] = [{ id: 'test', label: 'Test' }];
    fixture.componentRef.setInput('tabs', tabsDePrueba);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('Inicializacion', () => {
    it('deberia establecer la primera pestana como activa por defecto', () => {
      const tabsDePrueba: Tab[] = [
        { id: 'first', label: 'Primera' },
        { id: 'second', label: 'Segunda' }
      ];
      fixture.componentRef.setInput('tabs', tabsDePrueba);
      fixture.detectChanges();

      expect(component.activeTabId()).toBe('first');
    });

    it('deberia usar defaultTab si se proporciona', () => {
      const tabsDePrueba: Tab[] = [
        { id: 'first', label: 'Primera' },
        { id: 'second', label: 'Segunda' }
      ];
      fixture.componentRef.setInput('tabs', tabsDePrueba);
      fixture.componentRef.setInput('defaultTab', 'second');
      fixture.detectChanges();

      expect(component.activeTabId()).toBe('second');
    });

    it('deberia ignorar defaultTab si no existe en tabs', () => {
      const tabsDePrueba: Tab[] = [
        { id: 'first', label: 'Primera' },
        { id: 'second', label: 'Segunda' }
      ];
      fixture.componentRef.setInput('tabs', tabsDePrueba);
      fixture.componentRef.setInput('defaultTab', 'noexiste');
      fixture.detectChanges();

      expect(component.activeTabId()).toBe('first');
    });

    it('deberia manejar array de tabs vacio', () => {
      const tabsVacios: Tab[] = [];
      fixture.componentRef.setInput('tabs', tabsVacios);
      fixture.detectChanges();

      expect(component.activeTabId()).toBe('');
    });
  });

  describe('Seleccion de tabs', () => {
    let tabsDePrueba: Tab[];

    beforeEach(() => {
      tabsDePrueba = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' }
      ];
      fixture.componentRef.setInput('tabs', tabsDePrueba);
      fixture.detectChanges();
    });

    it('deberia cambiar la pestana activa al seleccionar', () => {
      component.selectTab('tab2');

      expect(component.activeTabId()).toBe('tab2');
    });

    it('deberia emitir evento tabChanged al seleccionar', () => {
      const eventosEmitidos: string[] = [];
      component.tabChanged.subscribe((id: string) => eventosEmitidos.push(id));

      component.selectTab('tab2');

      expect(eventosEmitidos).toContain('tab2');
    });

    it('no deberia seleccionar tabs deshabilitados', () => {
      // Iniciar con el tab 'enabled' como activo
      component.activeTabId.set('tab1');

      // Intentar seleccionar un tab deshabilitado
      const tabsConDeshabilitado: Tab[] = [
        { id: 'tab1', label: 'Habilitado' },
        { id: 'disabled', label: 'Deshabilitado', disabled: true }
      ];
      fixture.componentRef.setInput('tabs', tabsConDeshabilitado);
      fixture.detectChanges();

      component.selectTab('disabled');

      // Deberia mantener el tab habilitado como activo
      expect(component.activeTabId()).toBe('tab1');
    });
  });

  describe('Navegacion por teclado', () => {
    let tabsDePrueba: Tab[];

    beforeEach(() => {
      tabsDePrueba = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' }
      ];
      fixture.componentRef.setInput('tabs', tabsDePrueba);
      fixture.detectChanges();
    });

    it('deberia navegar a la siguiente pestana con ArrowRight', () => {
      component.activeTabId.set('tab1');
      const evento = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      component.onKeydown(evento);

      expect(component.activeTabId()).toBe('tab2');
    });

    it('deberia navegar a la pestana anterior con ArrowLeft', () => {
      component.activeTabId.set('tab2');
      const evento = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

      component.onKeydown(evento);

      expect(component.activeTabId()).toBe('tab1');
    });

    it('deberia navegar de forma circular con ArrowRight desde la ultima', () => {
      component.activeTabId.set('tab3');
      const evento = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      component.onKeydown(evento);

      expect(component.activeTabId()).toBe('tab1');
    });

    it('deberia navegar de forma circular con ArrowLeft desde la primera', () => {
      component.activeTabId.set('tab1');
      const evento = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

      component.onKeydown(evento);

      expect(component.activeTabId()).toBe('tab3');
    });

    it('deberia ir a la primera pestana con Home', () => {
      component.activeTabId.set('tab3');
      const evento = new KeyboardEvent('keydown', { key: 'Home' });

      component.onKeydown(evento);

      expect(component.activeTabId()).toBe('tab1');
    });

    it('deberia ir a la ultima pestana con End', () => {
      component.activeTabId.set('tab1');
      const evento = new KeyboardEvent('keydown', { key: 'End' });

      component.onKeydown(evento);

      expect(component.activeTabId()).toBe('tab3');
    });

    it('deberia prevenir el comportamiento por defecto en teclas de navegacion', () => {
      component.activeTabId.set('tab1');
      const evento = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      component.onKeydown(evento);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('no deberia hacer nada con otras teclas', () => {
      component.activeTabId.set('tab1');
      const evento = new KeyboardEvent('keydown', { key: 'a' });

      component.onKeydown(evento);

      expect(component.activeTabId()).toBe('tab1');
    });

    it('deberia saltar tabs deshabilitados en navegacion', () => {
      const tabsConDeshabilitado: Tab[] = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true },
        { id: 'tab3', label: 'Tab 3' }
      ];
      fixture.componentRef.setInput('tabs', tabsConDeshabilitado);
      fixture.detectChanges();

      component.activeTabId.set('tab1');
      const evento = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      component.onKeydown(evento);

      expect(component.activeTabId()).toBe('tab3');
    });
  });

  describe('Indicador de pestana activa', () => {
    it('deberia inicializar indicatorPosition y indicatorWidth en 0', () => {
      const tabsDePrueba: Tab[] = [{ id: 'test', label: 'Test' }];
      fixture.componentRef.setInput('tabs', tabsDePrueba);
      fixture.detectChanges();

      expect(component.indicatorPosition()).toBe(0);
      expect(component.indicatorWidth()).toBe(0);
    });
  });
});

describe('Tabs con ComponenteHost', () => {
  let hostFixture: ComponentFixture<ComponenteHostDePruebas>;
  let hostComponent: ComponenteHostDePruebas;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponenteHostDePruebas, NoopAnimationsModule]
    }).compileComponents();

    hostFixture = TestBed.createComponent(ComponenteHostDePruebas);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('deberia renderizar los tabs correctamente', () => {
    const elementoNativo = hostFixture.nativeElement;
    const botonesTab = elementoNativo.querySelectorAll('.c-tabs__tab');

    expect(botonesTab.length).toBe(3);
    expect(botonesTab[0].textContent).toContain('Perfil');
    expect(botonesTab[1].textContent).toContain('Configuracion');
    expect(botonesTab[2].textContent).toContain('Notificaciones');
  });

  it('deberia marcar la pestana activa correctamente', () => {
    const elementoNativo = hostFixture.nativeElement;
    const tabActivo = elementoNativo.querySelector('.c-tabs__tab--active');

    expect(tabActivo).toBeTruthy();
    expect(tabActivo.textContent).toContain('Perfil');
  });

  it('deberia cambiar la pestana activa al hacer click', fakeAsync(() => {
    const elementoNativo = hostFixture.nativeElement;
    const botonesTab = elementoNativo.querySelectorAll('.c-tabs__tab');

    botonesTab[1].click();
    tick();
    hostFixture.detectChanges();

    expect(hostComponent.activeTab()).toBe('settings');
    expect(hostComponent.tabChangedEvents).toContain('settings');
  }));

  it('deberia mostrar el contenido del panel activo', () => {
    const elementoNativo = hostFixture.nativeElement;
    const contenidoPanel = elementoNativo.querySelector('.c-tab-panel');

    expect(contenidoPanel).toBeTruthy();
    expect(contenidoPanel.textContent).toContain('Contenido del perfil');
  });

  it('deberia tener atributos ARIA correctos', () => {
    const elementoNativo = hostFixture.nativeElement;
    const tabActivo = elementoNativo.querySelector('.c-tabs__tab--active');
    const tabInactivo = elementoNativo.querySelectorAll('.c-tabs__tab')[1];

    expect(tabActivo.getAttribute('aria-selected')).toBe('true');
    expect(tabActivo.getAttribute('role')).toBe('tab');
    expect(tabInactivo.getAttribute('aria-selected')).toBe('false');
  });

  it('deberia aplicar tabindex correcto para accesibilidad', () => {
    const elementoNativo = hostFixture.nativeElement;
    const botonesTab = elementoNativo.querySelectorAll('.c-tabs__tab');

    expect(botonesTab[0].getAttribute('tabindex')).toBe('0');
    expect(botonesTab[1].getAttribute('tabindex')).toBe('-1');
    expect(botonesTab[2].getAttribute('tabindex')).toBe('-1');
  });
});

describe('Tabs con tabs deshabilitados', () => {
  let hostFixture: ComponentFixture<ComponenteHostConTabsDeshabilitados>;
  let hostComponent: ComponenteHostConTabsDeshabilitados;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponenteHostConTabsDeshabilitados, NoopAnimationsModule]
    }).compileComponents();

    hostFixture = TestBed.createComponent(ComponenteHostConTabsDeshabilitados);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('deberia renderizar el tab deshabilitado con clase correcta', () => {
    const elementoNativo = hostFixture.nativeElement;
    const tabDeshabilitado = elementoNativo.querySelector('.c-tabs__tab--disabled');

    expect(tabDeshabilitado).toBeTruthy();
    expect(tabDeshabilitado.disabled).toBeTrue();
  });

  it('no deberia cambiar al tab deshabilitado al hacer click', fakeAsync(() => {
    const elementoNativo = hostFixture.nativeElement;
    const tabDeshabilitado = elementoNativo.querySelector('.c-tabs__tab--disabled');

    tabDeshabilitado.click();
    tick();
    hostFixture.detectChanges();

    expect(hostComponent.activeTab()).toBe('active');
  }));
});

describe('TabPanel', () => {
  let component: TabPanel;
  let fixture: ComponentFixture<TabPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabPanel, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TabPanel);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    fixture.componentRef.setInput('tabId', 'test');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('deberia tener isActive en false por defecto', () => {
    fixture.componentRef.setInput('tabId', 'test');
    fixture.detectChanges();

    expect(component.isActive()).toBeFalse();
  });

  it('deberia aceptar isActive como input', () => {
    fixture.componentRef.setInput('tabId', 'test');
    fixture.componentRef.setInput('isActive', true);
    fixture.detectChanges();

    expect(component.isActive()).toBeTrue();
  });

  it('deberia mostrar contenido solo cuando isActive es true', () => {
    fixture.componentRef.setInput('tabId', 'test');
    fixture.componentRef.setInput('isActive', false);
    fixture.detectChanges();

    const panelElement = fixture.nativeElement.querySelector('.c-tab-panel');
    expect(panelElement).toBeFalsy();

    fixture.componentRef.setInput('isActive', true);
    fixture.detectChanges();

    const panelElementActivo = fixture.nativeElement.querySelector('.c-tab-panel');
    expect(panelElementActivo).toBeTruthy();
  });

  it('deberia tener atributos ARIA correctos cuando esta activo', () => {
    fixture.componentRef.setInput('tabId', 'profile');
    fixture.componentRef.setInput('isActive', true);
    fixture.detectChanges();

    const panelElement = fixture.nativeElement.querySelector('.c-tab-panel');
    expect(panelElement.getAttribute('role')).toBe('tabpanel');
    expect(panelElement.getAttribute('aria-labelledby')).toBe('tab-profile');
    expect(panelElement.getAttribute('id')).toBe('panel-profile');
  });
});

describe('Tabs casos especiales de cobertura', () => {
  let component: Tabs;
  let fixture: ComponentFixture<Tabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabs, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Tabs);
    component = fixture.componentInstance;
  });

  describe('onKeydown con todos los tabs deshabilitados', () => {
    it('deberia retornar temprano si no hay tabs habilitados', () => {
      const tabsTodosDeshabilitados: Tab[] = [
        { id: 'tab1', label: 'Tab 1', disabled: true },
        { id: 'tab2', label: 'Tab 2', disabled: true }
      ];
      fixture.componentRef.setInput('tabs', tabsTodosDeshabilitados);
      fixture.detectChanges();

      const evento = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      component.onKeydown(evento);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('deberia retornar temprano si el tab activo no esta en la lista de habilitados', () => {
      const tabs: Tab[] = [
        { id: 'tab1', label: 'Tab 1', disabled: true },
        { id: 'tab2', label: 'Tab 2' }
      ];
      fixture.componentRef.setInput('tabs', tabs);
      fixture.detectChanges();

      component.activeTabId.set('tab1');

      const evento = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      component.onKeydown(evento);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateIndicatorPosition casos edge', () => {
    it('deberia manejar cuando el boton activo es undefined', fakeAsync(() => {
      const tabs: Tab[] = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' }
      ];
      fixture.componentRef.setInput('tabs', tabs);
      fixture.detectChanges();
      tick();

      component.activeTabId.set('tabNoExiste');
      fixture.detectChanges();

      expect(() => component.selectTab('tab1')).not.toThrow();
    }));

    it('deberia manejar updateIndicatorPosition cuando parentElement es null', fakeAsync(() => {
      const tabs: Tab[] = [
        { id: 'tab1', label: 'Tab 1' }
      ];
      fixture.componentRef.setInput('tabs', tabs);
      fixture.detectChanges();
      tick();

      const mockButton = document.createElement('button');
      Object.defineProperty(mockButton, 'parentElement', { value: null });

      if (component.tabButtons) {
        const originalToArray = component.tabButtons.toArray;
        spyOn(component.tabButtons, 'toArray').and.returnValue([
          { nativeElement: mockButton } as any
        ]);
      }

      expect(() => component.selectTab('tab1')).not.toThrow();
    }));
  });
});
