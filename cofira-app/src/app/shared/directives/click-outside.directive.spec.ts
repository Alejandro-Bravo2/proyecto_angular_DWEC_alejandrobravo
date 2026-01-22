import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutsideDirective } from './click-outside.directive';

// Componente de prueba que usa la directiva
@Component({
  template: `
    <section class="container">
      <article class="dropdown" (appClickOutside)="onClickOutside()">
        <button class="dropdown__trigger">Abrir</button>
        <ul class="dropdown__menu">
          <li class="dropdown__item">Opción 1</li>
          <li class="dropdown__item">Opción 2</li>
        </ul>
      </article>
      <aside class="outside-element">Elemento externo</aside>
    </section>
  `,
  standalone: true,
  imports: [ClickOutsideDirective],
})
class TestHostComponent {
  clickOutsideCount = 0;

  onClickOutside(): void {
    this.clickOutsideCount++;
  }
}

describe('ClickOutsideDirective', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let directiveEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    directiveEl = fixture.debugElement.query(By.directive(ClickOutsideDirective));
  });

  it('should create the directive', () => {
    expect(directiveEl).toBeTruthy();
  });

  describe('click detection', () => {
    it('should not emit when clicking inside the element', () => {
      const dropdownElement = fixture.debugElement.query(By.css('.dropdown__trigger'));
      dropdownElement.nativeElement.click();

      expect(component.clickOutsideCount).toBe(0);
    });

    it('should not emit when clicking on child elements', () => {
      const menuItem = fixture.debugElement.query(By.css('.dropdown__item'));
      menuItem.nativeElement.click();

      expect(component.clickOutsideCount).toBe(0);
    });

    it('should emit when clicking outside the element', () => {
      const outsideElement = fixture.debugElement.query(By.css('.outside-element'));
      outsideElement.nativeElement.click();

      expect(component.clickOutsideCount).toBe(1);
    });

    it('should emit when clicking on the document body', () => {
      document.body.click();

      expect(component.clickOutsideCount).toBe(1);
    });

    it('should emit multiple times for multiple outside clicks', () => {
      const outsideElement = fixture.debugElement.query(By.css('.outside-element'));

      outsideElement.nativeElement.click();
      expect(component.clickOutsideCount).toBe(1);

      outsideElement.nativeElement.click();
      expect(component.clickOutsideCount).toBe(2);

      document.body.click();
      expect(component.clickOutsideCount).toBe(3);
    });

    it('should not emit for clicks inside followed by outside', () => {
      const trigger = fixture.debugElement.query(By.css('.dropdown__trigger'));
      const outsideElement = fixture.debugElement.query(By.css('.outside-element'));

      trigger.nativeElement.click();
      expect(component.clickOutsideCount).toBe(0);

      outsideElement.nativeElement.click();
      expect(component.clickOutsideCount).toBe(1);
    });
  });

  describe('event handling', () => {
    it('should handle click event with proper target', () => {
      const directive = directiveEl.injector.get(ClickOutsideDirective);
      const mockEvent = new MouseEvent('click', { bubbles: true });

      // Simular click fuera
      Object.defineProperty(mockEvent, 'target', {
        value: document.body,
        writable: false,
      });

      directive.onClick(mockEvent);
      expect(component.clickOutsideCount).toBe(1);
    });

    it('should handle click event with null target gracefully', () => {
      const directive = directiveEl.injector.get(ClickOutsideDirective);
      const mockEvent = new MouseEvent('click', { bubbles: true });

      // Simular evento con target null
      Object.defineProperty(mockEvent, 'target', {
        value: null,
        writable: false,
      });

      // No debe lanzar error ni emitir
      expect(() => directive.onClick(mockEvent)).not.toThrow();
      expect(component.clickOutsideCount).toBe(0);
    });
  });

  describe('multiple instances', () => {
    it('should handle multiple directives independently', () => {
      @Component({
        template: `
          <article class="dropdown-1" (appClickOutside)="clicked1()">
            <span class="content-1">Dropdown 1</span>
          </article>
          <article class="dropdown-2" (appClickOutside)="clicked2()">
            <span class="content-2">Dropdown 2</span>
          </article>
          <aside class="outside">Fuera</aside>
        `,
        standalone: true,
        imports: [ClickOutsideDirective],
      })
      class MultipleDirectivesComponent {
        count1 = 0;
        count2 = 0;
        clicked1(): void {
          this.count1++;
        }
        clicked2(): void {
          this.count2++;
        }
      }

      const multiFixture = TestBed.createComponent(MultipleDirectivesComponent);
      const multiComponent = multiFixture.componentInstance;
      multiFixture.detectChanges();

      // Click en dropdown 1 - solo dropdown 2 debe emitir
      const content1 = multiFixture.debugElement.query(By.css('.content-1'));
      content1.nativeElement.click();
      expect(multiComponent.count1).toBe(0);
      expect(multiComponent.count2).toBe(1);

      // Click en dropdown 2 - solo dropdown 1 debe emitir
      const content2 = multiFixture.debugElement.query(By.css('.content-2'));
      content2.nativeElement.click();
      expect(multiComponent.count1).toBe(1);
      expect(multiComponent.count2).toBe(1);

      // Click fuera de ambos - ambos deben emitir
      const outside = multiFixture.debugElement.query(By.css('.outside'));
      outside.nativeElement.click();
      expect(multiComponent.count1).toBe(2);
      expect(multiComponent.count2).toBe(2);

      multiFixture.destroy();
    });
  });

  describe('integration with dropdown pattern', () => {
    it('should work with typical dropdown close pattern', () => {
      @Component({
        template: `
          @if (isOpen) {
            <article class="dropdown" (appClickOutside)="closeDropdown()">
              <ul class="dropdown__menu">
                <li>Item 1</li>
              </ul>
            </article>
          }
          <button class="open-btn" (click)="openDropdown()">Abrir</button>
        `,
        standalone: true,
        imports: [ClickOutsideDirective],
      })
      class DropdownComponent {
        isOpen = false;
        openDropdown(): void {
          this.isOpen = true;
        }
        closeDropdown(): void {
          this.isOpen = false;
        }
      }

      const dropdownFixture = TestBed.createComponent(DropdownComponent);
      const dropdownComponent = dropdownFixture.componentInstance;
      dropdownFixture.detectChanges();

      // Dropdown cerrado inicialmente
      expect(dropdownComponent.isOpen).toBe(false);

      // Abrir dropdown
      const openBtn = dropdownFixture.debugElement.query(By.css('.open-btn'));
      openBtn.nativeElement.click();
      dropdownFixture.detectChanges();
      expect(dropdownComponent.isOpen).toBe(true);

      // Click fuera debe cerrar
      document.body.click();
      dropdownFixture.detectChanges();
      expect(dropdownComponent.isOpen).toBe(false);

      dropdownFixture.destroy();
    });
  });
});
