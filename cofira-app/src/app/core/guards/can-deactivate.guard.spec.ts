import { canDeactivateGuard, CanComponentDeactivate } from './can-deactivate.guard';
import { of } from 'rxjs';

describe('canDeactivateGuard', () => {
  it('should return true when component has no canDeactivate method', () => {
    const componentSinMetodo = {} as CanComponentDeactivate;

    const result = canDeactivateGuard(componentSinMetodo, null as any, null as any, null as any);

    expect(result).toBe(true);
  });

  it('should call canDeactivate and return its boolean result', () => {
    const componentConMetodo: CanComponentDeactivate = {
      canDeactivate: () => true,
    };

    const result = canDeactivateGuard(componentConMetodo, null as any, null as any, null as any);

    expect(result).toBe(true);
  });

  it('should return false when canDeactivate returns false', () => {
    const componentQuePrevieneNavegacion: CanComponentDeactivate = {
      canDeactivate: () => false,
    };

    const result = canDeactivateGuard(componentQuePrevieneNavegacion, null as any, null as any, null as any);

    expect(result).toBe(false);
  });

  it('should handle canDeactivate returning Observable<true>', (done) => {
    const componentConObservable: CanComponentDeactivate = {
      canDeactivate: () => of(true),
    };

    const result = canDeactivateGuard(componentConObservable, null as any, null as any, null as any);

    if (result instanceof Object && 'subscribe' in result) {
      result.subscribe((value) => {
        expect(value).toBe(true);
        done();
      });
    } else {
      fail('Se esperaba un Observable');
    }
  });

  it('should handle canDeactivate returning Observable<false>', (done) => {
    const componentConObservable: CanComponentDeactivate = {
      canDeactivate: () => of(false),
    };

    const result = canDeactivateGuard(componentConObservable, null as any, null as any, null as any);

    if (result instanceof Object && 'subscribe' in result) {
      result.subscribe((value) => {
        expect(value).toBe(false);
        done();
      });
    } else {
      fail('Se esperaba un Observable');
    }
  });

  it('should work with component that has dirty form pattern', () => {
    // Simular un componente con formulario sucio
    const componentConFormularioSucio: CanComponentDeactivate = {
      canDeactivate: () => {
        const formDirty = true;
        // En la practica, aqui iria confirm() pero lo simplificamos
        return !formDirty; // false si el form esta sucio
      },
    };

    const result = canDeactivateGuard(componentConFormularioSucio, null as any, null as any, null as any);

    expect(result).toBe(false);
  });

  it('should work with component that has clean form pattern', () => {
    // Simular un componente con formulario limpio
    const componentConFormularioLimpio: CanComponentDeactivate = {
      canDeactivate: () => {
        const formDirty = false;
        return !formDirty; // true si el form esta limpio
      },
    };

    const result = canDeactivateGuard(componentConFormularioLimpio, null as any, null as any, null as any);

    expect(result).toBe(true);
  });
});
