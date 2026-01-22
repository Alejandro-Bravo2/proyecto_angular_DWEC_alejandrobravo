import { Component, DebugElement, signal, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <button
      appTooltip="Tooltip de prueba"
      tooltipPosition="top"
      [tooltipDelay]="100"
      data-testid="tooltip-button"
    >
      Hover me
    </button>
  `,
})
class TestComponent {}

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <button
      [appTooltip]="tooltipText()"
      [tooltipPosition]="position()"
      [tooltipDelay]="delay()"
    >
      Dynamic
    </button>
  `,
})
class DynamicTestComponent {
  tooltipText = signal('Dynamic tooltip');
  position = signal<'top' | 'bottom' | 'left' | 'right'>('bottom');
  delay = signal(50);
}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let buttonEl: DebugElement;
  let directive: TooltipDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, DynamicTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    buttonEl = fixture.debugElement.query(By.css('button'));
    directive = buttonEl.injector.get(TooltipDirective);
  });

  afterEach(() => {
    // Clean up any tooltips left in the DOM
    const tooltips = document.querySelectorAll('.c-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
  });

  it('should create directive', () => {
    expect(directive).toBeTruthy();
  });

  it('should have correct tooltip text', () => {
    expect(directive.tooltipText()).toBe('Tooltip de prueba');
  });

  it('should have correct position', () => {
    expect(directive.tooltipPosition()).toBe('top');
  });

  it('should have correct delay', () => {
    expect(directive.tooltipDelay()).toBe(100);
  });

  describe('mouse events', () => {
    it('should show tooltip on mouseenter after delay', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150); // Wait for delay + some buffer

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.textContent).toContain('Tooltip de prueba');
    }));

    it('should hide tooltip on mouseleave', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const tooltipBefore = document.querySelector('.c-tooltip');
      expect(tooltipBefore).toBeTruthy();

      buttonEl.triggerEventHandler('mouseleave', null);
      tick(300); // Wait for fade-out animation

      const tooltipAfter = document.querySelector('.c-tooltip');
      expect(tooltipAfter).toBeFalsy();
    }));

    it('should not show tooltip if mouseleave before delay', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(50); // Less than delay

      buttonEl.triggerEventHandler('mouseleave', null);
      tick(150);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeFalsy();
    }));
  });

  describe('focus events', () => {
    it('should show tooltip on focus', fakeAsync(() => {
      buttonEl.triggerEventHandler('focus', null);
      tick(150);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeTruthy();
    }));

    it('should hide tooltip on blur', fakeAsync(() => {
      buttonEl.triggerEventHandler('focus', null);
      tick(150);

      buttonEl.triggerEventHandler('blur', null);
      tick(300);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeFalsy();
    }));
  });

  describe('accessibility', () => {
    it('should add aria-describedby when tooltip is shown', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const ariaDescribedBy = buttonEl.nativeElement.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toBeTruthy();
      expect(ariaDescribedBy).toContain('tooltip-');
    }));

    it('should have role="tooltip" on tooltip element', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip?.getAttribute('role')).toBe('tooltip');
    }));

    it('should remove aria-describedby when tooltip is hidden', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      buttonEl.triggerEventHandler('mouseleave', null);
      tick(300);

      const ariaDescribedBy = buttonEl.nativeElement.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toBeFalsy();
    }));
  });

  describe('tooltip positioning', () => {
    it('should add position class to tooltip', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip?.classList.contains('c-tooltip--top')).toBeTrue();
    }));
  });

  describe('tooltip arrow', () => {
    it('should have arrow element', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const arrow = document.querySelector('.c-tooltip__arrow');
      expect(arrow).toBeTruthy();
    }));
  });

  describe('visibility animation', () => {
    it('should add visible class after creation', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);
      tick(50); // Extra tick for requestAnimationFrame

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip?.classList.contains('c-tooltip--visible')).toBeTrue();
    }));
  });

  describe('cleanup on destroy', () => {
    it('should remove tooltip on destroy', fakeAsync(() => {
      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      fixture.destroy();

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeFalsy();
    }));
  });

  describe('empty tooltip text', () => {
    it('should not show tooltip if text is empty', fakeAsync(() => {
      const dynamicFixture = TestBed.createComponent(DynamicTestComponent);
      dynamicFixture.componentInstance.tooltipText.set('');
      dynamicFixture.detectChanges();

      const dynButtonEl = dynamicFixture.debugElement.query(By.css('button'));
      dynButtonEl.triggerEventHandler('mouseenter', null);
      tick(100);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeFalsy();
    }));
  });

  describe('dynamic tooltip content', () => {
    it('should use dynamic position', fakeAsync(() => {
      const dynamicFixture = TestBed.createComponent(DynamicTestComponent);
      dynamicFixture.detectChanges();

      const dynButtonEl = dynamicFixture.debugElement.query(By.css('button'));
      dynButtonEl.triggerEventHandler('mouseenter', null);
      tick(100);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip?.classList.contains('c-tooltip--bottom')).toBeTrue();
    }));

    it('should use dynamic text', fakeAsync(() => {
      const dynamicFixture = TestBed.createComponent(DynamicTestComponent);
      dynamicFixture.detectChanges();

      const dynButtonEl = dynamicFixture.debugElement.query(By.css('button'));
      dynButtonEl.triggerEventHandler('mouseenter', null);
      tick(100);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip?.textContent).toContain('Dynamic tooltip');
    }));
  });

  describe('tooltip positioning variants', () => {
    it('should position tooltip to the left', fakeAsync(() => {
      const dynamicFixture = TestBed.createComponent(DynamicTestComponent);
      dynamicFixture.componentInstance.position.set('left');
      dynamicFixture.detectChanges();

      const dynButtonEl = dynamicFixture.debugElement.query(By.css('button'));
      dynButtonEl.triggerEventHandler('mouseenter', null);
      tick(100);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip?.classList.contains('c-tooltip--left')).toBeTrue();
    }));

    it('should position tooltip to the right', fakeAsync(() => {
      const dynamicFixture = TestBed.createComponent(DynamicTestComponent);
      dynamicFixture.componentInstance.position.set('right');
      dynamicFixture.detectChanges();

      const dynButtonEl = dynamicFixture.debugElement.query(By.css('button'));
      dynButtonEl.triggerEventHandler('mouseenter', null);
      tick(100);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip?.classList.contains('c-tooltip--right')).toBeTrue();
    }));
  });

  describe('viewport boundary adjustments', () => {
    it('should adjust tooltip position if it goes beyond left viewport boundary', fakeAsync(() => {
      // Crear un mock donde el elemento está muy a la izquierda
      spyOn(buttonEl.nativeElement, 'getBoundingClientRect').and.returnValue({
        top: 100,
        bottom: 120,
        left: -50, // Fuera del viewport a la izquierda
        right: 0,
        width: 50,
        height: 20,
        x: -50,
        y: 100,
        toJSON: () => ({})
      } as DOMRect);

      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const tooltip = document.querySelector('.c-tooltip') as HTMLElement;
      expect(tooltip).toBeTruthy();
      // El tooltip debería ajustarse al OFFSET mínimo
      const leftStyle = tooltip?.style.left;
      expect(leftStyle).toBeTruthy();
    }));

    it('should adjust tooltip position if it goes beyond right viewport boundary', fakeAsync(() => {
      const viewportWidth = window.innerWidth;

      // Crear un mock donde el elemento está muy a la derecha
      spyOn(buttonEl.nativeElement, 'getBoundingClientRect').and.returnValue({
        top: 100,
        bottom: 120,
        left: viewportWidth - 20, // Muy cerca del borde derecho
        right: viewportWidth,
        width: 20,
        height: 20,
        x: viewportWidth - 20,
        y: 100,
        toJSON: () => ({})
      } as DOMRect);

      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeTruthy();
    }));

    it('should adjust tooltip position if it goes beyond top viewport boundary', fakeAsync(() => {
      // Crear un mock donde el elemento está muy arriba
      spyOn(buttonEl.nativeElement, 'getBoundingClientRect').and.returnValue({
        top: 5, // Muy arriba, cerca del borde superior
        bottom: 25,
        left: 100,
        right: 150,
        width: 50,
        height: 20,
        x: 100,
        y: 5,
        toJSON: () => ({})
      } as DOMRect);

      buttonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeTruthy();
    }));

    it('should adjust tooltip position if it goes beyond bottom viewport boundary', fakeAsync(() => {
      const viewportHeight = window.innerHeight;

      // Cambiar la posición del tooltip a bottom para que intente ir más abajo
      const dynamicFixture = TestBed.createComponent(DynamicTestComponent);
      dynamicFixture.componentInstance.position.set('bottom');
      dynamicFixture.detectChanges();

      const dynButtonEl = dynamicFixture.debugElement.query(By.css('button'));

      // Crear un mock donde el elemento está muy abajo
      spyOn(dynButtonEl.nativeElement, 'getBoundingClientRect').and.returnValue({
        top: viewportHeight - 30,
        bottom: viewportHeight - 10,
        left: 100,
        right: 150,
        width: 50,
        height: 20,
        x: 100,
        y: viewportHeight - 30,
        toJSON: () => ({})
      } as DOMRect);

      dynButtonEl.triggerEventHandler('mouseenter', null);
      tick(100);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.classList.contains('c-tooltip--bottom')).toBeTrue();
    }));
  });

  describe('SSR compatibility', () => {
    it('should not show tooltip in non-browser environment', fakeAsync(() => {
      // Crear un TestBed específico con PLATFORM_ID de servidor
      TestBed.resetTestingModule();

      TestBed.configureTestingModule({
        imports: [TestComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const ssrFixture = TestBed.createComponent(TestComponent);
      ssrFixture.detectChanges();

      const ssrButtonEl = ssrFixture.debugElement.query(By.css('button'));

      ssrButtonEl.triggerEventHandler('mouseenter', null);
      tick(150);

      const tooltip = document.querySelector('.c-tooltip');
      expect(tooltip).toBeFalsy();
    }));
  });
});
