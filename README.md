# COFIRA - Aplicación de Fitness y Nutrición

<div align="center">

![Angular](https://img.shields.io/badge/Angular-20.3.0-DD0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-6DB33F?style=for-the-badge&logo=spring)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?style=for-the-badge&logo=postgresql)

**Aplicación integral de fitness que te ayuda a gestionar tu entrenamiento, nutrición y progreso de manera eficiente.**

[Características](#-características-principales) •
[Instalación](#-instalación) •
[Arquitectura](#-arquitectura) •
[Documentación](#-documentación-técnica) •
[Testing](#-testing)

</div>

---

## Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Documentación Técnica](#-documentación-técnica)
 - [Fase 1: Manipulación del DOM y Eventos](#fase-1-manipulación-del-dom-y-eventos)
 - [Fase 2: Componentes Interactivos y Comunicación](#fase-2-componentes-interactivos-y-comunicación)
 - [Fase 3: Formularios Reactivos Avanzados](#fase-3-formularios-reactivos-avanzados)
 - [Fase 4: Sistema de Rutas y Navegación](#fase-4-sistema-de-rutas-y-navegación)
 - [Fase 5: Servicios y Comunicación HTTP](#fase-5-servicios-y-comunicación-http)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribución](#-contribución)

---

## Descripción General

**COFIRA** es una aplicación web full-stack moderna diseñada para ayudar a los usuarios a alcanzar sus objetivos de fitness mediante la gestión inteligente de:

- **Entrenamiento**: Creación y seguimiento de rutinas personalizadas
- **Nutrición**: Planificación de comidas y seguimiento de macronutrientes
- **Progreso**: Visualización de métricas y estadísticas con gráficos interactivos
- **Preferencias**: Personalización completa según alergias, objetivos y preferencias

La aplicación implementa las mejores prácticas de desarrollo moderno con **Angular 20**, utilizando arquitectura standalone, signals para gestión de estado reactivo, y una integración completa con un backend Spring Boot.

---

## Características Principales

### Sistema de Autenticación Completo

- Registro de usuarios con validación avanzada
- Login con JWT (JSON Web Tokens)
- Protección de rutas con guards
- Encriptación de contraseñas con BCrypt (strength 12)
- Verificación de tokens en backend

### Interfaz de Usuario Moderna

- **Diseño Responsive**: Adaptado para móviles, tablets y escritorio
- **Theme Switcher**: Modo claro/oscuro con detección automática del sistema
- **Componentes Reutilizables**: Biblioteca completa de componentes UI
- **Animaciones Suaves**: Transiciones y efectos con Angular Animations
- **Accesibilidad**: ARIA attributes y soporte de teclado

### Componentes Interactivos

- **Accordion**: Secciones colapsables con animaciones
- **Tabs**: Navegación por pestañas con indicador animado
- **Modales**: Sistema de ventanas emergentes
- **Tooltips**: Ayuda contextual con 4 posiciones
- **Toast Notifications**: Notificaciones no invasivas
- **Loading States**: Indicadores de carga globales
- **Empty States**: Estados vacíos con acciones sugeridas

### Formularios Avanzados

- **Validación Reactiva**: Validadores síncronos y asíncronos
- **FormArray**: Gestión dinámica de arrays de formularios
- **Cross-Field Validators**: Validación entre campos
- **Mensajes Centralizados**: Sistema unificado de mensajes de error
- **Password Strength**: Indicador visual de seguridad de contraseña
- **Feedback en Tiempo Real**: Validación mientras el usuario escribe

### Visualización de Datos

- **Gráficos Chart.js**: Visualización interactiva de progreso
- **Navegación de Fechas**: Selector intuitivo de fechas
- **Tablas Dinámicas**: Ordenamiento y filtrado
- **Breadcrumbs**: Navegación contextual automática

### Optimizaciones de Rendimiento

- **Lazy Loading**: Carga diferida de módulos
- **PreloadAllModules**: Pre-carga inteligente en segundo plano
- **Resolvers**: Pre-carga de datos antes de activar rutas
- **HTTP Interceptors**: Gestión centralizada de peticiones
- **Signals**: Estado reactivo con cambio de detección optimizado

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Descripción |
| -------------- | ------- | --------------------------------------------- |
| **Angular** | 20.3.0 | Framework principal con standalone components |
| **TypeScript** | 5.9.2 | Lenguaje de programación tipado |
| **RxJS** | 7.8.1 | Programación reactiva con Observables |
| **Chart.js** | 4.4.0 | Gráficos interactivos |
| **ng2-charts** | 8.0.0 | Wrapper Angular para Chart.js |
| **SCSS** | - | Preprocesador CSS con metodología BEM |

### Backend

| Tecnología | Versión | Descripción |
| ------------------- | ------- | ------------------------------ |
| **Spring Boot** | 4.0.0 | Framework backend |
| **PostgreSQL** | 14+ | Base de datos relacional |
| **JWT** | - | Autenticación basada en tokens |
| **BCrypt** | - | Encriptación de contraseñas |
| **Swagger/OpenAPI** | - | Documentación de API |

### Herramientas de Desarrollo

- **Angular CLI**: Scaffolding y build tools
- **Gradle**: Gestión de dependencias backend
- **Jasmine/Karma**: Framework de testing
- **ESLint**: Linting de código
- **Prettier**: Formateo de código

---

## Instalación

### Opción 1: Instalación con Docker (Recomendado) 

La forma más rápida y sencilla de ejecutar toda la aplicación es usando Docker Compose:

**Prerrequisitos:**
- Docker Desktop instalado y ejecutándose
- 4GB de RAM disponible para Docker

**Inicio rápido:**

```bash
# Opción A: Usando el script de inicio (recomendado)
./start.sh

# Opción B: Usando docker-compose directamente
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up --build -d
```

Esto levantará automáticamente:
- PostgreSQL (puerto 5432)
- PgAdmin (puerto 5050)
- Backend Spring Boot (puerto 8080)
- Frontend Angular (puerto 4200)

**URLs de acceso:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- PgAdmin: http://localhost:5050 (admin@admin.com / admin123)

**Comandos útiles:**
```bash
./stop.sh # Detener servicios (con opciones)
docker-compose logs -f # Ver logs en tiempo real
docker-compose ps # Ver estado de servicios
```

 **[Ver guía completa de Docker →](DOCKER-README.md)**

---

### Opción 2: Instalación Manual

**Prerrequisitos:**

```bash
Node.js >= 18.x
npm >= 9.x
Java >= 17
PostgreSQL >= 14
```

### Instalación del Frontend

```bash
# Clonar el repositorio
git clone <repository-url>
cd cofira-app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

### Instalación del Backend

```bash
# Navegar al directorio backend
cd ../backend

# Iniciar el servidor Spring Boot
./gradlew bootRun
```

El backend estará disponible en `http://localhost:8080/`

### Iniciar Aplicación Completa

```bash
# Desde el directorio cofira-app
npm run dev
```

Este comando inicia tanto el frontend (puerto 4200) como el backend (puerto 8080) simultáneamente.

---

## Arquitectura del Proyecto

COFIRA implementa una **arquitectura modular basada en features** siguiendo las mejores prácticas de Angular 20:

```
cofira-app/
 src/
 app/
 core/ # Servicios singleton y funcionalidades core
 auth/ # Servicio de autenticación
 guards/ # Guards de navegación
 interceptors/ # HTTP interceptors
 services/ # Servicios core (BaseHttpService, etc.)
 utils/ # Utilidades (QueryParamsBuilder)
 features/ # Módulos de features
 auth/ # Login, registro, recuperación
 home/ # Página principal con FAQ
 training/ # Gestión de entrenamiento
 nutrition/ # Gestión de nutrición
 progress/ # Seguimiento de progreso
 preferences/ # Configuración con tabs
 onboarding/ # Flujo de bienvenida
 shared/ # Componentes y utilidades compartidas
 components/ # Componentes reutilizables
 header/ # Cabecera con navegación
 footer/ # Pie de página
 ui/ # Biblioteca de componentes UI
 accordion/ # Componente Accordion
 tabs/ # Componente Tabs
 empty-state/ # Estados vacíos
 password-strength/ # Indicador de contraseña
 ... # Más componentes
 directives/ # Directivas compartidas
 tooltip.directive.ts
 click-outside.directive.ts
 validators/ # Validadores personalizados
 password-strength.validator.ts
 cross-field.validators.ts
 async-validators.service.ts
 date.validators.ts
 range.validators.ts
 form-array.validators.ts
 app.routes.ts # Configuración de rutas
 app.config.ts # Configuración de la aplicación
 styles/ # Estilos globales con SCSS
 db.json # Base de datos mock (json-server)
```

### Principios Arquitectónicos

#### 1. **Standalone Components**

Todos los componentes son standalone (sin NgModules), utilizando la nueva API de Angular 20:

```typescript
@Component({
 selector: "app-example",
 standalone: true,
 imports: [CommonModule, FormsModule],
 templateUrl: "./example.html",
})
export class Example {}
```

#### 2. **Signals para Estado Reactivo**

Uso de signals en lugar de RxJS Subjects para gestión de estado local:

```typescript
export class Component {
 count = signal(0);
 doubled = computed(() => this.count() * 2);

 increment() {
 this.count.update((v) => v + 1);
 }
}
```

#### 3. **Dependency Injection con inject()**

Inyección de dependencias usando la función `inject()`:

```typescript
export class Component {
 private router = inject(Router);
 private authService = inject(AuthService);
}
```

#### 4. **BaseHttpService Pattern**

Todos los servicios HTTP extienden `BaseHttpService` para heredar:

- Gestión automática de loading states
- Retry logic (2 reintentos)
- Error handling centralizado

```typescript
@Injectable({ providedIn: "root" })
export class TrainingService extends BaseHttpService {
 private readonly API_URL = `${environment.apiUrl}/exercises`;

 getExercises(): Observable<Exercise[]> {
 return this.get<Exercise[]>(this.API_URL);
 }
}
```

#### 5. **HTTP Interceptors Chain**

4 interceptores configurados en orden específico:

1. **authInterceptor**: Añade JWT token a los headers
2. **loadingInterceptor**: Gestiona estados de carga globales
3. **errorInterceptor**: Manejo global de errores HTTP
4. **loggingInterceptor**: Logging de peticiones/respuestas

---

## Documentación Técnica

### Fase 1: Manipulación del DOM y Eventos

Esta fase implementa componentes interactivos con manipulación avanzada del DOM y gestión de eventos.

#### 1.0 Manipulación del DOM en Componentes Angular

##### Acceder a elementos del DOM usando ViewChild y ElementRef

Angular permite acceder directamente a elementos del DOM utilizando `@ViewChild` y `ElementRef`, aunque generalmente se prefiere usar binding de datos. Para casos específicos donde se necesita manipulación directa:

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";

@Component({
 selector: "app-ejemplo",
 template: `<div #miDiv>Contenido inicial</div>`,
})
export class EjemploComponent implements AfterViewInit {
 @ViewChild("miDiv", { static: false }) miDiv!: ElementRef;

 ngAfterViewInit() {
 // Accedes al elemento nativo del DOM
 console.log(this.miDiv.nativeElement);
 }
}
```

**Puntos clave**:

- `@ViewChild` accede al elemento referenciado en la plantilla
- `ElementRef` contiene la referencia al elemento nativo del DOM
- Usar `ngAfterViewInit` para acceder al DOM después de la inicialización

##### Modificar propiedades y estilos dinámicamente con Renderer2

Para modificaciones seguras y compatibles con diferentes plataformas, Angular recomienda usar `Renderer2`:

```typescript
import { Component, ViewChild, ElementRef, Renderer2 } from "@angular/core";

@Component({
 selector: "app-ejemplo",
 template: `
 <div #miDiv>Contenido inicial</div>
 <button (click)="cambiarEstilo()">Cambiar</button>
 `,
})
export class EjemploComponent {
 @ViewChild("miDiv", { static: false }) miDiv!: ElementRef;

 constructor(private renderer: Renderer2) {}

 cambiarEstilo() {
 // Cambiar estilos con Renderer2
 this.renderer.setStyle(this.miDiv.nativeElement, "color", "red");
 this.renderer.setStyle(this.miDiv.nativeElement, "fontSize", "20px");
 }

 cambiarPropiedad() {
 // Cambiar propiedades con Renderer2
 this.renderer.setProperty(
 this.miDiv.nativeElement,
 "innerText",
 "Texto modificado"
 );
 }
}
```

**Métodos principales de Renderer2**:

- `setStyle(elemento, 'propiedad', 'valor')` - Cambia estilos
- `setProperty(elemento, 'propiedad', 'valor')` - Cambia propiedades
- `addClass/removeClass` - Maneja clases CSS

##### Crear y eliminar elementos del DOM programáticamente

```typescript
import { Component, ViewChild, ElementRef, Renderer2 } from "@angular/core";

@Component({
 selector: "app-ejemplo",
 template: `
 <div #contenedor></div>
 <button (click)="crearElemento()">Crear</button>
 <button (click)="eliminarElemento()">Eliminar</button>
 `,
})
export class EjemploComponent {
 @ViewChild("contenedor", { static: false }) contenedor!: ElementRef;

 constructor(private renderer: Renderer2) {}

 crearElemento() {
 // Crear nuevo elemento
 const nuevoDiv = this.renderer.createElement("div");
 this.renderer.setProperty(nuevoDiv, "innerText", "Nuevo elemento creado");
 this.renderer.setStyle(nuevoDiv, "backgroundColor", "lightblue");
 this.renderer.setStyle(nuevoDiv, "padding", "10px");
 this.renderer.appendChild(this.contenedor.nativeElement, nuevoDiv);
 }

 eliminarElemento() {
 // Eliminar primer elemento hijo
 const primerHijo = this.contenedor.nativeElement.firstChild;
 if (primerHijo) {
 this.renderer.removeChild(this.contenedor.nativeElement, primerHijo);
 }
 }
}
```

**Métodos Renderer2 para DOM dinámico**:

- `createElement('tag')` - Crea elemento HTML
- `appendChild(parent, child)` - Inserta elemento
- `removeChild(parent, child)` - Elimina elemento hijo

---

#### 1.0.1 Sistema de Eventos en Angular

Angular usa un sistema de eventos basado en el DOM pero adaptado a su arquitectura de componentes. Los eventos se manejan mediante **event binding**.

##### Implementar event binding en componentes interactivos

El event binding se realiza poniendo el nombre del evento entre paréntesis:

```typescript
// Template
<button (click)="onClick()">Haz clic aquí</button>

// Componente
onClick() {
 console.log('Botón clickeado');
}
```

Para obtener el objeto evento se usa `$event`:

```typescript
// Template
<input (keyup)="onKeyUp($event)">

// Componente
onKeyUp(event: KeyboardEvent) {
 console.log(event.key);
}
```

Angular tiene pseudoeventos para simplificar el manejo:

- `(keyup.enter)` - Solo se dispara al presionar Enter
- `(click.alt)` - Click con tecla Alt presionada

##### Manejar eventos de teclado, mouse, focus y blur

**Eventos de teclado**:

```html
<input
 (keydown)="onKeyDown($event)"
 (keyup)="onKeyUp($event)"
 (keyup.enter)="onEnter()"
/>
```

**Eventos de mouse**:

```html
<div
 (click)="onClick()"
 (dblclick)="onDoubleClick()"
 (mouseenter)="onMouseEnter()"
 (mouseleave)="onMouseLeave()"
></div>
```

**Eventos de focus/blur**:

```html
<input (focus)="onFocus()" (blur)="onBlur()" />
```

```typescript
onFocus() {
 console.log('Input con foco');
}

onBlur() {
 console.log('Input perdió foco');
}
```

##### Prevenir comportamientos por defecto

Para evitar el comportamiento predeterminado de un evento:

```typescript
// Template
<form (submit)="onSubmit($event)">
 <button type="submit">Enviar</button>
</form>

// Componente
onSubmit(event: Event) {
 event.preventDefault(); // Previene recarga de página
 console.log('Formulario enviado sin recarga');
}
```

##### Propagar o detener propagación de eventos

Por defecto, los eventos burbujean por el DOM. Para detener la propagación:

```typescript
onClick(event: MouseEvent) {
 event.stopPropagation(); // Detiene propagación
 console.log('Click manejado sin burbuja');
}
```

---

#### 1.0.2 Menú Hamburguesa Mobile

**Ubicación**: `src/app/shared/components/header/header.ts`

**Características**:

- Apertura/cierre con animación CSS
- Cierre al hacer click fuera usando `ClickOutsideDirective`
- Responsive (solo visible en mobile)
- Navegación funcional

**Implementación**:

```typescript
export class Header {
 isMenuOpen = signal(false);

 toggleMenu(): void {
 this.isMenuOpen.update((v) => !v);
 }

 closeMenu(): void {
 this.isMenuOpen.set(false);
 }
}
```

**Template**:

```html
<button class="hamburger" (click)="toggleMenu()">
 <span class="hamburger__line"></span>
 <span class="hamburger__line"></span>
 <span class="hamburger__line"></span>
</button>

<nav
 class="mobile-nav"
 [class.mobile-nav--open]="isMenuOpen()"
 (appClickOutside)="closeMenu()"
>
 <a routerLink="/entrenamiento" (click)="closeMenu()">Entrenamiento</a>
 <a routerLink="/nutricion" (click)="closeMenu()">Nutrición</a>
 <a routerLink="/progreso" (click)="closeMenu()">Progreso</a>
</nav>
```

**CSS con animación**:

```scss
.mobile-nav {
 position: fixed;
 top: var(--header-height);
 left: -100%;
 width: 100%;
 height: calc(100vh - var(--header-height));
 background: var(--bg-primary);
 transition: left 0.3s ease-out;

 &--open {
 left: 0;
 }
}
```

---

#### 1.0.3 Modales con cierre ESC

**Ubicación**: `src/app/shared/components/modal/modal.service.ts`

**Características**:

- Apertura/cierre programática
- Cierre con tecla ESC usando `@HostListener`
- Cierre al hacer click en el overlay
- Gestión centralizada con servicio

**Servicio Modal**:

```typescript
@Injectable({ providedIn: "root" })
export class ModalService {
 private modals = new Map<string, ModalComponent>();

 register(id: string, modal: ModalComponent): void {
 this.modals.set(id, modal);
 }

 open(id: string): void {
 this.modals.get(id)?.open();
 }

 close(id: string): void {
 this.modals.get(id)?.close();
 }
}
```

**Componente Modal**:

```typescript
@Component({
 selector: "app-modal",
 standalone: true,
 template: `
 @if (isOpen()) {
 <div class="modal-overlay" (click)="close()">
 <div class="modal-content" (click)="$event.stopPropagation()">
 <button class="modal-close" (click)="close()">×</button>
 <ng-content />
 </div>
 </div>
 }
 `,
})
export class ModalComponent implements OnInit, OnDestroy {
 id = input.required<string>();
 isOpen = signal(false);

 private modalService = inject(ModalService);

 ngOnInit() {
 this.modalService.register(this.id(), this);
 }

 @HostListener("document:keydown.escape", ["$event"])
 onEscapeKey(event: KeyboardEvent): void {
 if (this.isOpen()) {
 this.close();
 }
 }

 open(): void {
 this.isOpen.set(true);
 }

 close(): void {
 this.isOpen.set(false);
 }

 ngOnDestroy() {
 // Cleanup si es necesario
 }
}
```

**Uso**:

```html
<app-modal [id]="'nutrition-modal'">
 <h2>Añadir Comida</h2>
 <app-add-meal-form />
</app-modal>

<button (click)="openModal()">Abrir Modal</button>
```

```typescript
private modalService = inject(ModalService);

openModal(): void {
 this.modalService.open('nutrition-modal');
}
```

---

#### 1.0.4 Theme Switcher Funcional

**Ubicación**: `src/app/core/services/theme.service.ts`

**Características**:

- Detección de `prefers-color-scheme` del sistema
- Toggle entre tema claro/oscuro
- Persistencia en `localStorage`
- Aplicación del tema al cargar la aplicación

**Servicio Theme**:

```typescript
@Injectable({ providedIn: "root" })
export class ThemeService {
 private currentTheme = signal<"light" | "dark">("light");
 theme = this.currentTheme.asReadonly();

 constructor() {
 this.initializeTheme();
 }

 private initializeTheme(): void {
 // 1. Leer de localStorage
 const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

 if (savedTheme) {
 this.setTheme(savedTheme);
 } else {
 // 2. Detectar preferencia del sistema
 const prefersDark = window.matchMedia(
 "(prefers-color-scheme: dark)"
 ).matches;
 this.setTheme(prefersDark ? "dark" : "light");
 }

 // 3. Escuchar cambios en preferencia del sistema
 window
 .matchMedia("(prefers-color-scheme: dark)")
 .addEventListener("change", (e) => {
 if (!localStorage.getItem("theme")) {
 this.setTheme(e.matches ? "dark" : "light");
 }
 });
 }

 toggleTheme(): void {
 const newTheme = this.currentTheme() === "light" ? "dark" : "light";
 this.setTheme(newTheme);
 }

 private setTheme(theme: "light" | "dark"): void {
 this.currentTheme.set(theme);
 document.documentElement.setAttribute("data-theme", theme);
 localStorage.setItem("theme", theme);
 }
}
```

**CSS Variables**:

```scss
:root[data-theme="light"] {
 --bg-primary: #ffffff;
 --text-primary: #1a1a1a;
 --accent: #007bff;
}

:root[data-theme="dark"] {
 --bg-primary: #1a1a1a;
 --text-primary: #ffffff;
 --accent: #0d6efd;
}
```

**Uso en Header**:

```typescript
export class Header {
 private themeService = inject(ThemeService);
 currentTheme = this.themeService.theme;

 toggleTheme(): void {
 this.themeService.toggleTheme();
 }
}
```

```html
<button (click)="toggleTheme()" appTooltip="Cambiar tema">
 @if (currentTheme() === 'dark') { } @else { }
</button>
```

---

#### 1.0.5 Arquitectura de Eventos

La arquitectura de eventos en COFIRA sigue el patrón **unidireccional de datos**, utilizando bindings de eventos nativos del DOM como `(click)`, `(keydown)` y `(pointerdown)` directamente en las plantillas de componentes standalone.

##### Flujo de Eventos

Los eventos se capturan con la sintaxis `(eventName)="handler($event)"`, donde `$event` proporciona acceso al objeto nativo del evento (por ejemplo, `KeyboardEvent` o `PointerEvent`) para detalles como `event.key` o `event.preventDefault()`.

Esta aproximación aprovecha **Zone.js** para detección de cambios automática, emitiendo datos hacia servicios o estados reactivos (signals) sin necesidad de `@Output` en componentes simples, promoviendo simplicidad y rendimiento.

##### Centralización de Eventos Complejos

Para flujos complejos, se centralizan eventos en servicios inyectables que usan `EventEmitter` o `RxJS Subjects`, evitando acoplamiento directo entre componentes.

**Modificadores de eventos**:

- `(keyup.enter)` - Filtra solo tecla Enter
- `(click.alt)` - Click con Alt presionado
- Reducen lógica condicional en handlers

##### Diagrama de Flujo de Eventos Principales

```
Usuario interactúa
 ↓
 DOM Event (click/keydown)
 ↓
 Template Binding (event)
 ↓
 Component Handler ($event)
 ↓
Service/State Update (signals/RxJS)
 ↓
 View Re-render (OnPush/Zone.js)
```

Este diagrama textual representa el ciclo: eventos nativos se propagan unidireccionalmente hacia lógica de negocio, con `preventDefault()` para bloquear comportamientos por defecto cuando sea necesario.

##### Tabla de Compatibilidad de Navegadores

| Evento | Chrome | Firefox | Safari | Edge | Notas |
| ------------- | -------- | -------- | -------- | -------- | -------------------- |
| `click` | Todos | Todos | Todos | Todos | Universal |
| `keydown` | Todos | Todos | Todos | Todos | Universal |
| `keyup.enter` | 90+ | 88+ | 14+ | 90+ | Pseudoevento Angular |
| `pointerdown` | 55+ | 59+ | 13+ | 79+ | API moderna |
| `mouseenter` | Todos | Todos | Todos | Todos | No burbujea |
| `focus` | Todos | Todos | Todos | Todos | No burbujea |
| `blur` | Todos | Todos | Todos | Todos | No burbujea |
| `submit` | Todos | Todos | Todos | Todos | Solo formularios |

**Notas de compatibilidad**:

- Eventos de puntero (`pointerdown`, `pointermove`) son preferidos sobre eventos de mouse para soporte táctil
- Pseudoeventos Angular como `(keyup.enter)` funcionan en todos los navegadores modernos gracias a la abstracción de Angular
- Para IE11 (deprecated), algunos eventos de puntero requieren polyfills

---

#### 1.1 Accordion Component

**Descripción**: Componente de acordeón con animaciones suaves para expandir/colapsar contenido.

**Ubicación**: `src/app/shared/components/ui/accordion/accordion.ts`

**Características**:

- Animaciones de slide-down con Angular Animations
- ARIA attributes para accesibilidad
- Estado interno con signals
- Estilos responsive con BEM

**Uso**:

```html
<app-accordion>
 <app-accordion-item [title]="'¿Qué es COFIRA?'">
 <p>COFIRA es una aplicación integral de fitness...</p>
 </app-accordion-item>
 <app-accordion-item [title]="'¿Cómo funciona?'">
 <p>Puedes crear rutinas personalizadas...</p>
 </app-accordion-item>
</app-accordion>
```

**Código del componente**:

```typescript
@Component({
 selector: "app-accordion-item",
 standalone: true,
 imports: [CommonModule],
 animations: [
 trigger("slideDown", [
 state("closed", style({ height: "0", opacity: "0" })),
 state("open", style({ height: "*", opacity: "1" })),
 transition("closed <=> open", [animate("300ms ease-out")]),
 ]),
 ],
})
export class AccordionItem {
 title = input.required<string>();
 isOpen = signal(false);

 toggle(): void {
 this.isOpen.update((v) => !v);
 }
}
```

**Integración**: Utilizado en la página principal (`/`) para mostrar una sección de Preguntas Frecuentes (FAQ).

---

#### 1.2 Tabs Component

**Descripción**: Sistema de pestañas con indicador animado y transiciones suaves entre paneles.

**Ubicación**: `src/app/shared/components/ui/tabs/tabs.ts`

**Características**:

- Indicador de pestaña activa con animación de movimiento
- Transiciones fade-in entre paneles
- Soporte para pestañas deshabilitadas
- Cálculo dinámico de posición del indicador
- Accesibilidad completa (role, aria-\*)

**Uso**:

```typescript
// En el componente
tabs: Tab[] = [
 { id: 'profile', label: 'Perfil' },
 { id: 'settings', label: 'Configuración' },
 { id: 'notifications', label: 'Notificaciones' }
];
activeTab = signal('profile');

onTabChanged(tabId: string): void {
 this.activeTab.set(tabId);
}
```

```html
<app-tabs [tabs]="tabs" (tabChanged)="onTabChanged($event)">
 <app-tab-panel [tabId]="'profile'" [isActive]="activeTab() === 'profile'">
 <p>Contenido del perfil...</p>
 </app-tab-panel>
 <app-tab-panel [tabId]="'settings'" [isActive]="activeTab() === 'settings'">
 <p>Contenido de configuración...</p>
 </app-tab-panel>
</app-tabs>
```

**Características técnicas**:

```typescript
export class Tabs {
 indicatorPosition = signal(0);
 indicatorWidth = signal(0);

 private updateIndicatorPosition(): void {
 const activeTab = document.querySelector(`#tab-${this.activeTabId()}`);
 if (!activeTab) return;

 const tabsHeader = activeTab.parentElement as HTMLElement;
 const headerRect = tabsHeader.getBoundingClientRect();
 const tabRect = activeTab.getBoundingClientRect();

 this.indicatorPosition.set(tabRect.left - headerRect.left);
 this.indicatorWidth.set(tabRect.width);
 }
}
```

**Integración**: Utilizado en la página de Preferencias (`/preferencias`) para organizar contenido en 3 secciones: Alimentación, Cuenta y Notificaciones.

---

#### 1.3 Tooltip Directive

**Descripción**: Directiva para mostrar tooltips contextuales con 4 posiciones posibles.

**Ubicación**: `src/app/shared/directives/tooltip.directive.ts`

**Características**:

- 4 posiciones: top, bottom, left, right
- Detección automática de bordes del viewport
- Soporte de eventos: mouseenter, mouseleave, focus, blur
- Accesibilidad con role="tooltip"
- Cálculo dinámico de posición

**Uso**:

```html
<button appTooltip="Guardar cambios" tooltipPosition="top">Guardar</button>

<a
 routerLink="/preferencias"
 appTooltip="Ver y editar tu perfil"
 tooltipPosition="bottom"
>
 Mi Cuenta
</a>
```

**Código de la directiva**:

```typescript
@Directive({
 selector: "[appTooltip]",
 standalone: true,
})
export class TooltipDirective {
 private tooltipText = input<string>("", { alias: "appTooltip" });
 private tooltipPosition = input<"top" | "bottom" | "left" | "right">("top");
 private tooltipElement: HTMLElement | null = null;

 @HostListener("mouseenter")
 onMouseEnter(): void {
 this.showTooltip();
 }

 @HostListener("mouseleave")
 onMouseLeave(): void {
 this.hideTooltip();
 }

 private showTooltip(): void {
 this.tooltipElement = document.createElement("div");
 this.tooltipElement.className = `c-tooltip c-tooltip--${this.tooltipPosition()}`;
 this.tooltipElement.textContent = this.tooltipText();
 document.body.appendChild(this.tooltipElement);
 this.positionTooltip();
 }
}
```

**Integración**: Utilizado en el Header (`header.ts`) para botones de tema, cuenta, logout y menú hamburguesa.

---

#### 1.4 Click Outside Directive

**Descripción**: Directiva para detectar clics fuera de un elemento.

**Ubicación**: `src/app/shared/directives/click-outside.directive.ts`

**Características**:

- Detección de clics en el documento
- Verificación si el clic fue dentro o fuera
- Emisión de evento cuando se hace clic fuera
- Útil para cerrar dropdowns y modales

**Uso**:

```html
<div class="dropdown" (appClickOutside)="closeDropdown()">
 <button>Abrir menú</button>
 <ul class="dropdown-menu">
 <li>Opción 1</li>
 <li>Opción 2</li>
 </ul>
</div>
```

**Código**:

```typescript
@Directive({
 selector: "[appClickOutside]",
 standalone: true,
})
export class ClickOutsideDirective {
 clickedOutside = output<void>({ alias: "appClickOutside" });
 private elementRef = inject(ElementRef);

 @HostListener("document:click", ["$event"])
 onClick(event: MouseEvent): void {
 const target = event.target as HTMLElement;
 if (!target) return;

 const clickedInside = this.elementRef.nativeElement.contains(target);
 if (!clickedInside) {
 this.clickedOutside.emit();
 }
 }
}
```

---

### Fase 2: Componentes Interactivos y Comunicación

Esta fase documenta la arquitectura de comunicación entre componentes y servicios del proyecto.

#### 2.1 Patrones de Comunicación

COFIRA implementa 4 patrones principales de comunicación:

##### A. Parent → Child (Inputs)

Uso de `input()` signals para pasar datos de padre a hijo:

```typescript
// Componente hijo
export class ChildComponent {
 data = input.required<DataType>();
 optionalData = input<string>("default");
}
```

```html
<!-- Componente padre -->
<app-child [data]="parentData" [optionalData]="someValue" />
```

##### B. Child → Parent (Outputs)

Uso de `output()` para emitir eventos al padre:

```typescript
// Componente hijo
export class ChildComponent {
 itemClicked = output<number>();

 onClick(id: number): void {
 this.itemClicked.emit(id);
 }
}
```

```html
<!-- Componente padre -->
<app-child (itemClicked)="handleClick($event)" />
```

##### C. Siblings (Services)

Comunicación entre componentes hermanos usando servicios con signals:

```typescript
@Injectable({ providedIn: "root" })
export class StateService {
 private _count = signal(0);
 count = this._count.asReadonly();

 increment(): void {
 this._count.update((v) => v + 1);
 }
}
```

##### D. Global State (Services)

Servicios singleton para estado global:

**ToastService**: Notificaciones globales

```typescript
export class ToastService {
 private toasts = signal<Toast[]>([]);

 success(message: string): void {
 this.show(message, "success");
 }

 error(message: string): void {
 this.show(message, "error");
 }
}
```

**LoadingService**: Estados de carga globales

```typescript
export class LoadingService {
 private loading = signal(false);
 isLoading = this.loading.asReadonly();

 show(): void {
 this.loading.set(true);
 }
 hide(): void {
 this.loading.set(false);
 }
}
```

**ModalService**: Gestión de modales

```typescript
export class ModalService {
 private modals = new Map<string, ModalComponent>();

 open(id: string): void {
 this.modals.get(id)?.open();
 }

 close(id: string): void {
 this.modals.get(id)?.close();
 }
}
```

#### 2.2 Separación de Responsabilidades

El proyecto sigue el patrón de separación entre:

**Presentation Components** (Dumb Components):

- Solo reciben datos vía `input()`
- Emiten eventos vía `output()`
- No tienen lógica de negocio
- No acceden a servicios HTTP

```typescript
@Component({
 selector: "app-exercise-row",
 standalone: true,
})
export class ExerciseRow {
 exercise = input.required<Exercise>();
 exerciseClicked = output<number>();

 onClick(): void {
 this.exerciseClicked.emit(this.exercise().id);
 }
}
```

**Container Components** (Smart Components):

- Gestionan el estado
- Llaman a servicios HTTP
- Contienen lógica de negocio
- Pasan datos a componentes de presentación

```typescript
@Component({
 selector: "app-training",
 standalone: true,
})
export class Training implements OnInit {
 private trainingService = inject(TrainingService);
 exercises = signal<Exercise[]>([]);

 ngOnInit(): void {
 this.loadExercises();
 }

 private loadExercises(): void {
 this.trainingService.getExercises().subscribe({
 next: (data) => this.exercises.set(data),
 });
 }
}
```

#### 2.3 Servicios Core

| Servicio | Propósito | Tipo |
| -------------------------- | ------------------------- | --------------- |
| `AuthService` | Autenticación JWT | Singleton |
| `BaseHttpService` | Base para servicios HTTP | Clase abstracta |
| `LoadingService` | Estados de carga globales | Singleton |
| `ToastService` | Notificaciones | Singleton |
| `ModalService` | Gestión de modales | Singleton |
| `ThemeService` | Theme switcher | Singleton |
| `FormErrorMessagesService` | Mensajes de error | Singleton |

---

### Fase 3: Formularios Reactivos Avanzados

Esta fase implementa un sistema completo de validación de formularios con validadores personalizados.

#### 3.1 Catálogo de Validadores

##### A. Validadores de Fecha

**Ubicación**: `src/app/shared/validators/date.validators.ts`

```typescript
// Prevenir fechas pasadas
futureDateValidator(): ValidatorFn

// Solo fechas pasadas
pastDateValidator(): ValidatorFn

// Rango de fechas
dateRangeValidator(minDate?: Date, maxDate?: Date): ValidatorFn

// Edad mínima
minAgeValidator(age: number): ValidatorFn
```

**Ejemplo de uso**:

```typescript
birthDateControl = new FormControl("", [
 Validators.required,
 pastDateValidator(),
 minAgeValidator(18),
]);
```

##### B. Validadores de Rango

**Ubicación**: `src/app/shared/validators/range.validators.ts`

```typescript
// Rango numérico
rangeValidator(min: number, max: number): ValidatorFn

// Solo números positivos
positiveNumberValidator(): ValidatorFn

// Solo enteros
integerValidator(): ValidatorFn

// Porcentaje 0-100
percentageValidator(): ValidatorFn

// Decimales máximos
maxDecimalsValidator(decimals: number): ValidatorFn
```

**Ejemplo de uso**:

```typescript
weightControl = new FormControl("", [
 Validators.required,
 rangeValidator(30, 300),
 maxDecimalsValidator(1),
]);

bodyFatControl = new FormControl("", [percentageValidator()]);
```

##### C. Validadores de FormArray

**Ubicación**: `src/app/shared/validators/form-array.validators.ts`

```typescript
// Mínimo de elementos
minArrayLengthValidator(min: number): ValidatorFn

// Al menos un elemento seleccionado
atLeastOneSelectedValidator(): ValidatorFn

// Valores únicos en el array
uniqueArrayValuesValidator(): ValidatorFn

// Validación personalizada de cada elemento
arrayItemValidator(validator: ValidatorFn): ValidatorFn
```

**Ejemplo de uso**:

```typescript
// En OnboardingMuscles
muscles = new FormArray(
 [new FormControl(false), new FormControl(false), new FormControl(false)],
 [atLeastOneSelectedValidator()]
);

// En AddMealForm
ingredients = new FormArray([], [minArrayLengthValidator(1)]);
```

##### D. Validadores Cross-Field

**Ubicación**: `src/app/shared/validators/cross-field.validators.ts`

```typescript
// Comparar dos campos
passwordMatchValidator(passwordField: string, confirmField: string): ValidatorFn
```

**Ejemplo de uso**:

```typescript
registerForm = new FormGroup(
 {
 password: new FormControl("", [Validators.required]),
 confirmPassword: new FormControl("", [Validators.required]),
 },
 {
 validators: [passwordMatchValidator("password", "confirmPassword")],
 }
);
```

##### E. Validadores Asíncronos

**Ubicación**: `src/app/shared/validators/async-validators.service.ts`

```typescript
@Injectable({ providedIn: "root" })
export class AsyncValidatorsService {
 // Verificar si el email está disponible
 emailUnique(): AsyncValidatorFn;

 // Verificar si el username está disponible
 usernameUnique(): AsyncValidatorFn;
}
```

**Ejemplo de uso**:

```typescript
emailControl = new FormControl(
 "",
 [Validators.required, Validators.email],
 [this.asyncValidators.emailUnique()]
);

usernameControl = new FormControl(
 "",
 [Validators.required, Validators.minLength(3)],
 [this.asyncValidators.usernameUnique()]
);
```

#### 3.2 FormErrorMessagesService

**Descripción**: Servicio centralizado para mensajes de error de formularios.

**Ubicación**: `src/app/core/services/form-error-messages.service.ts`

**Características**:

- Mensajes para todos los validadores
- Soporte para interpolación de valores
- Mensajes en español
- Fácil extensión

**Uso**:

```typescript
export class Component {
 private errorService = inject(FormErrorMessagesService);

 getErrorMessage(control: FormControl): string {
 if (!control.errors) return "";

 const errorKey = Object.keys(control.errors)[0];
 return this.errorService.getErrorMessage(
 errorKey,
 control.errors[errorKey]
 );
 }
}
```

**Mensajes disponibles**:

```typescript
{
 required: 'Este campo es obligatorio',
 email: 'El email no es válido',
 minLength: (val) => `Mínimo ${val.requiredLength} caracteres`,
 min: (val) => `El valor mínimo es ${val.min}`,
 max: (val) => `El valor máximo es ${val.max}`,
 passwordStrength: 'La contraseña debe tener al menos 12 caracteres...',
 passwordMatch: 'Las contraseñas no coinciden',
 emailTaken: 'Este email ya está en uso',
 usernameTaken: 'Este nombre de usuario ya está en uso',
 pastDate: 'La fecha no puede ser anterior a hoy',
 minAge: (val) => `Debes tener al menos ${val.requiredAge} años`,
 range: (val) => `El valor debe estar entre ${val.min} y ${val.max}`,
 minArrayLength: (val) => `Selecciona al menos ${val.required} elementos`,
 atLeastOneRequired: 'Selecciona al menos una opción'
}
```

#### 3.3 Password Strength Component

**Descripción**: Indicador visual de fortaleza de contraseña.

**Ubicación**: `src/app/shared/components/ui/password-strength/password-strength.ts`

**Características**:

- 4 niveles: Débil, Regular, Buena, Fuerte
- Barra visual con segmentos coloreados
- Lista de requisitos con checkmarks
- Actualización en tiempo real

**Uso**:

```html
<input type="password" formControlName="password" />
<app-password-strength [password]="registerForm.get('password')?.value || ''" />
```

**Algoritmo de cálculo**:

```typescript
private calculateStrength(password: string): number {
 let score = 0;
 if (password.length >= 8) score++;
 if (password.length >= 12) score++;
 if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
 if (/\d/.test(password)) score++;
 if (/[^a-zA-Z\d]/.test(password)) score++;
 return Math.min(Math.floor(score / 1.5), 4);
}
```

**Integración**: Utilizado en el formulario de registro (`register.ts`) para ayudar al usuario a crear contraseñas seguras.

#### 3.4 Ejemplos Completos de Formularios

##### Formulario de Registro

```typescript
@Component({ ... })
export class Register {
 private fb = inject(FormBuilder);
 private asyncValidators = inject(AsyncValidatorsService);

 registerForm = this.fb.group({
 name: ['', [Validators.required]],
 username: ['',
 [Validators.required, Validators.minLength(3)],
 [this.asyncValidators.usernameUnique()]
 ],
 email: ['',
 [Validators.required, Validators.email],
 [this.asyncValidators.emailUnique()]
 ],
 password: ['', [
 Validators.required,
 passwordStrengthValidator()
 ]],
 confirmPassword: ['', [Validators.required]]
 }, {
 validators: [passwordMatchValidator('password', 'confirmPassword')]
 });
}
```

##### FormArray Dinámico (AddMealForm)

```typescript
export class AddMealForm {
 private fb = inject(FormBuilder);

 mealForm = this.fb.group({
 mealType: ["", [Validators.required]],
 foods: this.fb.array(
 [this.createFoodControl()],
 [minArrayLengthValidator(1)]
 ),
 });

 get foods(): FormArray {
 return this.mealForm.get("foods") as FormArray;
 }

 createFoodControl(): FormGroup {
 return this.fb.group({
 name: ["", [Validators.required]],
 quantity: [
 "",
 [
 Validators.required,
 positiveNumberValidator(),
 maxDecimalsValidator(1),
 ],
 ],
 unit: ["g", [Validators.required]],
 });
 }

 addFood(): void {
 this.foods.push(this.createFoodControl());
 }

 removeFood(index: number): void {
 this.foods.removeAt(index);
 }
}
```

---

### Fase 4: Sistema de Rutas y Navegación

Esta fase implementa un sistema avanzado de rutas con guards, resolvers y estrategias de pre-carga.

#### 4.1 Mapa de Rutas

```typescript
// src/app/app.routes.ts
export const routes: Routes = [
 // Rutas públicas
 {
 path: "",
 loadComponent: () => import("./features/home/home").then((m) => m.Home),
 data: { breadcrumb: "Inicio" },
 },
 {
 path: "login",
 loadComponent: () =>
 import("./features/auth/login/login/login").then((m) => m.Login),
 data: { breadcrumb: "Iniciar Sesión" },
 },
 {
 path: "register",
 loadComponent: () =>
 import("./features/auth/register/register/register").then(
 (m) => m.Register
 ),
 canDeactivate: [canDeactivateGuard],
 data: { breadcrumb: "Registro" },
 },
 {
 path: "reset-password",
 loadComponent: () =>
 import(
 "./features/auth/reset-password/reset-password/reset-password"
 ).then((m) => m.ResetPassword),
 data: { breadcrumb: "Restablecer Contraseña" },
 },

 // Rutas protegidas
 {
 path: "entrenamiento",
 loadComponent: () =>
 import("./features/training/training").then((m) => m.Training),
 canActivate: [authGuard],
 resolve: { exercises: trainingResolver },
 data: { breadcrumb: "Entrenamiento" },
 },
 {
 path: "alimentacion",
 loadComponent: () =>
 import("./features/nutrition/nutrition").then((m) => m.Nutrition),
 canActivate: [authGuard],
 resolve: { foods: nutritionResolver },
 data: { breadcrumb: "Alimentación" },
 },
 {
 path: "seguimiento",
 loadComponent: () =>
 import("./features/progress/progress").then((m) => m.Progress),
 canActivate: [authGuard],
 data: { breadcrumb: "Seguimiento" },
 },
 {
 path: "preferencias",
 loadComponent: () =>
 import("./features/preferences/preferences").then((m) => m.Preferences),
 canActivate: [authGuard],
 data: { breadcrumb: "Preferencias" },
 },

 // Rutas anidadas
 {
 path: "onboarding",
 loadComponent: () =>
 import(
 "./features/onboarding/onboarding-container/onboarding-container/onboarding-container"
 ).then((m) => m.OnboardingContainer),
 canActivate: [authGuard],
 data: { breadcrumb: "Onboarding" },
 children: [
 { path: "", redirectTo: "about", pathMatch: "full" },
 {
 path: "about",
 loadComponent: () =>
 import(
 "./features/onboarding/steps/about/onboarding-about/onboarding-about"
 ).then((m) => m.OnboardingAbout),
 },
 {
 path: "nutrition",
 loadComponent: () =>
 import(
 "./features/onboarding/steps/nutrition/onboarding-nutrition/onboarding-nutrition"
 ).then((m) => m.OnboardingNutrition),
 },
 {
 path: "goal",
 loadComponent: () =>
 import(
 "./features/onboarding/steps/goal/onboarding-goal/onboarding-goal"
 ).then((m) => m.OnboardingGoal),
 },
 {
 path: "pricing",
 loadComponent: () =>
 import(
 "./features/onboarding/steps/pricing/onboarding-pricing/onboarding-pricing"
 ).then((m) => m.OnboardingPricing),
 },
 {
 path: "muscles",
 loadComponent: () =>
 import(
 "./features/onboarding/steps/muscles/onboarding-muscles/onboarding-muscles"
 ).then((m) => m.OnboardingMuscles),
 },
 ],
 },

 // 404
 {
 path: "**",
 loadComponent: () =>
 import("./shared/components/not-found/not-found").then((m) => m.NotFound),
 data: { breadcrumb: "Página no encontrada" },
 },
];
```

#### 4.2 Guards

##### A. AuthGuard (CanActivate)

**Descripción**: Protege rutas que requieren autenticación.

**Ubicación**: `src/app/core/guards/auth-guard.ts`

**Tipo**: `CanActivateFn` (función guard de Angular 20)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
 const authService = inject(AuthService);
 const router = inject(Router);

 if (authService.isLoggedIn()) {
 return true;
 }

 // Redirigir a login y guardar la URL intentada
 router.navigate(["/login"], {
 queryParams: { returnUrl: state.url },
 });
 return false;
};
```

**Uso**:

```typescript
{
 path: 'entrenamiento',
 canActivate: [authGuard],
 loadComponent: () => import('./features/training/training').then(m => m.Training)
}
```

##### B. CanDeactivateGuard

**Descripción**: Previene navegación con cambios sin guardar.

**Ubicación**: `src/app/core/guards/can-deactivate.guard.ts`

**Interface**:

```typescript
export interface CanComponentDeactivate {
 canDeactivate: () => boolean | Observable<boolean>;
}
```

**Guard**:

```typescript
export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
 component: CanComponentDeactivate
): boolean | Observable<boolean> => {
 return component.canDeactivate ? component.canDeactivate() : true;
};
```

**Implementación en componente**:

```typescript
@Component({ ... })
export class Register implements CanComponentDeactivate {
 registerForm: FormGroup;

 canDeactivate(): boolean {
 if (this.registerForm.dirty && !this.registerForm.value.email) {
 return confirm(
 '¿Estás seguro de que quieres salir?\n\n' +
 'Tienes cambios sin guardar en el formulario de registro.'
 );
 }
 return true;
 }
}
```

**Uso en rutas**:

```typescript
{
 path: 'register',
 canDeactivate: [canDeactivateGuard],
 loadComponent: () => import('./features/auth/register/register/register').then(m => m.Register)
}
```

#### 4.3 Resolvers

Los resolvers pre-cargan datos antes de activar una ruta, mejorando la experiencia de usuario.

##### A. Training Resolver

**Ubicación**: `src/app/features/training/resolvers/training.resolver.ts`

```typescript
export const trainingResolver: ResolveFn<Exercise[]> = (
 route: ActivatedRouteSnapshot,
 state: RouterStateSnapshot
): Observable<Exercise[]> => {
 const trainingService = inject(TrainingService);
 const router = inject(Router);
 const toastService = inject(ToastService);
 const loadingService = inject(LoadingService);

 loadingService.show();

 return trainingService.listarEjercicios().pipe(
 catchError((error) => {
 console.error("Error loading exercises:", error);
 toastService.error("Error al cargar los ejercicios");
 router.navigate(["/"]);
 return of([]);
 }),
 finalize(() => loadingService.hide())
 );
};
```

**Uso en componente**:

```typescript
export class Training implements OnInit {
 private route = inject(ActivatedRoute);
 exercises = signal<Exercise[]>([]);

 ngOnInit(): void {
 // Obtener datos pre-cargados del resolver
 const exercises = this.route.snapshot.data["exercises"] as Exercise[];
 this.exercises.set(exercises);
 }
}
```

**Configuración en rutas**:

```typescript
{
 path: 'entrenamiento',
 resolve: { exercises: trainingResolver },
 loadComponent: () => import('./features/training/training').then(m => m.Training)
}
```

##### B. Nutrition Resolver

Similar al Training Resolver, pre-carga la lista de alimentos:

```typescript
export const nutritionResolver: ResolveFn<Food[]> = (
 route: ActivatedRouteSnapshot,
 state: RouterStateSnapshot
): Observable<Food[]> => {
 const nutritionService = inject(NutritionService);
 const router = inject(Router);
 const toastService = inject(ToastService);
 const loadingService = inject(LoadingService);

 loadingService.show();

 return nutritionService.getFoodList().pipe(
 catchError((error) => {
 console.error("Error loading foods:", error);
 toastService.error("Error al cargar los alimentos");
 router.navigate(["/"]);
 return of([]);
 }),
 finalize(() => loadingService.hide())
 );
};
```

#### 4.4 Estrategia de Pre-carga

**Configuración**: `src/app/app.config.ts`

```typescript
import { PreloadAllModules } from "@angular/router";

export const appConfig: ApplicationConfig = {
 providers: [provideRouter(routes, withPreloading(PreloadAllModules))],
};
```

**Ventajas**:

- Pre-carga de módulos lazy en segundo plano
- Navegación instantánea después de la primera carga
- Mejor experiencia de usuario
- Uso eficiente del ancho de banda

#### 4.5 Breadcrumbs Dinámicos

Los breadcrumbs se generan automáticamente desde la configuración de rutas:

```typescript
// Cada ruta tiene un breadcrumb en data
{
 path: 'entrenamiento',
 data: { breadcrumb: 'Entrenamiento' }
}
```

El componente Breadcrumbs lee la ruta activa y genera la navegación:

```typescript
export class Breadcrumbs implements OnInit {
 breadcrumbs = signal<Breadcrumb[]>([]);

 ngOnInit(): void {
 this.router.events
 .pipe(filter((event) => event instanceof NavigationEnd))
 .subscribe(() => {
 this.breadcrumbs.set(this.createBreadcrumbs(this.route.root));
 });
 }
}
```

#### 4.6 Navegación Programática

**Router Service**:

```typescript
export class Component {
 private router = inject(Router);

 // Navegación simple
 goToProfile(): void {
 this.router.navigate(["/preferencias"]);
 }

 // Con parámetros
 viewExercise(id: number): void {
 this.router.navigate(["/entrenamiento", id]);
 }

 // Con query params
 search(term: string): void {
 this.router.navigate(["/entrenamiento"], {
 queryParams: { search: term },
 });
 }

 // Navegación relativa
 nextStep(): void {
 this.router.navigate(["../next"], { relativeTo: this.route });
 }
}
```

---

### Fase 5: Servicios y Comunicación HTTP

Esta fase implementa servicios HTTP con arquitectura escalable y manejo robusto de errores.

#### 5.1 BaseHttpService

**Descripción**: Clase base abstracta para todos los servicios HTTP.

**Ubicación**: `src/app/core/services/base-http.service.ts`

**Características**:

- Métodos CRUD genéricos
- Retry logic automático (2 reintentos)
- Error handling centralizado
- Loading states automáticos
- Tipado TypeScript con generics

**Código**:

```typescript
@Injectable()
export abstract class BaseHttpService {
 protected http = inject(HttpClient);
 protected loadingService = inject(LoadingService);

 protected get<T>(url: string, options?: any): Observable<T> {
 return this.http
 .get<T>(url, options)
 .pipe(retry(2), catchError(this.handleError));
 }

 protected post<T>(url: string, body: any, options?: any): Observable<T> {
 return this.http
 .post<T>(url, body, options)
 .pipe(retry(2), catchError(this.handleError));
 }

 protected put<T>(url: string, body: any, options?: any): Observable<T> {
 return this.http
 .put<T>(url, body, options)
 .pipe(retry(2), catchError(this.handleError));
 }

 protected delete<T>(url: string, options?: any): Observable<T> {
 return this.http
 .delete<T>(url, options)
 .pipe(retry(2), catchError(this.handleError));
 }

 private handleError(error: HttpErrorResponse): Observable<never> {
 let errorMessage = "Ocurrió un error desconocido";

 if (error.error instanceof ErrorEvent) {
 // Error del lado del cliente
 errorMessage = `Error: ${error.error.message}`;
 } else {
 // Error del lado del servidor
 errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
 }

 console.error(errorMessage);
 return throwError(() => new Error(errorMessage));
 }
}
```

**Uso en servicios**:

```typescript
@Injectable({ providedIn: "root" })
export class TrainingService extends BaseHttpService {
 private readonly API_URL = `${environment.apiUrl}/exercises`;

 listarEjercicios(): Observable<Exercise[]> {
 return this.get<Exercise[]>(this.API_URL);
 }

 crearEjercicio(exercise: Exercise): Observable<Exercise> {
 return this.post<Exercise>(this.API_URL, exercise);
 }

 actualizarEjercicio(id: number, exercise: Exercise): Observable<Exercise> {
 return this.put<Exercise>(`${this.API_URL}/${id}`, exercise);
 }

 eliminarEjercicio(id: number): Observable<void> {
 return this.delete<void>(`${this.API_URL}/${id}`);
 }
}
```

#### 5.2 HTTP Interceptors

Los interceptores se ejecutan en orden para cada petición HTTP:

##### A. Auth Interceptor

**Ubicación**: `src/app/core/interceptors/auth.interceptor.ts`

**Propósito**: Añadir JWT token a todas las peticiones

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const authService = inject(AuthService);
 const token = authService.getToken();

 if (token) {
 req = req.clone({
 setHeaders: {
 Authorization: `Bearer ${token}`,
 },
 });
 }

 return next(req);
};
```

##### B. Loading Interceptor

**Ubicación**: `src/app/core/interceptors/loading.interceptor.ts`

**Propósito**: Gestionar loading states globales

```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
 const loadingService = inject(LoadingService);

 loadingService.show();

 return next(req).pipe(finalize(() => loadingService.hide()));
};
```

##### C. Error Interceptor

**Ubicación**: `src/app/core/interceptors/error.interceptor.ts`

**Propósito**: Manejo global de errores HTTP

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
 const toastService = inject(ToastService);
 const router = inject(Router);

 return next(req).pipe(
 catchError((error: HttpErrorResponse) => {
 let errorMessage = "Ha ocurrido un error";

 if (error.status === 401) {
 errorMessage = "No autorizado. Inicia sesión nuevamente.";
 router.navigate(["/login"]);
 } else if (error.status === 403) {
 errorMessage = "No tienes permisos para realizar esta acción.";
 } else if (error.status === 404) {
 errorMessage = "Recurso no encontrado.";
 } else if (error.status === 500) {
 errorMessage = "Error del servidor. Intenta más tarde.";
 }

 toastService.error(errorMessage);
 return throwError(() => error);
 })
 );
};
```

##### D. Logging Interceptor

**Ubicación**: `src/app/core/interceptors/logging.interceptor.ts`

**Propósito**: Logging de peticiones y respuestas (solo en desarrollo)

```typescript
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
 const startTime = Date.now();

 console.log(`[HTTP] ${req.method} ${req.url}`);

 return next(req).pipe(
 tap({
 next: (event) => {
 if (event instanceof HttpResponse) {
 const duration = Date.now() - startTime;
 console.log(
 `[HTTP] ${req.method} ${req.url} - ${event.status} (${duration}ms)`
 );
 }
 },
 error: (error: HttpErrorResponse) => {
 const duration = Date.now() - startTime;
 console.error(
 `[HTTP] ${req.method} ${req.url} - ${error.status} (${duration}ms)`
 );
 },
 })
 );
};
```

**Configuración de interceptores**:

```typescript
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
 providers: [
 provideHttpClient(
 withInterceptors([
 authInterceptor,
 loadingInterceptor,
 errorInterceptor,
 loggingInterceptor,
 ])
 ),
 ],
};
```

#### 5.3 QueryParamsBuilder

**Descripción**: Utilidad para construir query strings de forma fluida.

**Ubicación**: `src/app/core/utils/query-params.util.ts`

```typescript
export class QueryParamsBuilder {
 private params: Record<string, string | number | boolean> = {};

 add(key: string, value: string | number | boolean | null | undefined): this {
 if (value !== null && value !== undefined) {
 this.params[key] = value;
 }
 return this;
 }

 addArray(key: string, values: (string | number)[]): this {
 values.forEach((value, index) => {
 this.params[`${key}[${index}]`] = value;
 });
 return this;
 }

 addObject(key: string, obj: Record<string, any>): this {
 Object.entries(obj).forEach(([subKey, value]) => {
 if (value !== null && value !== undefined) {
 this.params[`${key}.${subKey}`] = value;
 }
 });
 return this;
 }

 addIf(condition: boolean, key: string, value: any): this {
 if (condition) {
 this.add(key, value);
 }
 return this;
 }

 build(): string {
 const queryString = Object.entries(this.params)
 .map(
 ([key, value]) =>
 `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
 )
 .join("&");
 return queryString ? `?${queryString}` : "";
 }

 toHttpParams(): HttpParams {
 let httpParams = new HttpParams();
 Object.entries(this.params).forEach(([key, value]) => {
 httpParams = httpParams.set(key, String(value));
 });
 return httpParams;
 }
}
```

**Uso**:

```typescript
// Construcción de query string
const queryString = new QueryParamsBuilder()
 .add("userId", 123)
 .add("date", "2025-12-13")
 .add("status", "active")
 .addIf(includeTags, "tags", "fitness,health")
 .build();
// Resultado: ?userId=123&date=2025-12-13&status=active&tags=fitness%2Chealth

const url = `${this.API_URL}/routines${queryString}`;

// O convertir a HttpParams
const params = new QueryParamsBuilder()
 .add("page", 1)
 .add("limit", 10)
 .toHttpParams();

this.http.get(url, { params });
```

#### 5.4 Empty State Component

**Descripción**: Componente para mostrar estados vacíos con acciones sugeridas.

**Ubicación**: `src/app/shared/components/ui/empty-state/empty-state.ts`

```typescript
@Component({
 selector: "app-empty-state",
 standalone: true,
 imports: [CommonModule],
 template: `
 <div class="c-empty-state" [class]="'c-empty-state--' + size()">
 <div class="c-empty-state__icon">{{ icon() || "" }}</div>
 <h3 class="c-empty-state__title">{{ title() }}</h3>
 <p class="c-empty-state__message">{{ message() }}</p>

 @if (actionLabel()) {
 <button
 class="c-empty-state__action c-button c-button--primary"
 (click)="actionClicked.emit()"
 >
 {{ actionLabel() }}
 </button>
 }
 </div>
 `,
})
export class EmptyState {
 icon = input<string>("");
 title = input.required<string>();
 message = input.required<string>();
 actionLabel = input<string>("");
 size = input<"small" | "medium" | "large">("medium");
 actionClicked = output<void>();
}
```

**Uso**:

```html
@if (exercises().length === 0 && !isLoading() && !error()) {
<app-empty-state
 icon=""
 title="No hay ejercicios programados"
 message="Aún no tienes ejercicios en tu rutina. Comienza agregando tu primer ejercicio."
 actionLabel="Crear rutina"
 size="large"
 (actionClicked)="createRoutine()"
/>
}
```

**Integración**: Utilizado en Training (`training.ts`) y Nutrition (`nutrition.ts`) para mostrar estados sin datos.

#### 5.5 Catálogo de Servicios HTTP

| Servicio | Endpoints | Descripción |
| -------------------- | ----------------------------------------------- | ------------------------- |
| **AuthService** | `/auth/login`, `/auth/register`, `/auth/logout` | Autenticación JWT |
| **TrainingService** | `/exercises`, `/routines` | Gestión de entrenamientos |
| **NutritionService** | `/meals`, `/foods`, `/daily-nutrition` | Gestión de nutrición |
| **ProgressService** | `/progress`, `/progress/history` | Seguimiento de progreso |
| **UsuarioService** | `/usuarios`, `/usuarios/{id}` | Gestión de usuarios |

**Ejemplo completo - NutritionService**:

```typescript
export interface DailyNutrition {
 date: string;
 meals: Meal[];
 totals: {
 calories: number;
 protein: number;
 carbs: number;
 fats: number;
 };
}

export interface Meal {
 id: number;
 type: string;
 foods: Food[];
 totals: {
 calories: number;
 protein: number;
 carbs: number;
 fats: number;
 };
}

@Injectable({ providedIn: "root" })
export class NutritionService extends BaseHttpService {
 private readonly API_URL = `${environment.apiUrl}/nutrition`;

 getDailyNutrition(userId: number, date: string): Observable<DailyNutrition> {
 const queryString = new QueryParamsBuilder()
 .add("userId", userId)
 .add("date", date)
 .build();

 return this.get<DailyNutrition>(`${this.API_URL}/daily${queryString}`);
 }

 addMeal(userId: number, meal: Meal): Observable<Meal> {
 return this.post<Meal>(`${this.API_URL}/meals`, { userId, ...meal });
 }

 getFoodList(): Observable<Food[]> {
 return this.get<Food[]>(`${this.API_URL}/foods`);
 }
}
```

---

#### 5.6 FormData para Upload de Archivos

**Descripción**: Manejo de subida de archivos usando `FormData`.

**Características**:

- Subida de imágenes de perfil
- Múltiples archivos
- Progress tracking
- Validación de tipos y tamaño

**Servicio de Upload**:

```typescript
@Injectable({ providedIn: "root" })
export class UploadService extends BaseHttpService {
 private readonly API_URL = `${environment.apiUrl}/upload`;

 /**
 * Subir imagen de perfil
 */
 uploadProfileImage(file: File, userId: number): Observable<{ url: string }> {
 const formData = new FormData();
 formData.append("file", file, file.name);
 formData.append("userId", userId.toString());
 formData.append("type", "profile");

 return this.http
 .post<{ url: string }>(
 `${this.API_URL}/profile-image`,
 formData
 // No se especifica Content-Type, el navegador lo hace automáticamente con boundary
 )
 .pipe(retry(1), catchError(this.handleError));
 }

 /**
 * Subir múltiples imágenes de progreso
 */
 uploadProgressImages(
 files: File[],
 userId: number,
 date: string
 ): Observable<{ urls: string[] }> {
 const formData = new FormData();

 // Agregar múltiples archivos
 files.forEach((file, index) => {
 formData.append(`files[${index}]`, file, file.name);
 });

 formData.append("userId", userId.toString());
 formData.append("date", date);
 formData.append("type", "progress");

 return this.http
 .post<{ urls: string[] }>(`${this.API_URL}/progress-images`, formData)
 .pipe(retry(1), catchError(this.handleError));
 }

 /**
 * Subir con seguimiento de progreso
 */
 uploadWithProgress(
 file: File,
 userId: number
 ): Observable<HttpEvent<{ url: string }>> {
 const formData = new FormData();
 formData.append("file", file, file.name);
 formData.append("userId", userId.toString());

 const req = new HttpRequest(
 "POST",
 `${this.API_URL}/profile-image`,
 formData,
 {
 reportProgress: true, // Habilita eventos de progreso
 }
 );

 return this.http.request<{ url: string }>(req);
 }
}
```

**Uso en Componente**:

```typescript
export class ProfileSettings {
 private uploadService = inject(UploadService);
 private toastService = inject(ToastService);

 uploadProgress = signal(0);
 isUploading = signal(false);

 onFileSelected(event: Event): void {
 const input = event.target as HTMLInputElement;
 if (!input.files || input.files.length === 0) return;

 const file = input.files[0];

 // Validaciones
 if (!this.validateFile(file)) return;

 this.uploadFile(file);
 }

 private validateFile(file: File): boolean {
 // Validar tipo
 const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
 if (!allowedTypes.includes(file.type)) {
 this.toastService.error("Solo se permiten imágenes JPG, PNG o WebP");
 return false;
 }

 // Validar tamaño (5MB máximo)
 const maxSize = 5 * 1024 * 1024; // 5MB en bytes
 if (file.size > maxSize) {
 this.toastService.error("La imagen no puede superar los 5MB");
 return false;
 }

 return true;
 }

 private uploadFile(file: File): void {
 this.isUploading.set(true);
 this.uploadProgress.set(0);

 const userId = 1; // Obtener del AuthService

 this.uploadService.uploadWithProgress(file, userId).subscribe({
 next: (event) => {
 if (event.type === HttpEventType.UploadProgress) {
 // Actualizar progreso
 const progress = event.total
 ? Math.round((100 * event.loaded) / event.total)
 : 0;
 this.uploadProgress.set(progress);
 } else if (event.type === HttpEventType.Response) {
 // Upload completado
 const imageUrl = event.body?.url;
 this.toastService.success("Imagen subida correctamente");
 this.updateProfileImage(imageUrl);
 }
 },
 error: (error) => {
 this.toastService.error("Error al subir la imagen");
 this.isUploading.set(false);
 },
 complete: () => {
 this.isUploading.set(false);
 },
 });
 }

 private updateProfileImage(url: string | undefined): void {
 if (!url) return;
 // Actualizar la imagen en el estado del usuario
 }
}
```

**Template con preview**:

```html
<div class="upload-container">
 <input
 #fileInput
 type="file"
 accept="image/jpeg,image/png,image/webp"
 (change)="onFileSelected($event)"
 hidden
 />

 <button
 class="c-button c-button--secondary"
 (click)="fileInput.click()"
 [disabled]="isUploading()"
 >
 @if (isUploading()) { Subiendo... {{ uploadProgress() }}% } @else {
 Seleccionar imagen }
 </button>

 @if (isUploading()) {
 <div class="progress-bar">
 <div class="progress-bar__fill" [style.width.%]="uploadProgress()"></div>
 </div>
 }
</div>
```

**Validación en Backend** (Spring Boot):

```java
@PostMapping("/upload/profile-image")
public ResponseEntity<?> uploadProfileImage(
 @RequestParam("file") MultipartFile file,
 @RequestParam("userId") Long userId
) {
 // Validar tipo de archivo
 String contentType = file.getContentType();
 if (!Arrays.asList("image/jpeg", "image/png", "image/webp").contains(contentType)) {
 return ResponseEntity.badRequest().body("Tipo de archivo no permitido");
 }

 // Validar tamaño (5MB)
 if (file.getSize() > 5 * 1024 * 1024) {
 return ResponseEntity.badRequest().body("Archivo demasiado grande");
 }

 // Procesar y guardar archivo
 String url = fileStorageService.save(file, userId);
 return ResponseEntity.ok(Map.of("url", url));
}
```

---

#### 5.7 Headers Personalizados en Peticiones HTTP

**Descripción**: Configuración de headers específicos para peticiones individuales o globales.

**Headers comunes**:

```typescript
export class CustomHeadersService extends BaseHttpService {
 private readonly API_URL = `${environment.apiUrl}/api`;

 /**
 * Agregar header personalizado a una petición específica
 */
 getWithCustomHeader(): Observable<any> {
 const headers = new HttpHeaders({
 "X-Custom-Header": "custom-value",
 "X-Request-ID": this.generateRequestId(),
 });

 return this.http.get(this.API_URL, { headers });
 }

 /**
 * Headers para versionado de API
 */
 getWithApiVersion(version: string): Observable<any> {
 const headers = new HttpHeaders({
 Accept: `application/vnd.cofira.v${version}+json`,
 "X-API-Version": version,
 });

 return this.http.get(this.API_URL, { headers });
 }

 /**
 * Headers para idioma/localización
 */
 getWithLocale(locale: string): Observable<any> {
 const headers = new HttpHeaders({
 "Accept-Language": locale,
 "X-User-Locale": locale,
 });

 return this.http.get(this.API_URL, { headers });
 }

 /**
 * Headers para cache control
 */
 getWithCacheControl(): Observable<any> {
 const headers = new HttpHeaders({
 "Cache-Control": "no-cache, no-store, must-revalidate",
 Pragma: "no-cache",
 Expires: "0",
 });

 return this.http.get(this.API_URL, { headers });
 }

 /**
 * Headers para peticiones de GraphQL
 */
 graphqlQuery(query: string, variables: any): Observable<any> {
 const headers = new HttpHeaders({
 "Content-Type": "application/json",
 "X-Request-Type": "graphql",
 });

 return this.http.post(
 `${this.API_URL}/graphql`,
 { query, variables },
 { headers }
 );
 }

 /**
 * Headers para CORS preflight
 */
 getWithCorsHeaders(): Observable<any> {
 const headers = new HttpHeaders({
 "Access-Control-Request-Method": "GET",
 "Access-Control-Request-Headers": "Content-Type, Authorization",
 Origin: window.location.origin,
 });

 return this.http.get(this.API_URL, { headers });
 }

 private generateRequestId(): string {
 return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
 }
}
```

**Interceptor para Headers Globales**:

```typescript
export const customHeadersInterceptor: HttpInterceptorFn = (req, next) => {
 const headers: Record<string, string> = {
 "X-App-Version": environment.version,
 "X-Platform": "web",
 "X-Device-ID": getDeviceId(),
 "X-Timestamp": new Date().toISOString(),
 };

 // Agregar header de idioma desde servicio
 const locale = localStorage.getItem("locale") || "es";
 headers["Accept-Language"] = locale;

 // Clonar request con headers adicionales
 const modifiedReq = req.clone({
 setHeaders: headers,
 });

 return next(modifiedReq);
};

function getDeviceId(): string {
 let deviceId = localStorage.getItem("deviceId");
 if (!deviceId) {
 deviceId = `device-${Date.now()}-${Math.random()
 .toString(36)
 .substr(2, 9)}`;
 localStorage.setItem("deviceId", deviceId);
 }
 return deviceId;
}
```

**Configuración en app.config.ts**:

```typescript
export const appConfig: ApplicationConfig = {
 providers: [
 provideHttpClient(
 withInterceptors([
 authInterceptor, // 1. JWT token
 customHeadersInterceptor, // 2. Headers globales
 loadingInterceptor, // 3. Loading states
 errorInterceptor, // 4. Error handling
 loggingInterceptor, // 5. Logging
 ])
 ),
 ],
};
```

**Uso avanzado - Headers condicionales**:

```typescript
export class AdvancedHttpService extends BaseHttpService {
 /**
 * Headers diferentes según tipo de petición
 */
 request<T>(
 method: string,
 url: string,
 body?: any,
 options?: {
 customHeaders?: Record<string, string>;
 skipAuth?: boolean;
 skipLoading?: boolean;
 }
 ): Observable<T> {
 let headers = new HttpHeaders();

 // Headers personalizados
 if (options?.customHeaders) {
 Object.entries(options.customHeaders).forEach(([key, value]) => {
 headers = headers.set(key, value);
 });
 }

 // Context para controlar interceptors
 let context = new HttpContext();
 if (options?.skipAuth) {
 context = context.set(SKIP_AUTH, true);
 }
 if (options?.skipLoading) {
 context = context.set(SKIP_LOADING, true);
 }

 return this.http.request<T>(method, url, {
 body,
 headers,
 context,
 });
 }
}

// Tokens de contexto
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);
```

**Interceptor que respeta el contexto**:

```typescript
export const smartAuthInterceptor: HttpInterceptorFn = (req, next) => {
 // Verificar si debe saltarse la autenticación
 if (req.context.get(SKIP_AUTH)) {
 return next(req);
 }

 const authService = inject(AuthService);
 const token = authService.getToken();

 if (token) {
 req = req.clone({
 setHeaders: {
 Authorization: `Bearer ${token}`,
 },
 });
 }

 return next(req);
};
```

**Ejemplo de uso completo**:

```typescript
export class UserService extends AdvancedHttpService {
 // Petición pública sin auth
 getPublicData(): Observable<any> {
 return this.request("GET", "/api/public", null, {
 skipAuth: true,
 customHeaders: {
 "X-Public-Access": "true",
 },
 });
 }

 // Petición con headers específicos
 exportUserData(userId: number, format: string): Observable<Blob> {
 return this.http.get(`/api/users/${userId}/export`, {
 headers: new HttpHeaders({
 Accept: format === "pdf" ? "application/pdf" : "text/csv",
 "X-Export-Format": format,
 }),
 responseType: "blob",
 });
 }
}
```

---

## Testing

### Configuración de Testing

COFIRA utiliza **Jasmine** como framework de testing y **Karma** como test runner.

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Ver reporte de coverage
open coverage/cofira-app/index.html
```

### Coverage Actual

**45.44%** de cobertura total (objetivo: >50%)

| Métrica | Porcentaje |
| ---------- | ---------- |
| Statements | 45.44% |
| Branches | 32.18% |
| Functions | 38.92% |
| Lines | 44.87% |

### Estrategia de Testing

#### Componentes UI

```typescript
describe("AccordionItem", () => {
 let component: AccordionItem;
 let fixture: ComponentFixture<AccordionItem>;

 beforeEach(async () => {
 await TestBed.configureTestingModule({
 imports: [AccordionItem],
 }).compileComponents();

 fixture = TestBed.createComponent(AccordionItem);
 component = fixture.componentInstance;
 fixture.componentRef.setInput("title", "Test Title");
 });

 it("should create", () => {
 expect(component).toBeTruthy();
 });

 it("should toggle open state on click", () => {
 expect(component.isOpen()).toBe(false);
 component.toggle();
 expect(component.isOpen()).toBe(true);
 component.toggle();
 expect(component.isOpen()).toBe(false);
 });

 it("should render title correctly", () => {
 fixture.detectChanges();
 const button = fixture.nativeElement.querySelector(
 ".c-accordion-item__header"
 );
 expect(button.textContent).toContain("Test Title");
 });
});
```

#### Validadores

```typescript
describe("Date Validators", () => {
 describe("futureDateValidator", () => {
 it("should return null for future dates", () => {
 const control = new FormControl("2030-01-01");
 const result = futureDateValidator()(control);
 expect(result).toBeNull();
 });

 it("should return error for past dates", () => {
 const control = new FormControl("2020-01-01");
 const result = futureDateValidator()(control);
 expect(result).toEqual({ futureDate: true });
 });
 });
});
```

#### Servicios

```typescript
describe("TrainingService", () => {
 let service: TrainingService;
 let httpMock: HttpTestingController;

 beforeEach(() => {
 TestBed.configureTestingModule({
 imports: [HttpClientTestingModule],
 providers: [TrainingService, LoadingService],
 });
 service = TestBed.inject(TrainingService);
 httpMock = TestBed.inject(HttpTestingController);
 });

 it("should fetch exercises", () => {
 const mockExercises: Exercise[] = [{ id: 1, name: "Push-ups", reps: 10 }];

 service.listarEjercicios().subscribe((exercises) => {
 expect(exercises.length).toBe(1);
 expect(exercises).toEqual(mockExercises);
 });

 const req = httpMock.expectOne(`${environment.apiUrl}/exercises`);
 expect(req.request.method).toBe("GET");
 req.flush(mockExercises);
 });

 afterEach(() => {
 httpMock.verify();
 });
});
```

#### Guards y Resolvers

```typescript
describe("authGuard", () => {
 let authService: jasmine.SpyObj<AuthService>;
 let router: jasmine.SpyObj<Router>;

 beforeEach(() => {
 authService = jasmine.createSpyObj("AuthService", ["isLoggedIn"]);
 router = jasmine.createSpyObj("Router", ["navigate"]);

 TestBed.configureTestingModule({
 providers: [
 { provide: AuthService, useValue: authService },
 { provide: Router, useValue: router },
 ],
 });
 });

 it("should allow navigation when logged in", () => {
 authService.isLoggedIn.and.returnValue(true);
 const result = TestBed.runInInjectionContext(() =>
 authGuard({} as any, { url: "/test" } as any)
 );
 expect(result).toBe(true);
 });

 it("should redirect to login when not logged in", () => {
 authService.isLoggedIn.and.returnValue(false);
 const result = TestBed.runInInjectionContext(() =>
 authGuard({} as any, { url: "/test" } as any)
 );
 expect(result).toBe(false);
 expect(router.navigate).toHaveBeenCalledWith(["/login"], {
 queryParams: { returnUrl: "/test" },
 });
 });
});
```

### Documentación de Testing

Ver archivos adicionales:

- `TESTING.md` - Guía completa de testing
- `TEST_SUMMARY.md` - Resumen de tests ejecutados
- `QUICK_TEST_GUIDE.md` - Guía rápida de comandos

---

## Estructura del Proyecto

```
cofira-app/
 src/
 app/
 core/ # Servicios singleton
 auth/
 auth.service.ts # Servicio de autenticación JWT
 guards/
 auth-guard.ts # Guard de autenticación
 can-deactivate.guard.ts # Guard de navegación con cambios
 interceptors/
 auth.interceptor.ts # Interceptor de tokens JWT
 loading.interceptor.ts # Interceptor de loading states
 error.interceptor.ts # Interceptor de errores HTTP
 logging.interceptor.ts # Interceptor de logging
 services/
 base-http.service.ts # Servicio base para HTTP
 loading.service.ts # Servicio de loading global
 toast.service.ts # Servicio de notificaciones
 modal.service.ts # Servicio de modales
 theme.service.ts # Servicio de tema claro/oscuro
 form-error-messages.service.ts # Mensajes de error
 utils/
 query-params.util.ts # Builder de query strings
 features/ # Módulos de features
 auth/
 login/
 register/
 reset-password/
 home/
 home.ts # Página principal con Accordion
 components/
 hero-section/
 pricing-plans/
 newsletter-form/
 training/
 training.ts # Página de entrenamiento
 resolvers/
 training.resolver.ts
 services/
 training.service.ts
 components/
 nutrition/
 nutrition.ts # Página de nutrición
 resolvers/
 nutrition.resolver.ts
 services/
 nutrition.service.ts
 components/
 daily-menu/
 add-meal-form/
 nutrient-counter/
 progress/
 progress.ts
 services/
 components/
 preferences/
 preferences.ts # Página con Tabs
 services/
 onboarding/ # Flujo multi-paso
 onboarding-container/
 steps/
 shared/ # Componentes compartidos
 components/
 header/ # Header con tooltips
 footer/
 breadcrumbs/
 loading-spinner/
 toast-container/
 modal/
 not-found/
 ui/ # Biblioteca de componentes UI
 accordion/ # Fase 1
 tabs/ # Fase 1
 empty-state/ # Fase 5
 password-strength/ # Fase 3
 searchable-tags/
 dynamic-form-array-example/
 directives/
 tooltip.directive.ts # Fase 1
 click-outside.directive.ts # Fase 1
 validators/ # Fase 3
 password-strength.validator.ts
 cross-field.validators.ts
 async-validators.service.ts
 date.validators.ts
 range.validators.ts
 form-array.validators.ts
 app.routes.ts # Configuración de rutas Fase 4
 app.config.ts # Configuración global
 app.ts # Componente raíz
 styles/ # Estilos globales SCSS
 settings/ # Variables
 tools/ # Mixins y funciones
 generic/ # Reset y normalize
 elements/ # Estilos base HTML
 objects/ # Layouts (container, grid)
 components/ # Componentes globales
 _buttons.scss
 _forms.scss
 _tooltip.scss # Fase 1
 _accordion.scss # Fase 1
 _tabs.scss # Fase 1
 utilities/ # Utilidades
 assets/ # Recursos estáticos
 environments/ # Variables de entorno
 index.html # HTML principal
 db.json # Base de datos mock
 angular.json # Configuración Angular CLI
 tsconfig.json # Configuración TypeScript
 package.json # Dependencias npm
 README.md # Este archivo
 BACKEND_INTEGRATION.md # Guía de integración backend
 TESTING.md # Guía de testing
 TEST_SUMMARY.md # Resumen de tests
 QUICK_TEST_GUIDE.md # Guía rápida de testing
```

---

## Contribución

### Convenciones de Código

#### Nomenclatura

- **Componentes**: PascalCase (e.g., `AccordionItem`)
- **Servicios**: PascalCase + `Service` (e.g., `AuthService`)
- **Interfaces**: PascalCase (e.g., `Exercise`, `User`)
- **Variables/Funciones**: camelCase (e.g., `getUserData`)
- **Constantes**: UPPER_SNAKE_CASE (e.g., `API_URL`)

#### CSS/SCSS

Metodología **BEM** (Block\_\_Element--Modifier):

```scss
.c-accordion {
 // Block (componente)
 &__item {
 // Element
 &--open {
 // Modifier
 // estilos
 }
 }
}
```

Prefijos:

- `c-` para componentes
- `o-` para objetos/layouts
- `u-` para utilidades
- `is-` / `has-` para estados

#### TypeScript

```typescript
// Usar signals para estado local
count = signal(0);

// Usar input() para props
data = input.required<DataType>();

// Usar output() para eventos
clicked = output<void>();

// Usar inject() para DI
private router = inject(Router);

// Tipar siempre los Observables
getUsers(): Observable<User[]> {
 return this.http.get<User[]>(this.API_URL);
}
```

### Proceso de Desarrollo

1. **Crear rama** desde `main`:

 ```bash
 git checkout -b feature/nueva-funcionalidad
 ```

2. **Desarrollar** siguiendo las convenciones

3. **Testear**:

 ```bash
 npm test
 npm run test:coverage
 ```

4. **Commit** con mensajes descriptivos:

 ```bash
 git commit -m "feat: agregar componente Carousel"
 git commit -m "fix: corregir validación de email"
 git commit -m "docs: actualizar README con ejemplos"
 ```

5. **Push** y crear Pull Request:
 ```bash
 git push origin feature/nueva-funcionalidad
 ```

### Convenciones de Commits

Seguir el formato [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `style:` Formateo de código
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

---

## Autores

Desarrollado como proyecto académico para el módulo de Desarrollo Web en Entornos Cliente (DWEC).

---

## Enlaces Útiles

- [Angular Documentation](https://angular.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

---

## Notas Adicionales

### Variables de Entorno

Configurar `src/environments/environment.ts`:

```typescript
export const environment = {
 production: false,
 apiUrl: "http://localhost:8080/api",
};
```

Para producción (`environment.prod.ts`):

```typescript
export const environment = {
 production: true,
 apiUrl: "https://api.cofira.com",
};
```

### Comandos Útiles

```bash
# Generar componente
ng generate component features/nueva-feature --standalone

# Generar servicio
ng generate service core/services/nuevo-servicio

# Generar guard
ng generate guard core/guards/nuevo-guard --functional

# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Build de producción
ng build --configuration production

# Analizar tamaño del bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/cofira-app/stats.json
```

---

<div align="center">

**¿Preguntas o sugerencias?**

Abre un issue o contacta con el equipo de desarrollo.

</div>
