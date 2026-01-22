import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesNotifications } from './preferences-notifications';

describe('PreferencesNotifications', () => {
  let component: PreferencesNotifications;
  let fixture: ComponentFixture<PreferencesNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesNotifications],
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesNotifications);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Email Settings', () => {
    it('deberia tener 4 configuraciones de email', () => {
      expect(component.emailSettings().length).toBe(4);
    });

    it('deberia tener la configuracion de recordatorios de entrenamiento', () => {
      const configuracionRecordatorios = component.emailSettings().find(
        (setting) => setting.id === 'training-reminders'
      );
      expect(configuracionRecordatorios).toBeTruthy();
      expect(configuracionRecordatorios?.label).toBe('Recordatorios de entrenamiento');
      expect(configuracionRecordatorios?.enabled).toBeTrue();
    });

    it('deberia tener la configuracion de actualizaciones de progreso', () => {
      const configuracionProgreso = component.emailSettings().find(
        (setting) => setting.id === 'progress-updates'
      );
      expect(configuracionProgreso).toBeTruthy();
      expect(configuracionProgreso?.label).toBe('Actualizaciones de progreso');
      expect(configuracionProgreso?.enabled).toBeTrue();
    });

    it('deberia tener la configuracion de promociones deshabilitada por defecto', () => {
      const configuracionPromociones = component.emailSettings().find(
        (setting) => setting.id === 'promotions'
      );
      expect(configuracionPromociones).toBeTruthy();
      expect(configuracionPromociones?.label).toBe('Novedades y promociones');
      expect(configuracionPromociones?.enabled).toBeFalse();
    });

    it('deberia tener la configuracion de consejos de nutricion', () => {
      const configuracionNutricion = component.emailSettings().find(
        (setting) => setting.id === 'nutrition-tips'
      );
      expect(configuracionNutricion).toBeTruthy();
      expect(configuracionNutricion?.label).toBe('Consejos de nutricion');
      expect(configuracionNutricion?.enabled).toBeTrue();
    });

    it('deberia alternar una configuracion de email especifica', () => {
      const estadoInicial = component.emailSettings().find(
        (s) => s.id === 'training-reminders'
      )?.enabled;

      component.toggleEmailSetting('training-reminders');

      const estadoFinal = component.emailSettings().find(
        (s) => s.id === 'training-reminders'
      )?.enabled;

      expect(estadoFinal).toBe(!estadoInicial);
    });

    it('deberia habilitar todas las configuraciones de email', () => {
      component.disableAllEmail();
      component.enableAllEmail();

      const todasHabilitadas = component.emailSettings().every((setting) => setting.enabled);
      expect(todasHabilitadas).toBeTrue();
    });

    it('deberia deshabilitar todas las configuraciones de email', () => {
      component.enableAllEmail();
      component.disableAllEmail();

      const todasDeshabilitadas = component.emailSettings().every(
        (setting) => !setting.enabled
      );
      expect(todasDeshabilitadas).toBeTrue();
    });
  });

  describe('Push Settings', () => {
    it('deberia tener 3 configuraciones push', () => {
      expect(component.pushSettings().length).toBe(3);
    });

    it('deberia tener la configuracion de recordatorios diarios', () => {
      const configuracionRecordatorios = component.pushSettings().find(
        (setting) => setting.id === 'daily-reminders'
      );
      expect(configuracionRecordatorios).toBeTruthy();
      expect(configuracionRecordatorios?.label).toBe('Recordatorios diarios');
      expect(configuracionRecordatorios?.enabled).toBeTrue();
    });

    it('deberia tener la configuracion de logros deshabilitada por defecto', () => {
      const configuracionLogros = component.pushSettings().find(
        (setting) => setting.id === 'achievements'
      );
      expect(configuracionLogros).toBeTruthy();
      expect(configuracionLogros?.label).toBe('Logros y objetivos cumplidos');
      expect(configuracionLogros?.enabled).toBeFalse();
    });

    it('deberia tener la configuracion de mensajes de motivacion', () => {
      const configuracionMotivacion = component.pushSettings().find(
        (setting) => setting.id === 'motivation'
      );
      expect(configuracionMotivacion).toBeTruthy();
      expect(configuracionMotivacion?.label).toBe('Mensajes de motivacion');
      expect(configuracionMotivacion?.enabled).toBeTrue();
    });

    it('deberia alternar una configuracion push especifica', () => {
      const estadoInicial = component.pushSettings().find(
        (s) => s.id === 'achievements'
      )?.enabled;

      component.togglePushSetting('achievements');

      const estadoFinal = component.pushSettings().find(
        (s) => s.id === 'achievements'
      )?.enabled;

      expect(estadoFinal).toBe(!estadoInicial);
    });

    it('deberia habilitar todas las configuraciones push', () => {
      component.disableAllPush();
      component.enableAllPush();

      const todasHabilitadas = component.pushSettings().every((setting) => setting.enabled);
      expect(todasHabilitadas).toBeTrue();
    });

    it('deberia deshabilitar todas las configuraciones push', () => {
      component.enableAllPush();
      component.disableAllPush();

      const todasDeshabilitadas = component.pushSettings().every(
        (setting) => !setting.enabled
      );
      expect(todasDeshabilitadas).toBeTrue();
    });
  });

  describe('Integracion', () => {
    it('deberia mantener configuraciones de email independientes de push', () => {
      component.disableAllEmail();

      const pushTienenAlgunaHabilitada = component.pushSettings().some(
        (setting) => setting.enabled
      );
      expect(pushTienenAlgunaHabilitada).toBeTrue();
    });

    it('deberia mantener configuraciones push independientes de email', () => {
      component.disableAllPush();

      const emailTienenAlgunaHabilitada = component.emailSettings().some(
        (setting) => setting.enabled
      );
      expect(emailTienenAlgunaHabilitada).toBeTrue();
    });

    it('deberia alternar solo la configuracion especificada sin afectar otras', () => {
      const estadoInicialRecordatorios = component.emailSettings().find(
        (s) => s.id === 'training-reminders'
      )?.enabled;
      const estadoInicialProgreso = component.emailSettings().find(
        (s) => s.id === 'progress-updates'
      )?.enabled;

      component.toggleEmailSetting('training-reminders');

      const estadoFinalRecordatorios = component.emailSettings().find(
        (s) => s.id === 'training-reminders'
      )?.enabled;
      const estadoFinalProgreso = component.emailSettings().find(
        (s) => s.id === 'progress-updates'
      )?.enabled;

      expect(estadoFinalRecordatorios).toBe(!estadoInicialRecordatorios);
      expect(estadoFinalProgreso).toBe(estadoInicialProgreso);
    });

    it('deberia manejar multiples toggles consecutivos', () => {
      const estadoOriginal = component.emailSettings().find(
        (s) => s.id === 'promotions'
      )?.enabled;

      component.toggleEmailSetting('promotions');
      component.toggleEmailSetting('promotions');

      const estadoFinal = component.emailSettings().find(
        (s) => s.id === 'promotions'
      )?.enabled;

      expect(estadoFinal).toBe(estadoOriginal);
    });
  });

  it('deberia ser un componente standalone', () => {
    const esStandalone = (PreferencesNotifications as any).ɵcmp?.standalone;
    expect(esStandalone).toBeTrue();
  });

  it('deberia tener todas las configuraciones con descripciones definidas', () => {
    const emailSinDescripcion = component.emailSettings().some(
      (setting) => !setting.description
    );
    const pushSinDescripcion = component.pushSettings().some(
      (setting) => !setting.description
    );

    expect(emailSinDescripcion).toBeFalse();
    expect(pushSinDescripcion).toBeFalse();
  });
});
