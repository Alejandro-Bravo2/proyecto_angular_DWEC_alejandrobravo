import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { PreferencesLayout } from './preferences-layout';

describe('PreferencesLayout', () => {
  let component: PreferencesLayout;
  let fixture: ComponentFixture<PreferencesLayout>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesLayout],
      providers: [
        provideRouter([
          {
            path: '',
            component: PreferencesLayout,
            children: [
              { path: 'alimentacion', component: PreferencesLayout },
              { path: 'cuenta', component: PreferencesLayout },
              { path: 'notificaciones', component: PreferencesLayout },
            ],
          },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PreferencesLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('deberia tener 3 elementos de navegacion', () => {
    expect(component.navItems.length).toBe(3);
  });

  it('deberia tener el item de alimentacion configurado correctamente', () => {
    const itemAlimentacion = component.navItems[0];
    expect(itemAlimentacion.path).toBe('alimentacion');
    expect(itemAlimentacion.label).toBe('Alimentacion');
    expect(itemAlimentacion.icon).toBe('nutrition');
  });

  it('deberia tener el item de cuenta configurado correctamente', () => {
    const itemCuenta = component.navItems[1];
    expect(itemCuenta.path).toBe('cuenta');
    expect(itemCuenta.label).toBe('Cuenta');
    expect(itemCuenta.icon).toBe('account');
  });

  it('deberia tener el item de notificaciones configurado correctamente', () => {
    const itemNotificaciones = component.navItems[2];
    expect(itemNotificaciones.path).toBe('notificaciones');
    expect(itemNotificaciones.label).toBe('Notificaciones');
    expect(itemNotificaciones.icon).toBe('notifications');
  });

  it('deberia renderizar el router-outlet para rutas hijas', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy();
  });

  it('deberia tener los paths correctos para cada navItem', () => {
    const pathsEsperados = ['alimentacion', 'cuenta', 'notificaciones'];
    const pathsActuales = component.navItems.map((item) => item.path);
    expect(pathsActuales).toEqual(pathsEsperados);
  });

  it('deberia tener los labels correctos para cada navItem', () => {
    const labelsEsperados = ['Alimentacion', 'Cuenta', 'Notificaciones'];
    const labelsActuales = component.navItems.map((item) => item.label);
    expect(labelsActuales).toEqual(labelsEsperados);
  });

  it('deberia tener los iconos correctos para cada navItem', () => {
    const iconosEsperados = ['nutrition', 'account', 'notifications'];
    const iconosActuales = component.navItems.map((item) => item.icon);
    expect(iconosActuales).toEqual(iconosEsperados);
  });

  it('deberia ser un componente standalone', () => {
    const esStandalone = (PreferencesLayout as any).ɵcmp?.standalone;
    expect(esStandalone).toBeTrue();
  });
});
