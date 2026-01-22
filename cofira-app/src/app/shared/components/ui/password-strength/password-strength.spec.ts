import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';

import { PasswordStrength } from './password-strength';

/**
 * Componente host para probar PasswordStrength con diferentes contraseñas
 */
@Component({
  standalone: true,
  imports: [PasswordStrength],
  template: `
    <app-password-strength
      [password]="password()"
      [showRequirements]="showRequirements()"
    />
  `
})
class ComponenteHostDePruebas {
  password = signal<string>('');
  showRequirements = signal<boolean>(true);
}

describe('PasswordStrength', () => {
  let component: PasswordStrength;
  let fixture: ComponentFixture<PasswordStrength>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrength]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrength);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Valores por defecto', () => {
    it('deberia tener password vacio por defecto', () => {
      fixture.detectChanges();
      expect(component.password()).toBe('');
    });

    it('deberia tener showRequirements en true por defecto', () => {
      fixture.detectChanges();
      expect(component.showRequirements()).toBeTrue();
    });

    it('deberia tener strength 0 con password vacio', () => {
      fixture.detectChanges();
      expect(component.strength()).toBe(0);
    });

    it('deberia tener strengthLabel vacio con password vacio', () => {
      fixture.detectChanges();
      expect(component.strengthLabel()).toBe('');
    });
  });

  describe('Calculo de fortaleza', () => {
    it('deberia retornar 0 para password vacio', () => {
      fixture.componentRef.setInput('password', '');
      fixture.detectChanges();

      expect(component.strength()).toBe(0);
    });

    it('deberia retornar 0 para password muy corto', () => {
      fixture.componentRef.setInput('password', 'abc');
      fixture.detectChanges();

      expect(component.strength()).toBe(0);
    });

    it('deberia retornar 1 (Debil) para password con 8+ caracteres y complejidad basica', () => {
      // 'AbCdEfGh' => length>=8(+1), upper/lower(+1) = score 2 => nivel 1
      fixture.componentRef.setInput('password', 'AbCdEfGh');
      fixture.detectChanges();

      expect(component.strength()).toBe(1);
      expect(component.strengthLabel()).toBe('Débil');
    });

    it('deberia retornar 2 (Regular) para password con longitud, mayusculas/minusculas y numero', () => {
      // 'AbcDefGhIj12' => length>=8(+1), length>=12(+1), upper/lower(+1), number(+1) = score 4 => nivel 2
      fixture.componentRef.setInput('password', 'AbcDefGhIj12');
      fixture.detectChanges();

      expect(component.strength()).toBe(2);
      expect(component.strengthLabel()).toBe('Regular');
    });

    it('deberia retornar 3 (Buena) para password con longitud, mayusculas/minusculas, numero y simbolo corto', () => {
      // Password con 11 caracteres, mayusculas/minusculas, numero y simbolo
      // length>=8(+1), length<12(0), upper/lower(+1), number(+1), special(+1) = score 4 => nivel 2? No...
      // Necesitamos score 5 para nivel 3
      // 'AbcDef12!' = 9 chars: >=8(+1), <12(0), upper/lower(+1), number(+1), special(+1) = 4 => nivel 2
      // 'AbcDefGhIj1!' = 12 chars: >=8(+1), >=12(+1), upper/lower(+1), number(+1), special(+1) = 5 => nivel 3
      fixture.componentRef.setInput('password', 'AbcDefGhIj1!');
      fixture.detectChanges();

      expect(component.strength()).toBe(3);
      expect(component.strengthLabel()).toBe('Buena');
    });

    it('deberia retornar 3 (Buena) para password completo con todos los criterios', () => {
      // El maximo score posible es 5, que retorna nivel 3 (Buena)
      // 'AbcDefGh123!@#' => length>=8(+1), length>=12(+1), upper/lower(+1), number(+1), special(+1) = score 5 => nivel 3
      fixture.componentRef.setInput('password', 'AbcDefGh123!@#');
      fixture.detectChanges();

      expect(component.strength()).toBe(3);
      expect(component.strengthLabel()).toBe('Buena');
    });
  });

  describe('Clases CSS de label', () => {
    it('deberia retornar clase weak para fortaleza 1', () => {
      // 'AbCdEfGh' => length>=8(+1), upper/lower(+1) = score 2 => nivel 1 (weak)
      fixture.componentRef.setInput('password', 'AbCdEfGh');
      fixture.detectChanges();

      expect(component.labelClass()).toBe('c-password-strength__label--weak');
    });

    it('deberia retornar clase fair para fortaleza 2', () => {
      // Password con score 4 => nivel 2 (Regular/fair)
      fixture.componentRef.setInput('password', 'AbcDefGhIj12');
      fixture.detectChanges();

      expect(component.labelClass()).toBe('c-password-strength__label--fair');
    });

    it('deberia retornar clase good para fortaleza 3', () => {
      // Password con score 5 => nivel 3 (Buena/good)
      fixture.componentRef.setInput('password', 'AbcDefGhIj1!');
      fixture.detectChanges();

      expect(component.labelClass()).toBe('c-password-strength__label--good');
    });

    it('deberia retornar clase good para el maximo nivel alcanzable (3)', () => {
      // El maximo score posible es 5, que retorna nivel 3 (good)
      // 'AbcDefGh123!@#' => score 5 => nivel 3
      fixture.componentRef.setInput('password', 'AbcDefGh123!@#');
      fixture.detectChanges();

      expect(component.labelClass()).toBe('c-password-strength__label--good');
    });

    it('deberia retornar clase vacia para fortaleza 0', () => {
      fixture.componentRef.setInput('password', '');
      fixture.detectChanges();

      expect(component.labelClass()).toBe('c-password-strength__label--');
    });
  });

  describe('Requisitos individuales', () => {
    describe('hasMinLength', () => {
      it('deberia retornar false para password menor a 12 caracteres', () => {
        fixture.componentRef.setInput('password', 'abcdefghij');
        fixture.detectChanges();

        expect(component.hasMinLength()).toBeFalse();
      });

      it('deberia retornar true para password de 12 caracteres', () => {
        fixture.componentRef.setInput('password', 'abcdefghijkl');
        fixture.detectChanges();

        expect(component.hasMinLength()).toBeTrue();
      });

      it('deberia retornar true para password mayor a 12 caracteres', () => {
        fixture.componentRef.setInput('password', 'abcdefghijklmno');
        fixture.detectChanges();

        expect(component.hasMinLength()).toBeTrue();
      });
    });

    describe('hasUpperLower', () => {
      it('deberia retornar false para solo minusculas', () => {
        fixture.componentRef.setInput('password', 'abcdefgh');
        fixture.detectChanges();

        expect(component.hasUpperLower()).toBeFalse();
      });

      it('deberia retornar false para solo mayusculas', () => {
        fixture.componentRef.setInput('password', 'ABCDEFGH');
        fixture.detectChanges();

        expect(component.hasUpperLower()).toBeFalse();
      });

      it('deberia retornar true para mezcla de mayusculas y minusculas', () => {
        fixture.componentRef.setInput('password', 'AbCdEfGh');
        fixture.detectChanges();

        expect(component.hasUpperLower()).toBeTrue();
      });
    });

    describe('hasNumber', () => {
      it('deberia retornar false para password sin numeros', () => {
        fixture.componentRef.setInput('password', 'abcdefgh');
        fixture.detectChanges();

        expect(component.hasNumber()).toBeFalse();
      });

      it('deberia retornar true para password con al menos un numero', () => {
        fixture.componentRef.setInput('password', 'abcdefg1');
        fixture.detectChanges();

        expect(component.hasNumber()).toBeTrue();
      });

      it('deberia retornar true para password con varios numeros', () => {
        fixture.componentRef.setInput('password', 'abc123def');
        fixture.detectChanges();

        expect(component.hasNumber()).toBeTrue();
      });
    });

    describe('hasSpecialChar', () => {
      it('deberia retornar false para password sin caracteres especiales', () => {
        fixture.componentRef.setInput('password', 'abcdefgh123');
        fixture.detectChanges();

        expect(component.hasSpecialChar()).toBeFalse();
      });

      it('deberia retornar true para password con simbolo !', () => {
        fixture.componentRef.setInput('password', 'abcdefgh!');
        fixture.detectChanges();

        expect(component.hasSpecialChar()).toBeTrue();
      });

      it('deberia retornar true para password con simbolo @', () => {
        fixture.componentRef.setInput('password', 'abcdefgh@');
        fixture.detectChanges();

        expect(component.hasSpecialChar()).toBeTrue();
      });

      it('deberia retornar true para password con simbolo #', () => {
        fixture.componentRef.setInput('password', 'abcdefgh#');
        fixture.detectChanges();

        expect(component.hasSpecialChar()).toBeTrue();
      });

      it('deberia retornar true para password con espacio', () => {
        fixture.componentRef.setInput('password', 'abcdefgh ');
        fixture.detectChanges();

        expect(component.hasSpecialChar()).toBeTrue();
      });

      it('deberia retornar true para password con guion', () => {
        fixture.componentRef.setInput('password', 'abc-defgh');
        fixture.detectChanges();

        expect(component.hasSpecialChar()).toBeTrue();
      });
    });
  });

  describe('Casos de password especificos', () => {
    it('deberia evaluar correctamente password solo numeros', () => {
      // '12345678' => length>=8(+1), number(+1) = score 2 => nivel 1
      fixture.componentRef.setInput('password', '12345678');
      fixture.detectChanges();

      expect(component.hasMinLength()).toBeFalse();
      expect(component.hasUpperLower()).toBeFalse();
      expect(component.hasNumber()).toBeTrue();
      expect(component.hasSpecialChar()).toBeFalse();
      expect(component.strength()).toBe(1);
    });

    it('deberia evaluar correctamente password seguro tipico', () => {
      // 'MiPassword123!' = 14 chars => length>=8(+1), length>=12(+1), upper/lower(+1), number(+1), special(+1) = score 5 => nivel 3
      fixture.componentRef.setInput('password', 'MiPassword123!');
      fixture.detectChanges();

      expect(component.hasMinLength()).toBeTrue();
      expect(component.hasUpperLower()).toBeTrue();
      expect(component.hasNumber()).toBeTrue();
      expect(component.hasSpecialChar()).toBeTrue();
      expect(component.strength()).toBe(3);
    });

    it('deberia evaluar correctamente password con caracteres unicode', () => {
      fixture.componentRef.setInput('password', 'contraseña123');
      fixture.detectChanges();

      expect(component.hasSpecialChar()).toBeTrue();
    });
  });
});

