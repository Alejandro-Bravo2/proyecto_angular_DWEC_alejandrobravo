FASE 3: FORMULARIOS REACTIVOS AVANZADOS¶
Criterios: RA6.d, RA6.e, RA6.h

Entrega: 18 de diciembre (paralela a DIW Fases 1-2-3)

Objetivos:

Implementar formularios reactivos con validación completa, tanto síncrona como asíncrona. Los formularios funcionan con los componentes de formulario que estás creando en DIW.

Tarea 1: Formularios reactivos básicos¶
Los formularios reactivos usan FormBuilder para declarar FormGroup y FormControl programáticamente, con validadores síncronos integrados que actualizan errors reactivamente. Esta aproximación facilita testing, validación dinámica y reutilización vs template-driven forms.

Implementar FormBuilder en todos los formularios¶
Importa ReactiveFormsModule en app.config.ts y usa FormBuilder inyectado para crear grupos.

// user-form.component.ts
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ...],
  template: `...`
})
export class UserFormComponent {
  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: [0, [Validators.required, Validators.min(18), Validators.max(100)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]]
    });
  }
}
FormGroup y FormControl para cada campo¶
FormGroup agrupa controles relacionados; accede con get('field') o controls.field. Usa valueChanges para validaciones dinámicas.

Template con bindings reactivos:

<form [formGroup]="userForm" (ngSubmit)="onSubmit()">
  <input formControlName="name" placeholder="Nombre">
  <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="error">
    Nombre requerido (mín 2 caracteres)
  </div>

  <input formControlName="email" type="email" placeholder="Email">
  <div *ngIf="userForm.get('email')?.errors?.['email']" class="error">
    Email inválido
  </div>

  <button [disabled]="userForm.invalid">Guardar</button>
</form>
Validadores síncronos integrados (required, minLength, email, pattern)¶
Angular provee validadores built-in que retornan null (válido) o error object

Validador	Uso	Error retornado angular​
required	['', Validators.required]	{required: true}
minLength(3)	Validators.minLength(3)	{minlength: {requiredLength: 3, actualLength: 1}}
email	Validators.email	{email: true}
pattern(/regex/)	Validators.pattern(/^abc$/	{pattern: {requiredPattern: '^abc$', actualValue: 'def'}}
min(18)	Validators.min(18)	{min: {min: 18, actual: 16}}
Helpers de conveniencia:

getErrorMessage(controlName: string): string {
  const control = this.userForm.get(controlName);
  if (control?.errors?.['required']) return `${controlName} es requerido`;
  if (control?.errors?.['email']) return 'Email inválido';
  if (control?.errors?.['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
  return '';
}
⁂
Tarea 2: Validadores personalizados¶
Los validadores personalizados son funciones que reciben AbstractControl y retornan null (válido) o {error: any}. Se aplican a controles individuales o grupos con cross-field validation, integrándose reactivamente con FormBuilder.

Validador de contraseña fuerte¶
Valida longitud, mayúsculas, números y caracteres especiales.

// validators/password-strength.validator.ts
export function passwordStrength(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const minLength = value.length >= 12;

    const errors: ValidationErrors = {};
    if (!hasUpper) errors.noUppercase = true;
    if (!hasLower) errors.noLowercase = true;
    if (!hasNumber) errors.noNumber = true;
    if (!hasSpecial) errors.noSpecial = true;
    if (!minLength) errors.minLength = true;

    return Object.keys(errors).length ? errors : null;
  };
}
Validador de confirmación de contraseña¶
Cross-field validation a nivel FormGroup.

export function passwordMatch(controlName: string, matchControlName: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const matchControl = group.get(matchControlName);

    if (!control || !matchControl) return null;
    if (matchControl.errors && !matchControl.touched) return null;

    return control.value === matchControl.value ? null : { mismatch: true };
  };
}
Validador de formato personalizado (NIF, teléfono, código postal)¶
// validators/spanish-formats.validator.ts
export function nif(): ValidatorFn {
  return (control): ValidationErrors | null => {
    const nif = control.value?.toUpperCase();
    const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBCSQVJHZTKB]$/;
    if (!nifRegex.test(nif)) return { invalidNif: true };

    const letters = 'TRWAGMYFPDXBCSQVJHZTKB';
    const position = parseInt(nif.substring(0, 8)) % 23;
    return letters[position] === nif[8] ? null : { invalidNif: true };
  };
}

