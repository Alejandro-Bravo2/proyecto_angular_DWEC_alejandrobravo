import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Accordion, AccordionItem } from './accordion';

/**
 * Componente host para probar Accordion con multiples items
 */
@Component({
  standalone: true,
  imports: [Accordion, AccordionItem],
  template: `
    <app-accordion [singleOpen]="singleOpen">
      <app-accordion-item title="Pregunta 1">
        <p>Respuesta 1</p>
      </app-accordion-item>
      <app-accordion-item title="Pregunta 2">
        <p>Respuesta 2</p>
      </app-accordion-item>
      <app-accordion-item title="Pregunta 3">
        <p>Respuesta 3</p>
      </app-accordion-item>
    </app-accordion>
  `
})
class ComponenteHostDePruebas {
  singleOpen = false;

  @ViewChild(Accordion) accordion!: Accordion;
  @ViewChildren(AccordionItem) accordionItems!: QueryList<AccordionItem>;
}

/**
 * Componente host con singleOpen activado
 */
@Component({
  standalone: true,
  imports: [Accordion, AccordionItem],
  template: `
    <app-accordion [singleOpen]="true">
      <app-accordion-item title="Seccion A">
        <p>Contenido A</p>
      </app-accordion-item>
      <app-accordion-item title="Seccion B">
        <p>Contenido B</p>
      </app-accordion-item>
    </app-accordion>
  `
})
class ComponenteHostSingleOpen {
  @ViewChild(Accordion) accordion!: Accordion;
  @ViewChildren(AccordionItem) accordionItems!: QueryList<AccordionItem>;
}

/**
 * Componente host para items dinamicos
 */
@Component({
  standalone: true,
  imports: [Accordion, AccordionItem],
  template: `
    <app-accordion>
      @for (item of items; track item.id) {
        <app-accordion-item [title]="item.titulo">
          <p>{{ item.contenido }}</p>
        </app-accordion-item>
      }
    </app-accordion>
  `
})
class ComponenteHostDinamico {
  items = [{ id: 1, titulo: 'Item 1', contenido: 'Contenido 1' }];

  @ViewChild(Accordion) accordion!: Accordion;
  @ViewChildren(AccordionItem) accordionItems!: QueryList<AccordionItem>;
}

describe('Accordion', () => {
  let component: Accordion;
  let fixture: ComponentFixture<Accordion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accordion, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Accordion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('deberia tener singleOpen en false por defecto', () => {
    expect(component.singleOpen()).toBeFalse();
  });

  it('deberia aceptar singleOpen como input', () => {
    fixture.componentRef.setInput('singleOpen', true);
    fixture.detectChanges();

    expect(component.singleOpen()).toBeTrue();
  });

  it('deberia renderizar la estructura del accordion', () => {
    const elementoNativo = fixture.nativeElement;
    const seccion = elementoNativo.querySelector('.c-accordion');

    expect(seccion).toBeTruthy();
    expect(seccion.getAttribute('role')).toBe('region');
  });
});

