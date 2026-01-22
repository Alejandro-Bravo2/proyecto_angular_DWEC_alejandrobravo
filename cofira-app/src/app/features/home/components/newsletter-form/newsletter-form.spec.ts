import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { NewsletterForm } from './newsletter-form';

describe('NewsletterForm', () => {
  let component: NewsletterForm;
  let fixture: ComponentFixture<NewsletterForm>;
  let compiled: HTMLElement;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    mockRouter.createUrlTree.and.returnValue({} as any);
    mockRouter.serializeUrl.and.returnValue('/');
    (mockRouter as any).events = of();

    mockActivatedRoute = {
      snapshot: { params: {}, queryParams: {} },
      params: of({}),
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [NewsletterForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsletterForm);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  describe('Creación del componente', () => {
    it('debería crear el componente correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería ser un componente standalone', () => {
      const componentMetadata = (NewsletterForm as any).ɵcmp;
      expect(componentMetadata.standalone).toBe(true);
    });
  });

  describe('Renderizado de la plantilla', () => {
    it('debería renderizar la sección del formulario de newsletter', () => {
      const newsletterSection = compiled.querySelector('.newsletter-form');
      expect(newsletterSection).toBeTruthy();
    });

    it('debería renderizar el contenedor de contenido', () => {
      const content = compiled.querySelector('.newsletter-form__content');
      expect(content).toBeTruthy();
    });

    it('debería renderizar el formulario', () => {
      const form = compiled.querySelector('.newsletter-form__form');
      expect(form).toBeTruthy();
    });

    it('el formulario debería tener la clase c-form', () => {
      const form = compiled.querySelector('form');
      expect(form?.classList.contains('c-form')).toBe(true);
    });
  });

  describe('Contenido de texto', () => {
    it('debería mostrar el título del formulario', () => {
      const heading = compiled.querySelector('.newsletter-form__content h2');
      expect(heading?.textContent).toContain('¿Quieres estar al tanto de todas las noticias?');
    });

    it('debería mostrar el párrafo descriptivo', () => {
      const paragraph = compiled.querySelector('.newsletter-form__content p');
      expect(paragraph?.textContent).toContain('Suscríbete a nuestra newsletter');
    });

    it('el párrafo debería mencionar "últimas novedades y consejos"', () => {
      const paragraph = compiled.querySelector('.newsletter-form__content p');
      expect(paragraph?.textContent).toContain('últimas novedades y consejos');
    });
  });

  describe('Campos del formulario', () => {
    it('debería tener exactamente 3 grupos de formulario', () => {
      const formGroups = compiled.querySelectorAll('.c-form__group');
      expect(formGroups.length).toBe(3);
    });

    describe('Campo Nombre', () => {
      let nameInput: HTMLInputElement | null;
      let nameLabel: HTMLLabelElement | null;

      beforeEach(() => {
        nameInput = compiled.querySelector('#name') as HTMLInputElement;
        nameLabel = compiled.querySelector('label[for="name"]') as HTMLLabelElement;
      });

      it('debería existir el campo de nombre', () => {
        expect(nameInput).toBeTruthy();
      });

      it('debería tener la etiqueta "Nombre"', () => {
        expect(nameLabel?.textContent).toBe('Nombre');
      });

      it('debería tener el tipo "text"', () => {
        expect(nameInput?.type).toBe('text');
      });

      it('debería tener el placeholder "Tu nombre"', () => {
        expect(nameInput?.placeholder).toBe('Tu nombre');
      });

      it('debería tener la clase c-form__input', () => {
        expect(nameInput?.classList.contains('c-form__input')).toBe(true);
      });

      it('debería tener el id correcto vinculado al label', () => {
        expect(nameInput?.id).toBe('name');
        expect(nameLabel?.htmlFor).toBe('name');
      });
    });

    describe('Campo Apellido', () => {
      let lastNameInput: HTMLInputElement | null;
      let lastNameLabel: HTMLLabelElement | null;

      beforeEach(() => {
        lastNameInput = compiled.querySelector('#lastName') as HTMLInputElement;
        lastNameLabel = compiled.querySelector('label[for="lastName"]') as HTMLLabelElement;
      });

      it('debería existir el campo de apellido', () => {
        expect(lastNameInput).toBeTruthy();
      });

      it('debería tener la etiqueta "Apellido"', () => {
        expect(lastNameLabel?.textContent).toBe('Apellido');
      });

      it('debería tener el tipo "text"', () => {
        expect(lastNameInput?.type).toBe('text');
      });

      it('debería tener el placeholder "Tu apellido"', () => {
        expect(lastNameInput?.placeholder).toBe('Tu apellido');
      });

      it('debería tener la clase c-form__input', () => {
        expect(lastNameInput?.classList.contains('c-form__input')).toBe(true);
      });

      it('debería tener el id correcto vinculado al label', () => {
        expect(lastNameInput?.id).toBe('lastName');
        expect(lastNameLabel?.htmlFor).toBe('lastName');
      });
    });

    describe('Campo Email', () => {
      let emailInput: HTMLInputElement | null;
      let emailLabel: HTMLLabelElement | null;

      beforeEach(() => {
        emailInput = compiled.querySelector('#email') as HTMLInputElement;
        emailLabel = compiled.querySelector('label[for="email"]') as HTMLLabelElement;
      });

      it('debería existir el campo de email', () => {
        expect(emailInput).toBeTruthy();
      });

      it('debería tener la etiqueta "Email"', () => {
        expect(emailLabel?.textContent).toBe('Email');
      });

      it('debería tener el tipo "email"', () => {
        expect(emailInput?.type).toBe('email');
      });

      it('debería tener el placeholder correcto', () => {
        expect(emailInput?.placeholder).toBe('tu.email@ejemplo.com');
      });

      it('debería tener la clase c-form__input', () => {
        expect(emailInput?.classList.contains('c-form__input')).toBe(true);
      });

      it('debería tener el id correcto vinculado al label', () => {
        expect(emailInput?.id).toBe('email');
        expect(emailLabel?.htmlFor).toBe('email');
      });
    });
  });

  describe('Botón de envío', () => {
    let submitButton: HTMLButtonElement | null;

    beforeEach(() => {
      submitButton = compiled.querySelector('.newsletter-form__submit-button') as HTMLButtonElement;
    });

    it('debería existir el botón de envío', () => {
      expect(submitButton).toBeTruthy();
    });

    it('debería tener el tipo "submit"', () => {
      expect(submitButton?.type).toBe('submit');
    });

    it('debería tener el texto "Enviar"', () => {
      expect(submitButton?.textContent?.trim()).toBe('Enviar');
    });

    it('debería tener las clases correctas', () => {
      expect(submitButton?.classList.contains('c-button')).toBe(true);
      expect(submitButton?.classList.contains('c-button--primary')).toBe(true);
      expect(submitButton?.classList.contains('c-button--large')).toBe(true);
    });
  });

  describe('Estructura HTML semántica', () => {
    it('debería usar section como elemento principal', () => {
      const newsletterSection = compiled.querySelector('.newsletter-form');
      expect(newsletterSection?.tagName.toLowerCase()).toBe('section');
    });

    it('debería usar section para el contenedor de contenido', () => {
      const content = compiled.querySelector('.newsletter-form__content');
      expect(content?.tagName.toLowerCase()).toBe('section');
    });

    it('debería usar h2 para el título', () => {
      const heading = compiled.querySelector('.newsletter-form__content h2');
      expect(heading?.tagName.toLowerCase()).toBe('h2');
    });

    it('debería usar form como elemento del formulario', () => {
      const form = compiled.querySelector('.newsletter-form__form');
      expect(form?.tagName.toLowerCase()).toBe('form');
    });

    it('debería usar section para cada grupo de formulario', () => {
      const formGroups = compiled.querySelectorAll('.c-form__group');
      formGroups.forEach(group => {
        expect(group.tagName.toLowerCase()).toBe('section');
      });
    });

    it('cada campo debería tener un label asociado', () => {
      const inputs = compiled.querySelectorAll('.c-form__input');
      inputs.forEach(input => {
        const inputId = input.getAttribute('id');
        const label = compiled.querySelector(`label[for="${inputId}"]`);
        expect(label).toBeTruthy(`No se encontró label para input con id: ${inputId}`);
      });
    });
  });

  describe('Clases BEM', () => {
    it('todas las clases deberían seguir la convención BEM', () => {
      const bemElements = [
        '.newsletter-form',
        '.newsletter-form__content',
        '.newsletter-form__form',
        '.newsletter-form__submit-button'
      ];

      bemElements.forEach(selector => {
        const element = compiled.querySelector(selector);
        expect(element).toBeTruthy(`${selector} no encontrado`);
      });
    });

    it('las clases del sistema de formularios deberían usar el prefijo c-', () => {
      const systemClasses = [
        '.c-form',
        '.c-form__group',
        '.c-form__label',
        '.c-form__input',
        '.c-button',
        '.c-button--primary',
        '.c-button--large'
      ];

      systemClasses.forEach(selector => {
        const element = compiled.querySelector(selector);
        expect(element).toBeTruthy(`${selector} no encontrado`);
      });
    });
  });

  describe('Accesibilidad', () => {
    it('cada input debería tener un id único', () => {
      const inputs = compiled.querySelectorAll('.c-form__input');
      const ids = Array.from(inputs).map(input => input.getAttribute('id'));
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it('cada label debería estar asociado correctamente con su input', () => {
      const labels = compiled.querySelectorAll('.c-form__label');
      labels.forEach(label => {
        const forAttribute = label.getAttribute('for');
        const input = compiled.querySelector(`#${forAttribute}`);
        expect(input).toBeTruthy(`Input con id ${forAttribute} no encontrado`);
      });
    });

    it('los inputs deberían tener placeholders descriptivos', () => {
      const nameInput = compiled.querySelector('#name') as HTMLInputElement;
      const lastNameInput = compiled.querySelector('#lastName') as HTMLInputElement;
      const emailInput = compiled.querySelector('#email') as HTMLInputElement;

      expect(nameInput?.placeholder).toBeTruthy();
      expect(lastNameInput?.placeholder).toBeTruthy();
      expect(emailInput?.placeholder).toBeTruthy();
    });

    it('el botón de envío debería ser un button element', () => {
      const submitButton = compiled.querySelector('.newsletter-form__submit-button');
      expect(submitButton?.tagName.toLowerCase()).toBe('button');
    });
  });

  describe('Interacción con el formulario', () => {
    it('el campo nombre debería aceptar entrada de texto', () => {
      const nameInput = compiled.querySelector('#name') as HTMLInputElement;
      const testValue = 'Juan';

      nameInput.value = testValue;
      nameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(nameInput.value).toBe(testValue);
    });

    it('el campo apellido debería aceptar entrada de texto', () => {
      const lastNameInput = compiled.querySelector('#lastName') as HTMLInputElement;
      const testValue = 'Pérez';

      lastNameInput.value = testValue;
      lastNameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(lastNameInput.value).toBe(testValue);
    });

    it('el campo email debería aceptar entrada de texto', () => {
      const emailInput = compiled.querySelector('#email') as HTMLInputElement;
      const testValue = 'juan.perez@ejemplo.com';

      emailInput.value = testValue;
      emailInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(emailInput.value).toBe(testValue);
    });

    it('debería poder limpiar los valores de los campos', () => {
      const nameInput = compiled.querySelector('#name') as HTMLInputElement;
      const lastNameInput = compiled.querySelector('#lastName') as HTMLInputElement;
      const emailInput = compiled.querySelector('#email') as HTMLInputElement;

      nameInput.value = 'Juan';
      lastNameInput.value = 'Pérez';
      emailInput.value = 'test@test.com';

      nameInput.value = '';
      lastNameInput.value = '';
      emailInput.value = '';

      expect(nameInput.value).toBe('');
      expect(lastNameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });
  });

  describe('Validación de tipos de input', () => {
    it('el campo email debería tener validación HTML5 de tipo email', () => {
      const emailInput = compiled.querySelector('#email') as HTMLInputElement;
      expect(emailInput?.type).toBe('email');
    });

    it('los campos de texto deberían tener tipo text', () => {
      const nameInput = compiled.querySelector('#name') as HTMLInputElement;
      const lastNameInput = compiled.querySelector('#lastName') as HTMLInputElement;

      expect(nameInput?.type).toBe('text');
      expect(lastNameInput?.type).toBe('text');
    });
  });

  describe('Orden de los campos', () => {
    it('los campos deberían aparecer en el orden: nombre, apellido, email', () => {
      const formGroups = Array.from(compiled.querySelectorAll('.c-form__group'));
      const labels = formGroups.map(group =>
        group.querySelector('.c-form__label')?.textContent?.trim()
      );

      expect(labels[0]).toBe('Nombre');
      expect(labels[1]).toBe('Apellido');
      expect(labels[2]).toBe('Email');
    });

    it('el botón de envío debería ser el último elemento del formulario', () => {
      const form = compiled.querySelector('.newsletter-form__form');
      const lastChild = form?.lastElementChild;

      expect(lastChild?.classList.contains('newsletter-form__submit-button')).toBe(true);
    });
  });

  describe('Renderizado sin errores', () => {
    it('debería renderizar completamente sin errores', () => {
      expect(compiled.querySelector('.newsletter-form')).toBeTruthy();
      expect(compiled.querySelector('.newsletter-form__form')).toBeTruthy();
      expect(compiled.querySelectorAll('.c-form__input').length).toBe(3);
    });

    it('debería mantener la estructura después de múltiples detectChanges', () => {
      fixture.detectChanges();
      fixture.detectChanges();
      fixture.detectChanges();

      const form = compiled.querySelector('.newsletter-form__form');
      const inputs = compiled.querySelectorAll('.c-form__input');
      const button = compiled.querySelector('.newsletter-form__submit-button');

      expect(form).toBeTruthy();
      expect(inputs.length).toBe(3);
      expect(button).toBeTruthy();
    });
  });

  describe('Estilos y clases CSS', () => {
    it('el formulario debería tener múltiples clases aplicadas', () => {
      const form = compiled.querySelector('.newsletter-form__form');
      expect(form?.classList.contains('c-form')).toBe(true);
      expect(form?.classList.contains('newsletter-form__form')).toBe(true);
    });

    it('el botón debería tener múltiples modificadores', () => {
      const button = compiled.querySelector('.newsletter-form__submit-button');
      expect(button?.classList.length).toBeGreaterThan(1);
      expect(button?.classList.contains('c-button--primary')).toBe(true);
      expect(button?.classList.contains('c-button--large')).toBe(true);
    });

    it('todos los inputs deberían tener la misma clase base', () => {
      const inputs = compiled.querySelectorAll('.c-form__input');
      inputs.forEach(input => {
        expect(input.classList.contains('c-form__input')).toBe(true);
      });
    });

    it('todos los labels deberían tener la misma clase base', () => {
      const labels = compiled.querySelectorAll('.c-form__label');
      labels.forEach(label => {
        expect(label.classList.contains('c-form__label')).toBe(true);
      });
    });
  });
});