export function telefono(): ValidatorFn {
  return (control): ValidationErrors | null => {
    return /^(6|7)[0-9]{8}$/.test(control.value) ? null : { invalidTelefono: true };
  };
}

export function codigoPostal(): ValidatorFn {
  return (control): ValidationErrors | null => {
    return /^\d{5}$/.test(control.value) ? null : { invalidCP: true };
  };
}
Uso en FormBuilder
// user-form.component.ts
this.userForm = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  nif: ['', [Validators.required, nif()]],
  telefono: ['', telefono()],
  cp: ['', codigoPostal()],
  password: ['', [Validators.required, passwordStrength()]],
  confirmPassword: ['', Validators.required]
}, { validators: passwordMatch('password', 'confirmPassword') });
Template con mensajes específicos:

<input formControlName="password">
<div *ngIf="userForm.get('password')?.errors?.['noUppercase']" class="error">
  Debe contener mayúsculas
</div>
<div *ngIf="userForm.get('confirmPassword')?.errors?.['mismatch']" class="error">
  Las contraseñas no coinciden
</div>

<input formControlName="nif">
<div *ngIf="userForm.get('nif')?.errors?.['invalidNif']" class="error">
  NIF inválido (formato: 12345678Z)
</div>
Tipo Validador	Aplicación	Ejemplo Error angular​
Síncrono individual	control: FormControl	{noUppercase: true}
Cross-field	group: FormGroup	{mismatch: true}
Multiple errores	Object con keys	{noNumber: true, minLength: true}
Regex español	NIF, teléfono	{invalidNif: true}
Helpers para templates:

getPasswordErrors(): string[] {
  const errors = this.userForm.get('password')?.errors;
  return errors ? Object.keys(errors) : [];
}
<div *ngFor="let error of getPasswordErrors()" class="error">
  {{ getErrorMessage(error) }}
</div>
Validadores a nivel de formulario (cross-field validation)¶
Los validadores cross-field se aplican al FormGroup entero, accediendo múltiples controles para validaciones como suma mínima, rangos dependientes o combinaciones lógicas. Se declaran en el segundo parámetro de fb.group() como { validators: [miValidador()] }.

Implementación Cross-Field Validation¶
// validators/cross-field.validators.ts
export function totalMinimo(min: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const price = group.get('price')?.value;
    const quantity = group.get('quantity')?.value;

    return (price * quantity >= min) ? null : { totalMinimo: { min, actual: price * quantity } };
  };
}

export function edadMayor(controlName: string, minAgeControl: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(controlName);
    const ageControl = group.get(minAgeControl);

    if (!control?.value || !ageControl?.value) return null;
    return parseInt(control.value) > parseInt(ageControl.value) ? null : { edadMenor: true };
  };
}

export function atLeastOneRequired(...fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const hasOne = fields.some(field => !!group.get(field)?.value);
    return hasOne ? null : { atLeastOneRequired: { fields } };
  };
}
Uso Completo en FormBuilder

// order-form.component.ts
this.orderForm = this.fb.group({
  price: [0, [Validators.required, Validators.min(0)]],
  quantity: [1, [Validators.required, Validators.min(1)]],
  discount: [0],
  birthdate: ['', Validators.required],
  minAge: [18],
  phone: [''],
  email: ['']
}, {
  validators: [
    totalMinimo(100),                    // Precio total >= 100€
    edadMayor('birthdate', 'minAge'),    // Fecha nacimiento > edad mínima
    atLeastOneRequired('phone', 'email') // Al menos teléfono o email
  ]
});
Template con Errores Cross-Field

<form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
  <input formControlName="price" type="number">
  <input formControlName="quantity" type="number">

  <div *ngIf="orderForm.errors?.['totalMinimo']" class="error">
    Total mínimo: {{ orderForm.errors['totalMinimo'].min }}€ 
    (actual: {{ orderForm.errors['totalMinimo'].actual | currency }})
  </div>

  <input formControlName="birthdate" type="date">
  <input formControlName="minAge" type="number">
  <div *ngIf="orderForm.errors?.['edadMenor']" class="error">
    Fecha de nacimiento debe ser anterior a edad mínima
  </div>

  <input formControlName="phone" placeholder="Teléfono">
  <input formControlName="email" type="email">
  <div *ngIf="orderForm.errors?.['atLeastOneRequired']" class="error">
    Complete al menos teléfono o email
  </div>