describe('AccordionItem', () => {
  let component: AccordionItem;
  let fixture: ComponentFixture<AccordionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionItem, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionItem);
    component = fixture.componentInstance;
  });

  it('deberia crear el componente', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('deberia requerir el input title', () => {
    fixture.componentRef.setInput('title', 'Mi Titulo');
    fixture.detectChanges();

    expect(component.title()).toBe('Mi Titulo');
  });

  it('deberia estar cerrado por defecto', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    expect(component.isOpen()).toBeFalse();
  });

  it('deberia generar un itemId unico', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();

    expect(component.itemId).toMatch(/^accordion-[a-z0-9]+$/);
  });

  describe('Metodo toggle', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('title', 'Test');
      fixture.detectChanges();
    });

    it('deberia abrir el accordion cuando esta cerrado', () => {
      expect(component.isOpen()).toBeFalse();

      component.toggle();

      expect(component.isOpen()).toBeTrue();
    });

    it('deberia cerrar el accordion cuando esta abierto', () => {
      component.isOpen.set(true);

      component.toggle();

      expect(component.isOpen()).toBeFalse();
    });

    it('deberia alternar el estado correctamente multiples veces', () => {
      component.toggle();
      expect(component.isOpen()).toBeTrue();

      component.toggle();
      expect(component.isOpen()).toBeFalse();

      component.toggle();
      expect(component.isOpen()).toBeTrue();
    });
  });

  describe('Metodo open', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('title', 'Test');
      fixture.detectChanges();
    });

    it('deberia abrir el accordion', () => {
      component.open();

      expect(component.isOpen()).toBeTrue();
    });

    it('deberia mantener el estado si ya esta abierto', () => {
      component.isOpen.set(true);

      component.open();

      expect(component.isOpen()).toBeTrue();
    });
  });

  describe('Metodo close', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('title', 'Test');
      fixture.detectChanges();
    });

    it('deberia cerrar el accordion', () => {
      component.isOpen.set(true);

      component.close();

      expect(component.isOpen()).toBeFalse();
    });

    it('deberia mantener el estado si ya esta cerrado', () => {
      component.close();

      expect(component.isOpen()).toBeFalse();
    });
  });
});

