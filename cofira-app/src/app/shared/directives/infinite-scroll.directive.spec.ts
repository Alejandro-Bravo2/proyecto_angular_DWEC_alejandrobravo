import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InfiniteScrollDirective } from './infinite-scroll.directive';

// Mock de IntersectionObserver para tests
class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;
  private elements: Element[] = [];
  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.elements.push(element);
  }

  unobserve(element: Element): void {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
    }
  }

  disconnect(): void {
    this.elements = [];
  }

  // Método para simular intersección en tests
  simulateIntersection(isIntersecting: boolean): void {
    const entries: IntersectionObserverEntry[] = this.elements.map(element => ({
      target: element,
      isIntersecting,
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 0.5 : 0,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    }));
    this.callback(entries, this as unknown as IntersectionObserver);
  }

  static clearInstances(): void {
    MockIntersectionObserver.instances = [];
  }
}

// Componente de prueba que usa la directiva
@Component({
  template: `
    <section class="container">
      <ul class="list">
        @for (item of items; track item) {
          <li>{{ item }}</li>
        }
      </ul>
      <aside
        class="sentinel"
        appInfiniteScroll
        (scrolled)="onScrolled()"
      ></aside>
    </section>
  `,
  standalone: true,
  imports: [InfiniteScrollDirective],
})
class TestHostComponent {
  items = ['Item 1', 'Item 2', 'Item 3'];
  scrolledCount = 0;

  onScrolled(): void {
    this.scrolledCount++;
  }
}

describe('InfiniteScrollDirective', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let directiveEl: DebugElement;
  let originalIntersectionObserver: typeof IntersectionObserver;

  beforeEach(() => {
    // Guardar el IntersectionObserver original
    originalIntersectionObserver = window.IntersectionObserver;

    // Reemplazar con el mock
    (window as any).IntersectionObserver = MockIntersectionObserver;
    MockIntersectionObserver.clearInstances();

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    directiveEl = fixture.debugElement.query(By.directive(InfiniteScrollDirective));
  });

  afterEach(() => {
    // Restaurar el IntersectionObserver original
    window.IntersectionObserver = originalIntersectionObserver;
    MockIntersectionObserver.clearInstances();
  });

  it('should create the directive', () => {
    expect(directiveEl).toBeTruthy();
  });

  it('should create an IntersectionObserver on init', () => {
    expect(MockIntersectionObserver.instances.length).toBe(1);
  });

  it('should observe the element', () => {
    const observer = MockIntersectionObserver.instances[0];
    expect(observer['elements'].length).toBe(1);
    expect(observer['elements'][0]).toBe(directiveEl.nativeElement);
  });

  describe('scrolled output', () => {
    it('should emit scrolled event when element intersects', fakeAsync(() => {
      const observer = MockIntersectionObserver.instances[0];
      expect(component.scrolledCount).toBe(0);

      observer.simulateIntersection(true);
      tick();

      expect(component.scrolledCount).toBe(1);
    }));

    it('should not emit scrolled event when element does not intersect', fakeAsync(() => {
      const observer = MockIntersectionObserver.instances[0];
      expect(component.scrolledCount).toBe(0);

      observer.simulateIntersection(false);
      tick();

      expect(component.scrolledCount).toBe(0);
    }));

    it('should emit multiple times on multiple intersections', fakeAsync(() => {
      const observer = MockIntersectionObserver.instances[0];

      observer.simulateIntersection(true);
      tick();
      expect(component.scrolledCount).toBe(1);

      observer.simulateIntersection(false);
      tick();
      expect(component.scrolledCount).toBe(1);

      observer.simulateIntersection(true);
      tick();
      expect(component.scrolledCount).toBe(2);
    }));
  });

  describe('cleanup', () => {
    it('should disconnect observer on destroy', () => {
      const observer = MockIntersectionObserver.instances[0];
      const disconnectSpy = spyOn(observer, 'disconnect').and.callThrough();

      fixture.destroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should prevent memory leaks by clearing elements on destroy', () => {
      const observer = MockIntersectionObserver.instances[0];
      expect(observer['elements'].length).toBe(1);

      fixture.destroy();

      expect(observer['elements'].length).toBe(0);
    });
  });

  describe('multiple instances', () => {
    it('should handle multiple directives independently', () => {
      @Component({
        template: `
          <aside class="sentinel-1" appInfiniteScroll (scrolled)="scrolled1()"></aside>
          <aside class="sentinel-2" appInfiniteScroll (scrolled)="scrolled2()"></aside>
        `,
        standalone: true,
        imports: [InfiniteScrollDirective],
      })
      class MultipleDirectivesComponent {
        count1 = 0;
        count2 = 0;
        scrolled1(): void {
          this.count1++;
        }
        scrolled2(): void {
          this.count2++;
        }
      }

      const multiFixture = TestBed.createComponent(MultipleDirectivesComponent);
      const multiComponent = multiFixture.componentInstance;
      multiFixture.detectChanges();

      // Debe haber 3 observers (1 del test anterior + 2 nuevos)
      expect(MockIntersectionObserver.instances.length).toBe(3);

      const observer1 = MockIntersectionObserver.instances[1];
      const observer2 = MockIntersectionObserver.instances[2];

      observer1.simulateIntersection(true);
      expect(multiComponent.count1).toBe(1);
      expect(multiComponent.count2).toBe(0);

      observer2.simulateIntersection(true);
      expect(multiComponent.count1).toBe(1);
      expect(multiComponent.count2).toBe(1);

      multiFixture.destroy();
    });
  });
});