describe('PasswordStrength con ComponenteHost', () => {
  let hostFixture: ComponentFixture<ComponenteHostDePruebas>;
  let hostComponent: ComponenteHostDePruebas;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponenteHostDePruebas]
    }).compileComponents();

    hostFixture = TestBed.createComponent(ComponenteHostDePruebas);
    hostComponent = hostFixture.componentInstance;
  });

  it('no deberia mostrar el componente cuando password esta vacio', () => {
    hostComponent.password.set('');
    hostFixture.detectChanges();

    const indicador = hostFixture.nativeElement.querySelector('.c-password-strength');
    expect(indicador).toBeFalsy();
  });

  it('deberia mostrar el componente cuando password tiene contenido', () => {
    hostComponent.password.set('test');
    hostFixture.detectChanges();

    const indicador = hostFixture.nativeElement.querySelector('.c-password-strength');
    expect(indicador).toBeTruthy();
  });

  it('deberia mostrar los requisitos cuando showRequirements es true', () => {
    hostComponent.password.set('test');
    hostComponent.showRequirements.set(true);
    hostFixture.detectChanges();

    const requisitos = hostFixture.nativeElement.querySelector('.c-password-strength__requirements');
    expect(requisitos).toBeTruthy();
  });

  it('no deberia mostrar los requisitos cuando showRequirements es false', () => {
    hostComponent.password.set('test');
    hostComponent.showRequirements.set(false);
    hostFixture.detectChanges();

    const requisitos = hostFixture.nativeElement.querySelector('.c-password-strength__requirements');
    expect(requisitos).toBeFalsy();
  });

  it('deberia mostrar 4 segmentos de fortaleza', () => {
    hostComponent.password.set('test');
    hostFixture.detectChanges();

    const segmentos = hostFixture.nativeElement.querySelectorAll('.c-password-strength__segment');
    expect(segmentos.length).toBe(4);
  });

  it('deberia marcar segmentos activos segun la fortaleza', () => {
    // 'AbCdEfGhIjKl123!' => score 5 => nivel 3 => 3 segmentos activos
    hostComponent.password.set('AbCdEfGhIjKl123!');
    hostFixture.detectChanges();

    const segmentosActivos = hostFixture.nativeElement.querySelectorAll('.c-password-strength__segment--active');
    expect(segmentosActivos.length).toBe(3);
  });

  it('deberia mostrar el label de fortaleza', () => {
    // 'AbCdEfGhIjKl123!' => score 5 => nivel 3 => 'Buena'
    hostComponent.password.set('AbCdEfGhIjKl123!');
    hostFixture.detectChanges();

    const label = hostFixture.nativeElement.querySelector('.c-password-strength__label');
    expect(label.textContent).toContain('Buena');
  });

  it('deberia tener atributos ARIA correctos', () => {
    hostComponent.password.set('test');
    hostFixture.detectChanges();

    const indicador = hostFixture.nativeElement.querySelector('.c-password-strength');
    expect(indicador.getAttribute('role')).toBe('status');
    expect(indicador.getAttribute('aria-label')).toBe('Indicador de fortaleza de contraseña');
  });

  it('deberia actualizar correctamente al cambiar el password', () => {
    hostComponent.password.set('abc');
    hostFixture.detectChanges();

    let label = hostFixture.nativeElement.querySelector('.c-password-strength__label');
    expect(label.textContent.trim()).toBe('');

    // 'AbCdEfGhIjKl123!' => score 5 => nivel 3 => 'Buena'
    hostComponent.password.set('AbCdEfGhIjKl123!');
    hostFixture.detectChanges();

    label = hostFixture.nativeElement.querySelector('.c-password-strength__label');
    expect(label.textContent).toContain('Buena');
  });

  describe('Requisitos visuales', () => {
    beforeEach(() => {
      hostComponent.password.set('test');
      hostComponent.showRequirements.set(true);
      hostFixture.detectChanges();
    });

    it('deberia mostrar 4 requisitos en la lista', () => {
      const requisitos = hostFixture.nativeElement.querySelectorAll('.c-password-strength__requirements li');
      expect(requisitos.length).toBe(4);
    });

    it('deberia marcar requisito de longitud como cumplido', () => {
      hostComponent.password.set('123456789012');
      hostFixture.detectChanges();

      const requisitos = hostFixture.nativeElement.querySelectorAll('.c-password-strength__requirements li');
      expect(requisitos[0].classList.contains('c-password-strength__requirement--met')).toBeTrue();
    });

    it('deberia marcar requisito de mayusculas/minusculas como cumplido', () => {
      hostComponent.password.set('AbCd');
      hostFixture.detectChanges();

      const requisitos = hostFixture.nativeElement.querySelectorAll('.c-password-strength__requirements li');
      expect(requisitos[1].classList.contains('c-password-strength__requirement--met')).toBeTrue();
    });

    it('deberia marcar requisito de numero como cumplido', () => {
      hostComponent.password.set('test1');
      hostFixture.detectChanges();

      const requisitos = hostFixture.nativeElement.querySelectorAll('.c-password-strength__requirements li');
      expect(requisitos[2].classList.contains('c-password-strength__requirement--met')).toBeTrue();
    });

    it('deberia marcar requisito de caracter especial como cumplido', () => {
      hostComponent.password.set('test!');
      hostFixture.detectChanges();

      const requisitos = hostFixture.nativeElement.querySelectorAll('.c-password-strength__requirements li');
      expect(requisitos[3].classList.contains('c-password-strength__requirement--met')).toBeTrue();
    });
  });
});