describe('Accordion con ComponenteHost', () => {
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

  it('deberia renderizar todos los items del accordion', () => {
    const elementoNativo = hostFixture.nativeElement;
    const items = elementoNativo.querySelectorAll('app-accordion-item');

    expect(items.length).toBe(3);
  });

  it('deberia mostrar los titulos correctamente', () => {
    const elementoNativo = hostFixture.nativeElement;
    const titulos = elementoNativo.querySelectorAll('.c-accordion-item__title');

    expect(titulos[0].textContent).toContain('Pregunta 1');
    expect(titulos[1].textContent).toContain('Pregunta 2');
    expect(titulos[2].textContent).toContain('Pregunta 3');
  });

  it('deberia tener todos los items cerrados inicialmente', () => {
    const items = hostComponent.accordionItems.toArray();

    items.forEach(item => {
      expect(item.isOpen()).toBeFalse();
    });
  });

  it('deberia abrir un item al hacer click en el header', fakeAsync(() => {
    const elementoNativo = hostFixture.nativeElement;
    const header = elementoNativo.querySelector('.c-accordion-item__header');

    header.click();
    tick();
    hostFixture.detectChanges();

    const items = hostComponent.accordionItems.toArray();
    expect(items[0].isOpen()).toBeTrue();
  }));

  it('deberia permitir multiples items abiertos cuando singleOpen es false', fakeAsync(() => {
    hostComponent.singleOpen = false;
    hostFixture.detectChanges();

    const items = hostComponent.accordionItems.toArray();
    items[0].open();
    items[1].open();
    hostFixture.detectChanges();

    expect(items[0].isOpen()).toBeTrue();
    expect(items[1].isOpen()).toBeTrue();
  }));

  it('deberia tener atributos ARIA correctos', () => {
    const elementoNativo = hostFixture.nativeElement;
    const header = elementoNativo.querySelector('.c-accordion-item__header');

    expect(header.getAttribute('role')).toBe('button');
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(header.getAttribute('tabindex')).toBe('0');
  });

  it('deberia actualizar aria-expanded al abrir', fakeAsync(() => {
    const elementoNativo = hostFixture.nativeElement;
    const header = elementoNativo.querySelector('.c-accordion-item__header');

    header.click();
    tick();
    hostFixture.detectChanges();

    expect(header.getAttribute('aria-expanded')).toBe('true');
  }));

  it('deberia mostrar el icono correcto segun el estado', () => {
    const elementoNativo = hostFixture.nativeElement;
    const icono = elementoNativo.querySelector('.c-accordion-item__icon');

    expect(icono.textContent.trim()).toBe('+');

    const items = hostComponent.accordionItems.toArray();
    items[0].open();
    hostFixture.detectChanges();

    expect(icono.textContent.trim()).toBe('−');
  });

  it('deberia tener aria-controls correcto', () => {
    const elementoNativo = hostFixture.nativeElement;
    const header = elementoNativo.querySelector('.c-accordion-item__header');
    const itemId = hostComponent.accordionItems.first.itemId;

    expect(header.getAttribute('aria-controls')).toBe(`content-${itemId}`);
  });

  describe('Navegacion por teclado', () => {
    it('deberia navegar al siguiente item con ArrowDown', () => {
      const evento = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      hostComponent.accordion.onKeydown(evento);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('deberia navegar al item anterior con ArrowUp', () => {
      const evento = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      hostComponent.accordion.onKeydown(evento);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('deberia ir al primer item con Home', () => {
      const evento = new KeyboardEvent('keydown', { key: 'Home' });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      hostComponent.accordion.onKeydown(evento);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('deberia ir al ultimo item con End', () => {
      const evento = new KeyboardEvent('keydown', { key: 'End' });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      hostComponent.accordion.onKeydown(evento);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('no deberia hacer nada con teclas no mapeadas', () => {
      const evento = new KeyboardEvent('keydown', { key: 'a' });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      hostComponent.accordion.onKeydown(evento);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Eventos del mouse', () => {
    it('deberia prevenir el comportamiento por defecto en contextmenu', fakeAsync(() => {
      const elementoNativo = hostFixture.nativeElement;
      const header = elementoNativo.querySelector('.c-accordion-item__header');
      const evento = new MouseEvent('contextmenu', { bubbles: true });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      header.dispatchEvent(evento);
      tick();

      expect(preventDefaultSpy).toHaveBeenCalled();
    }));

    it('deberia prevenir el comportamiento por defecto en doble click', fakeAsync(() => {
      const elementoNativo = hostFixture.nativeElement;
      const header = elementoNativo.querySelector('.c-accordion-item__header');
      const evento = new MouseEvent('dblclick', { bubbles: true });
      const preventDefaultSpy = spyOn(evento, 'preventDefault');

      header.dispatchEvent(evento);
      tick();

      expect(preventDefaultSpy).toHaveBeenCalled();
    }));
  });
});

describe('Accordion con singleOpen', () => {
  let hostFixture: ComponentFixture<ComponenteHostSingleOpen>;
  let hostComponent: ComponenteHostSingleOpen;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponenteHostSingleOpen, NoopAnimationsModule]
    }).compileComponents();

    hostFixture = TestBed.createComponent(ComponenteHostSingleOpen);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('deberia tener singleOpen en true', () => {
    expect(hostComponent.accordion.singleOpen()).toBeTrue();
  });

  it('deberia cerrar otros items al abrir uno nuevo', fakeAsync(() => {
    const items = hostComponent.accordionItems.toArray();

    items[0].toggle();
    hostFixture.detectChanges();
    tick();

    expect(items[0].isOpen()).toBeTrue();
    expect(items[1].isOpen()).toBeFalse();

    items[1].toggle();
    hostFixture.detectChanges();
    tick();

    expect(items[0].isOpen()).toBeFalse();
    expect(items[1].isOpen()).toBeTrue();
  }));

  it('deberia permitir cerrar el item activo sin abrir otro', fakeAsync(() => {
    const items = hostComponent.accordionItems.toArray();

    items[0].toggle();
    hostFixture.detectChanges();
    tick();

    expect(items[0].isOpen()).toBeTrue();

    items[0].toggle();
    hostFixture.detectChanges();
    tick();

    expect(items[0].isOpen()).toBeFalse();
    expect(items[1].isOpen()).toBeFalse();
  }));
});

describe('AccordionItem renderizado', () => {
  let component: AccordionItem;
  let fixture: ComponentFixture<AccordionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionItem, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Titulo de prueba');
    fixture.detectChanges();
  });

  it('deberia renderizar el elemento details', () => {
    const details = fixture.nativeElement.querySelector('details');
    expect(details).toBeTruthy();
  });

  it('deberia renderizar el elemento summary', () => {
    const summary = fixture.nativeElement.querySelector('summary');
    expect(summary).toBeTruthy();
  });

  it('deberia mostrar el titulo en el summary', () => {
    const titulo = fixture.nativeElement.querySelector('.c-accordion-item__title');
    expect(titulo.textContent).toContain('Titulo de prueba');
  });

  it('deberia mostrar el icono de expansion', () => {
    const icono = fixture.nativeElement.querySelector('.c-accordion-item__icon');
    expect(icono).toBeTruthy();
  });

  it('deberia tener el atributo open en details cuando esta abierto', () => {
    component.open();
    fixture.detectChanges();

    const details = fixture.nativeElement.querySelector('details');
    expect(details.open).toBeTrue();
  });

  it('deberia tener la clase c-accordion-item', () => {
    const details = fixture.nativeElement.querySelector('.c-accordion-item');
    expect(details).toBeTruthy();
  });

  it('deberia tener el wrapper del contenido', () => {
    const wrapper = fixture.nativeElement.querySelector('.c-accordion-item__content-wrapper');
    expect(wrapper).toBeTruthy();
  });

  describe('Metodo focus', () => {
    it('deberia hacer foco en el header si existe', () => {
      const mockHeader = document.createElement('summary');
      const focusSpy = spyOn(mockHeader, 'focus');
      component.accordionHeader = { nativeElement: mockHeader } as any;

      component.focus();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('no deberia fallar si accordionHeader es undefined', () => {
      component.accordionHeader = undefined as any;

      expect(() => component.focus()).not.toThrow();
    });
  });
});

describe('Accordion sin items', () => {
  let component: Accordion;
  let fixture: ComponentFixture<Accordion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accordion, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(Accordion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia retornar temprano en onKeydown cuando no hay items', () => {
    const evento = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const preventDefaultSpy = spyOn(evento, 'preventDefault');

    component.onKeydown(evento);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('deberia manejar tecla Home sin items', () => {
    const evento = new KeyboardEvent('keydown', { key: 'Home' });
    const preventDefaultSpy = spyOn(evento, 'preventDefault');

    component.onKeydown(evento);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});

describe('Accordion con items dinamicos', () => {
  let hostFixture: ComponentFixture<ComponenteHostDinamico>;
  let hostComponent: ComponenteHostDinamico;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponenteHostDinamico, NoopAnimationsModule]
    }).compileComponents();

    hostFixture = TestBed.createComponent(ComponenteHostDinamico);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('deberia ejecutar setupItemListeners cuando los items cambian', fakeAsync(() => {
    expect(hostComponent.accordionItems.length).toBe(1);

    hostComponent.items = [
      { id: 1, titulo: 'Item 1', contenido: 'Contenido 1' },
      { id: 2, titulo: 'Item 2', contenido: 'Contenido 2' }
    ];
    hostFixture.detectChanges();
    tick();

    expect(hostComponent.accordionItems.length).toBe(2);
  }));

  it('deberia configurar listeners al agregar nuevos items', fakeAsync(() => {
    const itemsIniciales = hostComponent.accordionItems.length;

    hostComponent.items = [
      ...hostComponent.items,
      { id: 3, titulo: 'Item Nuevo', contenido: 'Contenido Nuevo' }
    ];
    hostFixture.detectChanges();
    tick();

    expect(hostComponent.accordionItems.length).toBe(itemsIniciales + 1);

    const evento = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    hostComponent.accordion.onKeydown(evento);

    expect(hostComponent.accordionItems.length).toBeGreaterThan(0);
  }));
});