</form>
Casos Avanzados y Helpers¶
Helper para múltiples errores cross-field:

getFormErrors(): { key: string, message: string }[] {
  return Object.entries(this.orderForm.errors || {})
    .map(([key, error]) => ({ key, message: this.getCrossFieldMessage(key, error) }));
}
Tipo Cross-Field	Ejemplo	Error Object angular​
Cálculo combinado	price * quantity >= 100	{totalMinimo: {min: 100, actual: 50}}
Comparación campos	birthdate < minAge	{edadMenor: true}
Condición OR	`phone	
Rango dependiente	endDate > startDate	{invalidRange: true}
Validación dinámica (al tocar campos relevantes):

<div *ngIf="orderForm.errors && (orderForm.get('price')?.touched || orderForm.get('quantity')?.touched)">
  <!-- Muestra errores solo tras tocar campos relevantes -->
</div>
⁂
Tarea 3: Validadores Asíncronos en Angular¶
Los validadores asíncronos retornan Observable<ValidationErrors | null>, Promise<ValidationErrors | null> o AsyncValidatorFn. Se ejecutan tras validadores síncronos, ideales para consultas API con debounce para optimizar llamadas.[1][2]

Validador de Email Único (Simular API)¶
// validators/async.validators.ts
export function emailUnique(userId?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return timer(500).pipe( // Simula debounce + delay API
      switchMap(() => 
        this.http.get<boolean>(`/api/users/email-exists/${control.value}?userId=${userId || ''}`)
          .pipe(
            map(exists => exists ? { emailTaken: true } : null),
            catchError(() => null) // Network error no bloquea
          )
      ),
      take(1)
    );
  };
}
Validador de Username Disponible¶
export function usernameAvailable(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const username = control.value;
    if (!username || username.length < 3) return of(null);

    return timer(300).pipe(
      switchMap(() =>
        this.http.get<{ available: boolean }>(`/api/usernames/${username}`).pipe(
          map(response => response.available ? null : { usernameTaken: true }),
          catchError(() => of(null))
        )
      )
    );
  };
}
Debounce para Evitar Múltiples Llamadas¶
Servicios con debounce automático:

// shared/async-validators.service.ts
@Injectable({ providedIn: 'root' })
export class AsyncValidatorsService {
  private debounceTime = 500;

  emailUnique(control: AbstractControl, userId?: string): Observable<ValidationErrors | null> {
    return defer(() => timer(this.debounceTime)).pipe(
      switchMap(() => this.checkEmail(control.value, userId)),
      take(1)
    );
  }

  private checkEmail(email: string, userId?: string): Observable<ValidationErrors | null> {
    // Simula API con delay realista
    return of(email === 'taken@example.com' ? { emailTaken: true } : null)
      .pipe(delay(800)); // 800ms API response
  }
}
Uso en FormBuilder¶
// user-form.component.ts
constructor(
  private fb: FormBuilder,
  private asyncValidators: AsyncValidatorsService
) {
  this.userForm = this.fb.group({
    email: ['', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [this.asyncValidators.emailUnique()],
      updateOn: 'blur' // Solo valida al salir del campo
    }],
    username: ['', {
      validators: [Validators.required, Validators.minLength(3)],
      asyncValidators: [this.asyncValidators.usernameAvailable()],
      updateOn: 'blur'
    }]
  });
}
Template con Estados de Loading¶
<div class="field">
  <input formControlName="email" placeholder="Email">

  <div *ngIf="email?.pending" class="loading">Verificando...</div>
  <div *ngIf="email?.errors?.['emailTaken'] && !email?.pending" class="error">
    Email ya registrado
  </div>
</div>

<div class="field">
  <input formControlName="username" placeholder="Usuario">

  <div *ngIf="username?.pending" class="loading">Comprobando disponibilidad...</div>
  <div *ngIf="username?.errors?.['usernameTaken'] && !username?.pending" class="error">
    Nombre de usuario no disponible
  </div>
</div>
Helpers en componente:

get email() { return this.userForm.get('email'); }
get username() { return this.userForm.get('username'); }
Configuración Avanzada¶
Propiedad	Efecto	Recomendado [2]
updateOn: 'blur'	Valida al salir campo	Async validators
updateOn: 'submit'	Solo al enviar form	Performance crítico
debounceTime: 500	Espera escritura	300-800ms
pending: true	Muestra loading	Durante async
CSS para feedback visual:

.field {
  .loading { color: #2196f3; font-style: italic; }
  .error { color: #f44336; font-size: 0.875em; }
  input.ng-invalid.ng-dirty + .error { display: block; }
}
Esta implementación previene spam API, muestra feedback claro y maneja errores de red graceful.[1]
[1]https://v18.angular.dev/essentials/handling-user-interaction/ [2]https://angular.dev/guide/templates/event-listeners

⁂
Tarea 4: FormArray para contenido dinámico¶
FormArray permite gestionar colecciones dinámicas de FormGroup o FormControl, ideal para listas de direcciones, teléfonos o líneas de factura. Cada elemento tiene sus propios validadores y se puede añadir/eliminar en tiempo de ejecución.^1

Definir FormArray y validación por elemento¶
// invoice-form.component.ts
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-invoice-form',
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-form.component.html'
})
export class InvoiceFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      customer: ['', Validators.required],
      phones: this.fb.array([]),
      addresses: this.fb.array([]),
      items: this.fb.array([])
    });

    this.addPhone();
    this.addAddress();
    this.addItem();
  }

  get phones(): FormArray {
    return this.form.get('phones') as FormArray;
  }

  get addresses(): FormArray {
    return this.form.get('addresses') as FormArray;
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  // Teléfonos
  newPhone(): FormGroup {
    return this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^(6|7)[0-9]{8}$/)]]
    });
  }

  addPhone() {
    this.phones.push(this.newPhone());
  }

  removePhone(index: number) {
    this.phones.removeAt(index);
  }

  // Direcciones
  newAddress(): FormGroup {
    return this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });
  }

  addAddress() {
    this.addresses.push(this.newAddress());
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  // Items de factura
  newItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem() {
    this.items.push(this.newItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  getTotal(): number {
    return this.items.value
      .reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value);
  }
}
Template con agregar/eliminar dinámico¶
<!-- invoice-form.component.html -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <!-- Datos cliente -->
  <h3>Cliente</h3>
  <input formControlName="customer" placeholder="Nombre cliente">
  <div *ngIf="form.get('customer')?.invalid && form.get('customer')?.touched" class="error">
    Cliente requerido
  </div>

  <!-- Teléfonos -->
  <h3>Teléfonos</h3>
  <div formArrayName="phones">
    <div *ngFor="let phoneGroup of phones.controls; let i = index" [formGroupName]="i">
      <input formControlName="phone" placeholder="Teléfono (6xxxxxxxx)">
      <button type="button" (click)="removePhone(i)" *ngIf="phones.length > 1">Eliminar</button>
      <div *ngIf="phoneGroup.get('phone')?.invalid && phoneGroup.get('phone')?.touched" class="error">
        Teléfono inválido
      </div>
    </div>
    <button type="button" (click)="addPhone()">Añadir teléfono</button>
  </div>

  <!-- Direcciones -->
  <h3>Direcciones</h3>
  <div formArrayName="addresses">
    <div *ngFor="let addressGroup of addresses.controls; let i = index" [formGroupName]="i" class="address">
      <input formControlName="street" placeholder="Calle">
      <input formControlName="city" placeholder="Ciudad">
      <input formControlName="zip" placeholder="CP">
      <button type="button" (click)="removeAddress(i)" *ngIf="addresses.length > 1">Eliminar</button>

      <div *ngIf="addressGroup.invalid && addressGroup.touched" class="error">
        Todos los campos de la dirección son obligatorios y el CP debe tener 5 dígitos.
      </div>
    </div>
    <button type="button" (click)="addAddress()">Añadir dirección</button>
  </div>

  <!-- Items de factura -->
  <h3>Items de factura</h3>
  <div formArrayName="items">
    <div *ngFor="let itemGroup of items.controls; let i = index" [formGroupName]="i" class="item-row">
      <input formControlName="description" placeholder="Descripción">
      <input formControlName="quantity" type="number" min="1">
      <input formControlName="price" type="number" min="0" step="0.01">
      <button type="button" (click)="removeItem(i)" *ngIf="items.length > 1">Eliminar</button>

      <div *ngIf="itemGroup.invalid && itemGroup.touched" class="error">
        Cantidad mínima 1 y precio ≥ 0.
      </div>
    </div>
    <button type="button" (click)="addItem()">Añadir item</button>
  </div>

  <h4>Total: {{ getTotal() | currency:'EUR':'symbol' }}</h4>

  <button type="submit" [disabled]="form.invalid">Guardar factura</button>
</form>
[1]https://v18.angular.dev/essentials/handling-user-interaction/

[2]https://angular.dev/guide/templates/event-listeners

⁂
Tarea 5: Mostrar errores tras touched/dirty¶
Muestra los errores solo cuando el control ha sido tocado o modificado para evitar “pantallas rojas” al cargar el formulario.^1

<input formControlName="email" type="email" />

<div *ngIf="email.invalid && (email.touched || email.dirty)" class="error">
  <span *ngIf="email.errors?.['required']">El email es obligatorio.</span>
  <span *ngIf="email.errors?.['email']">Formato de email inválido.</span>
</div>
get email() { return this.form.get('email')!; }
Deshabilitar submit si formulario inválido¶
Usa el estado del formulario completo y bloquea también cuando hay validaciones asíncronas en curso.^2

<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <!-- campos -->
  <button type="submit" [disabled]="form.invalid || form.pending">
    {{ form.pending ? 'Validando...' : 'Enviar' }}
  </button>
</form>
Loading durante validación asíncrona¶
Aprovecha la propiedad pending del control para mostrar un mini spinner o texto de “comprobando…”.^3

<input formControlName="username" />

<div *ngIf="username.pending" class="hint loading">
  Comprobando disponibilidad...
</div>

<div *ngIf="username.errors?.['usernameTaken'] && username.touched && !username.pending" class="error">
  Nombre de usuario no disponible.
</div>
get username() { return this.form.get('username')!; }
Feedback visual de validación¶
Angular aplica clases automáticas como ng-touched, ng-dirty, ng-valid, ng-invalid que se pueden usar en CSS para resaltar el estado del campo.^4

input.ng-touched.ng-invalid {
  border: 2px solid #f44336;
}

input.ng-touched.ng-valid {
  border: 2px solid #4caf50;
}

input.ng-pending {
  border-style: dashed;
}
<input formControlName="email" placeholder="Email" />
<small *ngIf="email.invalid && (email.touched || email.dirty)" class="error">
  Corrige los errores antes de continuar.
</small>

⁂
Tarea 6: Documentación¶
Catálogo de validadores implementados¶
Incluye en la documentación una tabla-resumen de todos los validadores (síncronos, personalizados y asíncronos), qué hacen y dónde se usan.

Catálogo de validadores¶
Nombre	Tipo	Nivel	Descripción breve	Uso típico
Validators.required	Síncrono	Campo	Obliga a que el control tenga valor no vacío	Campos obligatorios
Validators.email	Síncrono	Campo	Valida formato de email	Campo email
Validators.minLength(n)	Síncrono	Campo	Longitud mínima de cadena	Password, username
Validators.pattern(...)	Síncrono	Campo	Patrón regex (NIF, CP, teléfono, etc.)	NIF, teléfono, CP
passwordStrength()	Personalizado	Campo	Comprueba mayúsculas, minúsculas, número, símbolo y longitud	Campo password
nif()	Personalizado	Campo	Valida formato y letra de NIF español	Campo nif
telefono()	Personalizado	Campo	Valida teléfono móvil español (6/7 + 8 dígitos)	Lista de teléfonos
codigoPostal()	Personalizado	Campo	Valida código postal de 5 dígitos	Dirección
passwordMatch(...)	Cross-field	FormGroup	Valida que password y confirmPassword coincidan	Formulario de registro
totalMinimo(...)	Cross-field	FormGroup	Valida que price * quantity supere un mínimo	Formularios de pedido/factura
atLeastOneRequired(...)	Cross-field	FormGroup	Obliga a rellenar al menos uno de varios campos	Teléfono o email
uniqueEmail(...)	Asíncrono	Campo	Comprueba que el email no esté registrado (simulación API)	Registro/edición de usuario
usernameAvailable(...)	Asíncrono	Campo	Comprueba que el username esté disponible (simulación API)	Registro de usuario
Guía de uso de FormArray¶
Describe en la documentación cómo se modelan listas dinámicas (teléfonos, direcciones, items) con FormArray, destacando creación, acceso, validación y borrado.

Guía de uso de FormArray¶
Definición en el formulario principal

this.form = this.fb.group({
customer: ['', Validators.required],
phones: this.fb.array([]),
addresses: this.fb.array([]),
items: this.fb.array([])
});
Creación de un elemento del array (ejemplo teléfono)

get phones(): FormArray {
return this.form.get('phones') as FormArray;
}

newPhone(): FormGroup {
return this.fb.group({
phone: ['', [Validators.required, telefono()]]
});
}

addPhone(): void {
this.phones.push(this.newPhone());
}

removePhone(index: number): void {
this.phones.removeAt(index);
}
Uso en plantilla

<div formArrayName="phones">
  <div *ngFor="let phoneGroup of phones.controls; let i = index" [formGroupName]="i">
    <input formControlName="phone" placeholder="Teléfono">
    <button type="button" (click)="removePhone(i)" *ngIf="phones.length > 1">Eliminar</button>

    <small class="error"
           *ngIf="phoneGroup.get('phone')?.invalid && phoneGroup.get('phone')?.touched">
      Teléfono inválido
    </small>
  </div>
  <button type="button" (click)="addPhone()">Añadir teléfono</button>
</div>
Casos de uso documentados

Lista de teléfonos del cliente.
Múltiples direcciones (envío/facturación).
Items de factura: descripción, cantidad, precio, total.
Ejemplos de validación asíncrona¶
Incluye una sección con el flujo completo: servicio que simula API, validador asíncrono y plantilla mostrando estados pending, error y botón bloqueado mientras valida.

Ejemplo: validador asíncrono de email único¶
Servicio de validación (simulación API)

@Injectable({ providedIn: 'root' })
export class ValidationService {
private usedEmails = ['admin@ejemplo.com', 'user@test.com'];

checkEmailUnique(email: string): Observable<boolean> {
return of(email ? !this.usedEmails.includes(email.toLowerCase()) : true)
.pipe(delay(800)); // simula latencia de red
}
}
Validador asíncrono

export function uniqueEmail(validationService: ValidationService): AsyncValidatorFn {
return (control: AbstractControl): Observable<ValidationErrors | null> => {
if (!control.value) return of(null);

    return timer(500).pipe(              // debounce
      switchMap(() => validationService.checkEmailUnique(control.value)),
      map(isUnique => isUnique ? null : { emailTaken: true })
    );
    };
}
Uso en el formulario

this.form = this.fb.group({
email: ['', {
validators: [Validators.required, Validators.email],
asyncValidators: [uniqueEmail(this.validationService)],
updateOn: 'blur'
}]
});
Template con estados de loading y error

<input formControlName="email" placeholder="email@ejemplo.com">
<div *ngIf="email.pending" class="hint loading">
  Comprobando email...
</div>
<div *ngIf="email.errors?.['emailTaken'] && !email.pending && (email.touched || email.dirty)"
     class="error">
  Este email ya está registrado.
</div>
<button type="submit" [disabled]="form.invalid || form.pending">
{{ form.pending ? 'Validando...' : 'Guardar' }}
</button>
En esta sección se explica que los validadores asíncronos usan Observable, que pending indica que la validación sigue en curso y que se combina debounce + updateOn: 'blur' para evitar múltiples llamadas al servidor.

⁂
Entregables:

Mínimo 3 formularios reactivos completos
Validadores personalizados síncronos (mínimo 3)
Validadores asíncronos (mínimo 2)
FormArray implementado en al menos 1 formulario
Feedback visual completo de validación
Documentación de validadores