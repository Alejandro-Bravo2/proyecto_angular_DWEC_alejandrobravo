# COFIRA - Frontend Angular

Aplicacion de gestion de fitness y nutricion desarrollada con Angular 20.

## Inicio Rapido

```bash
npm install
npm start          # Servidor de desarrollo en http://localhost:4200
npm run build      # Build de produccion
npm test           # Tests con Karma
```

---

## Sistema de Rutas y Navegacion

### Mapa de Rutas

| Ruta | Descripcion | Lazy | Guards | Resolver |
|------|-------------|------|--------|----------|
| `/` | Pagina de inicio | Si | `authGuard`, `onboardingGuard` | - |
| `/login` | Inicio de sesion | Si | - | - |
| `/register` | Registro de usuario | Si | `canDeactivateGuard` | - |
| `/reset-password` | Restablecer contrasena | Si | - | - |
| `/onboarding` | Configuracion inicial | Si | `authGuard`, `skipIfOnboardedGuard` | - |
| `/entrenamiento` | Listado de entrenamientos | Si | `authGuard`, `onboardingGuard` | `trainingResolver` |
| `/entrenamiento/:id` | Detalle de ejercicio | Si | `authGuard`, `onboardingGuard` | `exerciseDetailResolver` |
| `/alimentacion` | Planificacion nutricional | Si | `authGuard`, `onboardingGuard` | `nutritionResolver` |
| `/seguimiento` | Seguimiento de progreso | Si | `authGuard`, `onboardingGuard` | - |
| `/preferencias` | Layout de preferencias | Si | `authGuard`, `onboardingGuard` | - |
| `/preferencias/alimentacion` | Preferencias de alimentacion | Si | (heredado) | - |
| `/preferencias/cuenta` | Configuracion de cuenta | Si | `canDeactivateGuard` | - |
| `/preferencias/notificaciones` | Notificaciones | Si | (heredado) | - |
| `**` | Pagina 404 | Si | - | - |

### Rutas con Parametros

Las rutas con parametros permiten acceder a recursos especificos mediante su ID:

```typescript
// Definicion en app.routes.ts
{
  path: 'entrenamiento/:id',
  loadComponent: () => import('./features/training/components/exercise-detail/exercise-detail')
    .then(m => m.ExerciseDetail),
  resolve: { exercise: exerciseDetailResolver }
}

// Navegacion desde un componente
this.router.navigate(['/entrenamiento', exerciseId]);

// Lectura del parametro en el componente destino
this.route.paramMap.subscribe(params => {
  const id = params.get('id');
});
```

### Rutas Hijas Anidadas

La seccion de preferencias demuestra el uso de rutas hijas con `children` y `<router-outlet>` interno:

```typescript
{
  path: 'preferencias',
  loadComponent: () => import('./features/preferences/preferences-layout/preferences-layout')
    .then(m => m.PreferencesLayout),
  children: [
    { path: '', pathMatch: 'full', redirectTo: 'alimentacion' },
    { path: 'alimentacion', loadComponent: () => import('...').then(m => m.PreferencesNutrition) },
    { path: 'cuenta', loadComponent: () => import('...').then(m => m.PreferencesAccount) },
    { path: 'notificaciones', loadComponent: () => import('...').then(m => m.PreferencesNotifications) }
  ]
}
```

El layout de preferencias contiene la navegacion entre rutas hijas:

```html
<!-- preferences-layout.html -->
<nav>
  <a routerLink="alimentacion" routerLinkActive="active">Alimentacion</a>
  <a routerLink="cuenta" routerLinkActive="active">Cuenta</a>
  <a routerLink="notificaciones" routerLinkActive="active">Notificaciones</a>
</nav>
<router-outlet></router-outlet>
```

### Estrategia de Lazy Loading

Todas las rutas usan carga perezosa con `loadComponent()` para reducir el bundle inicial:

```typescript
// app.config.ts
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)  // Precarga en segundo plano
    )
  ]
};
```

Para verificar el chunking en produccion:

```bash
npm run build
# Revisar dist/cofira-app/browser/*.js
# Cada feature lazy genera su propio chunk
```

---

## Guards Implementados

### authGuard (CanActivateFn)

Protege rutas privadas. Si el usuario no esta autenticado, redirige a `/login` con `returnUrl`:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

### canDeactivateGuard (CanDeactivateFn)

Previene salir de formularios con cambios sin guardar:

```typescript
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.canDeactivate) {
    return component.canDeactivate();
  }
  return true;
};

// En el componente
export class RegisterComponent implements CanComponentDeactivate {
  canDeactivate(): boolean {
    if (this.form.dirty) {
      return confirm('Tienes cambios sin guardar. Salir?');
    }
    return true;
  }
}
```

### onboardingGuard

Redirige a `/onboarding` si el usuario no ha completado la configuracion inicial.

### skipIfOnboardedGuard

Evita acceder a `/onboarding` si ya se completo.

---

## Resolvers Implementados

### trainingResolver

Precarga la lista de ejercicios antes de activar `/entrenamiento`:

```typescript
export const trainingResolver: ResolveFn<EjerciciosDTO[]> = (route, state) => {
  const trainingService = inject(TrainingService);
  const loadingService = inject(LoadingService);

  loadingService.show();

  return trainingService.listarEjercicios().pipe(
    catchError(() => of([])),
    finalize(() => loadingService.hide())
  );
};
```

### nutritionResolver

Precarga la lista de alimentos antes de activar `/alimentacion`.

### exerciseDetailResolver

Precarga un ejercicio especifico por ID. En caso de error, redirige a la lista:

```typescript
export const exerciseDetailResolver: ResolveFn<EjerciciosDTO | null> = (route, state) => {
  const trainingService = inject(TrainingService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  return trainingService.obtenerEjercicio(Number(id)).pipe(
    catchError(() => {
      router.navigate(['/entrenamiento'], {
        state: { error: `No existe el ejercicio con id ${id}` }
      });
      return of(null);
    })
  );
};
```

---

## Navegacion Programatica

### Navegacion basica

```typescript
// Navegacion absoluta
this.router.navigate(['/entrenamiento']);

// Navegacion con parametros
this.router.navigate(['/entrenamiento', exerciseId]);

// Navegacion con URL completa
this.router.navigateByUrl('/entrenamiento/5');
```

### Query params y fragments

```typescript
// Navegar con query params
this.router.navigate(['/preferencias/cuenta'], {
  queryParams: { action: 'change-password' },
  fragment: 'security'
});
// Resultado: /preferencias/cuenta?action=change-password#security

// Leer query params en destino
this.route.snapshot.queryParamMap.get('action');
```

### NavigationExtras con state

```typescript
// Pasar datos sin exponerlos en la URL
this.router.navigate(['/entrenamiento'], {
  state: { error: 'Mensaje de error' }
});

// Leer el state en el componente destino
const nav = this.router.getCurrentNavigation();
const error = nav?.extras.state?.['error'];
```

---

## Breadcrumbs Dinamicos

El componente `Breadcrumbs` genera las migas automaticamente a partir de `data.breadcrumb`:

```typescript
// En las rutas
{ path: 'entrenamiento', data: { breadcrumb: 'Entrenamiento' } }

// El servicio escucha NavigationEnd y reconstruye las migas
this.router.events.pipe(
  filter(event => event instanceof NavigationEnd),
  map(() => this.buildBreadcrumbs(this.activatedRoute.root))
);
```

---

## Pagina 404

La ruta wildcard `**` captura cualquier URL no reconocida:

```typescript
{
  path: '**',
  loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFound)
}
```

La pagina 404 incluye:
- Visualizacion de la URL solicitada
- Boton para volver atras
- Enlace al inicio
- Sugerencias de navegacion

---

## Estructura de Archivos de Rutas

```
src/app/
├── app.routes.ts                    # Configuracion principal de rutas
├── app.config.ts                    # Configuracion con PreloadAllModules
├── core/
│   └── guards/
│       ├── auth-guard.ts            # Guard de autenticacion
│       ├── can-deactivate.guard.ts  # Guard de formularios
│       └── onboarding.guard.ts      # Guards de onboarding
├── features/
│   ├── training/
│   │   ├── resolvers/
│   │   │   ├── training.resolver.ts
│   │   │   └── exercise-detail.resolver.ts
│   │   └── components/
│   │       └── exercise-detail/     # Componente para ruta con :id
│   ├── nutrition/
│   │   └── resolvers/
│   │       └── nutrition.resolver.ts
│   └── preferences/
│       ├── preferences-layout/      # Layout con router-outlet
│       └── pages/
│           ├── preferences-nutrition/
│           ├── preferences-account/
│           └── preferences-notifications/
└── shared/
    └── components/
        ├── breadcrumbs/             # Breadcrumbs dinamicos
        └── not-found/               # Pagina 404
```

---

## Fase 6: Gestion de Estado y Actualizacion Dinamica

### 6.1 Actualizacion Dinamica sin Recargas

COFIRA implementa actualizacion dinamica de datos utilizando **Stores de dominio** basados en Signals de Angular. Cuando el usuario realiza operaciones CRUD, los cambios se reflejan inmediatamente en la UI sin necesidad de recargar la pagina.

#### 6.1.1 Operaciones CRUD en Tiempo Real

Cada store implementa metodos para crear, leer, actualizar y eliminar entidades:

```typescript
// TrainingStore - Operaciones CRUD
@Injectable({ providedIn: 'root' })
export class TrainingStore {
  private readonly _exercises = signal<Exercise[]>([]);

  // CREATE - Agregar ejercicio
  add(exercise: Exercise): void {
    this._exercises.update(list => [...list, exercise]);
    this.toastService.success('Ejercicio agregado');
  }

  // UPDATE - Actualizar ejercicio existente
  update(updated: Exercise): void {
    this._exercises.update(list =>
      list.map(e => e.id === updated.id ? updated : e)
    );
  }

  // DELETE - Eliminar ejercicio
  remove(id: string): void {
    this._exercises.update(list => list.filter(e => e.id !== id));
    this.toastService.success('Ejercicio eliminado');
  }

  // READ - Los componentes leen mediante computed()
  readonly paginatedExercises = computed(() => {
    const filtered = this.filteredExercises();
    const start = (this._currentPage() - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });
}
```

#### 6.1.2 Contadores y Estadisticas Derivadas

Los stores calculan estadisticas en tiempo real usando `computed()`:

```typescript
// TrainingStore - Contadores derivados
readonly totalExercises = computed(() => this._exercises().length);

readonly completedExercises = computed(() =>
  this._exercises().filter(e => e.completed).length
);

readonly completionPercentage = computed(() => {
  const total = this.totalExercises();
  if (total === 0) return 0;
  return Math.round((this.completedExercises() / total) * 100);
});

// NutritionStore - Macronutrientes del dia
readonly totalCalories = computed(() =>
  this._meals().reduce((sum, m) => sum + m.totalCalories, 0)
);

readonly totalProtein = computed(() =>
  this._meals().reduce((sum, m) => sum + m.totalProtein, 0)
);

readonly totalCarbs = computed(() =>
  this._meals().reduce((sum, m) => sum + m.totalCarbs, 0)
);

// ProgressStore - Volumen de entrenamiento
readonly totalVolume = computed(() =>
  this._progressEntries().reduce(
    (sum, e) => sum + (e.weight * e.reps * e.sets),
    0
  )
);

readonly caloriePercentage = computed(() => {
  const goal = this.calorieGoal();
  if (goal === 0) return 0;
  return Math.round((this.caloriesConsumed() / goal) * 100);
});
```

#### 6.1.3 Preservacion de Estado durante Navegacion

El estado se mantiene en memoria mientras el store existe (providedIn: 'root'):

```typescript
// El usuario puede navegar entre paginas y los datos persisten
// Ejemplo: ir de /entrenamiento a /alimentacion y volver

// En el componente
export class Training {
  private readonly store = inject(TrainingStore);

  // Al volver a la pagina, los ejercicios siguen en memoria
  exercises = this.store.paginatedExercises;
  currentPage = this.store.currentPage;
  searchTerm = this.store.searchTerm;
}
```

---

### 6.2 Patron de Gestion de Estado Elegido

COFIRA utiliza **Servicios con Signals** como patron de gestion de estado. Este enfoque combina la simplicidad de servicios Angular con la reactividad de Signals.

#### 6.2.1 Justificacion de la Eleccion

| Criterio | BehaviorSubject | Signals (elegido) | NgRx |
|----------|-----------------|-------------------|------|
| Curva de aprendizaje | Media | Baja | Alta |
| Boilerplate | Medio | Bajo | Alto |
| Debugging | Medio | Facil | DevTools |
| Integracion Angular | Buena | Nativa | Externa |
| Tamaño bundle | +0kb | +0kb | +50kb |
| Uso en templates | async pipe | directo () | async pipe |

**Por que NO NgRx:**
- COFIRA es una aplicacion de tamaño mediano
- NgRx anade complejidad innecesaria (actions, reducers, effects, selectors)
- El bundle se incrementaria ~50kb
- La curva de aprendizaje es significativa

**Por que NO BehaviorSubject puro:**
- Requiere `.pipe(takeUntilDestroyed())` en cada suscripcion
- El `async` pipe puede causar multiples suscripciones
- Signals tienen mejor integracion con change detection

**Por que SI Signals:**
- API nativa de Angular 17+
- Sintaxis simple: `signal()`, `computed()`, `effect()`
- Integracion perfecta con `ChangeDetectionStrategy.OnPush`
- Sin necesidad de unsubscribe (los signals no son observables)

#### 6.2.2 Arquitectura del Store

```
┌─────────────────────────────────────────────────────────┐
│                      COMPONENTE                         │
│  ┌───────────────┐    ┌───────────────┐                │
│  │ exercises()   │    │ searchControl │                │
│  │ loading()     │    │ (FormControl) │                │
│  └───────┬───────┘    └───────┬───────┘                │
│          │                    │                         │
│          │ lee                │ escribe                 │
│          ▼                    ▼                         │
├─────────────────────────────────────────────────────────┤
│                   TRAINING STORE                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ESTADO PRIVADO (solo el store puede modificar) │   │
│  │  _exercises = signal<Exercise[]>([])            │   │
│  │  _loading = signal(false)                       │   │
│  │  _searchTerm = signal('')                       │   │
│  │  _currentPage = signal(1)                       │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ESTADO PUBLICO (readonly para componentes)     │   │
│  │  exercises = this._exercises.asReadonly()       │   │
│  │  loading = this._loading.asReadonly()           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  COMPUTED (valores derivados automaticos)       │   │
│  │  filteredExercises = computed(() => ...)        │   │
│  │  paginatedExercises = computed(() => ...)       │   │
│  │  totalPages = computed(() => ...)               │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  METODOS (unica forma de modificar estado)      │   │
│  │  add(), update(), remove()                      │   │
│  │  setSearchTerm(), nextPage(), previousPage()    │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ llamadas HTTP
                         ▼
              ┌─────────────────────┐
              │  TRAINING SERVICE   │
              │  (HTTP client)      │
              └─────────────────────┘
```

---

### 6.3 Optimizacion de Rendimiento

#### 6.3.1 ChangeDetectionStrategy.OnPush

Todos los componentes de lista usan OnPush para evitar re-renders innecesarios:

```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-weekly-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,  // <-- Optimizacion
  templateUrl: './weekly-table.html',
  styleUrl: './weekly-table.scss'
})
export class WeeklyTable {
  exercises = input.required<Exercise[]>();
}
```

**Componentes con OnPush aplicado (12):**

| Componente | Ubicacion |
|------------|-----------|
| WeeklyTable | training/components/weekly-table/ |
| ExerciseRow | training/components/exercise-row/ |
| ProgressCard | training/components/progress-card/ |
| DailyMenu | nutrition/components/daily-menu/ |
| MealSection | nutrition/components/meal-section/ |
| FoodItem | nutrition/components/food-item/ |
| IngredientsModal | nutrition/components/ingredients-modal/ |
| NutritionDashboard | nutrition/components/nutrition-dashboard/ |
| WeeklyProgress | nutrition/components/weekly-progress/ |
| MacroChart | nutrition/components/macro-chart/ |
| NutrientCounter | progress/components/nutrient-counter/ |
| StrengthGainChart | progress/components/strength-gain-chart/ |

#### 6.3.2 trackBy en Iteraciones

Todos los `@for` incluyen `track` para optimizar el DOM diffing:

```html
<!-- Correcto: track por ID unico -->
@for (exercise of paginatedExercises(); track exercise.id) {
  <app-exercise-row [exercise]="exercise" />
}

<!-- Correcto: track por indice cuando no hay ID -->
@for (food of meal.foods; track $index) {
  <app-food-item [food]="food" />
}

<!-- Incorrecto: sin track (causa re-renders) -->
@for (item of items()) {
  <app-item [data]="item" />
}
```

#### 6.3.3 Gestion de Suscripciones con takeUntilDestroyed

Para suscripciones RxJS, usamos `takeUntilDestroyed()` para limpiar automaticamente:

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class Training {
  private readonly destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');

  constructor() {
    // La suscripcion se cancela automaticamente al destruir el componente
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.store.setSearchTerm(term ?? '');
    });
  }
}
```

#### 6.3.4 Lazy Loading y Code Splitting

Todas las features cargan bajo demanda:

```typescript
// app.routes.ts
{
  path: 'entrenamiento',
  loadComponent: () => import('./features/training/training')
    .then(m => m.Training),
  // El store se crea solo cuando se accede a la ruta
}
```

---

### 6.4 Paginacion

#### 6.4.1 Implementacion con Signals

La paginacion se implementa con signals computados:

```typescript
// En el store
readonly pageSize = 10;
private readonly _currentPage = signal(1);
readonly currentPage = this._currentPage.asReadonly();

readonly totalPages = computed(() =>
  Math.ceil(this.filteredExercises().length / this.pageSize)
);

readonly paginatedExercises = computed(() => {
  const filtered = this.filteredExercises();
  const start = (this._currentPage() - 1) * this.pageSize;
  return filtered.slice(start, start + this.pageSize);
});

nextPage(): void {
  if (this._currentPage() < this.totalPages()) {
    this._currentPage.update(p => p + 1);
  }
}

previousPage(): void {
  if (this._currentPage() > 1) {
    this._currentPage.update(p => p - 1);
  }
}

goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages()) {
    this._currentPage.set(page);
  }
}
```

#### 6.4.2 Template de Paginacion

```html
<!-- Controles de paginacion semanticos -->
@if (store.totalPages() > 1) {
  <nav class="pagination" aria-label="Paginacion de ejercicios">
    <button
      type="button"
      (click)="store.previousPage()"
      [disabled]="store.currentPage() === 1"
      class="pagination__btn"
      aria-label="Pagina anterior"
    >
      Anterior
    </button>

    <span class="pagination__info" aria-live="polite">
      Pagina {{ store.currentPage() }} de {{ store.totalPages() }}
    </span>

    <button
      type="button"
      (click)="store.nextPage()"
      [disabled]="store.currentPage() >= store.totalPages()"
      class="pagination__btn"
      aria-label="Pagina siguiente"
    >
      Siguiente
    </button>
  </nav>
}
```

#### 6.4.3 Paginacion vs Infinite Scroll

| Aspecto | Paginacion (elegida) | Infinite Scroll |
|---------|---------------------|-----------------|
| UX movil | Mejor control | Mas fluido |
| Accesibilidad | Mejor (navegacion clara) | Dificil |
| SEO | Mejor (URLs paginadas) | Problematico |
| Memoria | Controlada | Crece indefinidamente |
| Implementacion | Simple con signals | Requiere IntersectionObserver |
| Navegacion directa | Posible (ir a pagina X) | No posible |

**Justificacion:** Se eligio paginacion porque COFIRA muestra datos tabulares donde el usuario necesita navegar a registros especificos. El infinite scroll es mas adecuado para feeds sociales.

---

### 6.5 Busqueda y Filtrado en Tiempo Real

#### 6.5.1 Implementacion con Debounce

```typescript
export class Training {
  private readonly store = inject(TrainingStore);
  private readonly destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),           // Espera 300ms tras dejar de escribir
      distinctUntilChanged(),      // Solo emite si el valor cambio
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.store.setSearchTerm(term ?? '');
    });
  }
}
```

#### 6.5.2 Filtrado en el Store

```typescript
// TrainingStore
readonly filteredExercises = computed(() => {
  const term = this._searchTerm().toLowerCase().trim();
  const exercises = this._exercises();

  if (!term) return exercises;

  return exercises.filter(e =>
    e.name.toLowerCase().includes(term) ||
    e.reps.toLowerCase().includes(term)
  );
});

// Al buscar, resetear a pagina 1
setSearchTerm(term: string): void {
  this._searchTerm.set(term);
  this._currentPage.set(1);  // Importante: volver a pagina 1
}
```

#### 6.5.3 Template de Busqueda

```html
<search class="training__search">
  <input
    type="search"
    [formControl]="searchControl"
    placeholder="Buscar ejercicios..."
    class="training__search-input"
    aria-label="Buscar ejercicios"
  />
</search>

<!-- Feedback de resultados -->
@if (store.searchTerm() && !store.hasResults()) {
  <article class="training__no-results" role="status">
    <p>No se encontraron ejercicios para "{{ store.searchTerm() }}"</p>
    <button type="button" (click)="store.clearSearch()">
      Limpiar busqueda
    </button>
  </article>
}

<!-- Lista filtrada y paginada -->
<app-weekly-table [exercises]="store.paginatedExercises()" />
```

---

### 6.6 Estados de Carga (Loading States)

#### 6.6.1 Gestion en el Store

```typescript
// El store gestiona estados de carga
private readonly _loading = signal(false);
private readonly _error = signal<string | null>(null);

readonly loading = this._loading.asReadonly();
readonly error = this._error.asReadonly();
readonly isEmpty = computed(() =>
  this._exercises().length === 0 && !this._loading() && !this._error()
);

load(userId: string, date?: string): void {
  this._loading.set(true);   // Inicia carga
  this._error.set(null);     // Limpia errores previos

  this.trainingService.getExercises(userId, date).pipe(
    catchError(err => {
      this._error.set('Error al cargar los ejercicios');
      return of([]);
    }),
    finalize(() => this._loading.set(false))  // Termina carga
  ).subscribe(exercises => {
    this._exercises.set(exercises);
  });
}
```

#### 6.6.2 Template con Estados

```html
<article class="training">
  <!-- Estado: Cargando -->
  @if (store.loading()) {
    <section class="training__loading" aria-busy="true" aria-live="polite">
      <app-spinner />
      <p>Cargando ejercicios...</p>
    </section>
  }

  <!-- Estado: Error -->
  @else if (store.error()) {
    <section class="training__error" role="alert">
      <p>{{ store.error() }}</p>
      <button type="button" (click)="store.refresh(userId)">
        Reintentar
      </button>
    </section>
  }

  <!-- Estado: Vacio -->
  @else if (store.isEmpty()) {
    <app-empty-state
      title="Sin ejercicios"
      message="Anade tu primer ejercicio para comenzar"
      [showAddButton]="true"
      (addClick)="openAddModal()"
    />
  }

  <!-- Estado: Datos -->
  @else {
    <app-weekly-table [exercises]="store.paginatedExercises()" />
  }
</article>
```

---

### 6.7 WebSockets y Polling (Opcional)

COFIRA NO implementa WebSockets ni polling porque:

1. **Tipo de aplicacion**: Es una app de seguimiento personal, no colaborativa
2. **Patron de uso**: Un solo usuario edita sus propios datos
3. **Frecuencia de cambios**: Los datos no cambian externamente

**Cuando SI seria necesario:**
- Apps colaborativas (edicion en tiempo real)
- Dashboards con datos externos (bolsa, IoT)
- Chats o notificaciones push

**Alternativa implementada:**
- Refresh manual con boton "Actualizar"
- Pull-to-refresh en movil (futuro)

```typescript
// Si se necesitara polling en el futuro:
// startPolling(userId: string, intervalMs = 30000): void {
//   interval(intervalMs).pipe(
//     takeUntilDestroyed(this.destroyRef),
//     switchMap(() => this.service.getExercises(userId))
//   ).subscribe(exercises => {
//     this._exercises.set(exercises);
//   });
// }
```

---

### 6.8 Estructura de Archivos de Stores

```
src/app/
├── features/
│   ├── training/
│   │   ├── stores/
│   │   │   └── training.store.ts      # Store de entrenamientos
│   │   ├── services/
│   │   │   └── training.service.ts    # HTTP client
│   │   ├── components/
│   │   │   ├── weekly-table/          # OnPush
│   │   │   ├── exercise-row/          # OnPush
│   │   │   └── progress-card/         # OnPush
│   │   └── training.ts                # Componente principal
│   │
│   ├── nutrition/
│   │   ├── stores/
│   │   │   └── nutrition.store.ts     # Store de nutricion
│   │   ├── services/
│   │   │   └── nutrition.service.ts   # HTTP client
│   │   ├── components/
│   │   │   ├── daily-menu/            # OnPush
│   │   │   ├── meal-section/          # OnPush
│   │   │   ├── food-item/             # OnPush
│   │   │   ├── macro-chart/           # OnPush
│   │   │   ├── nutrition-dashboard/   # OnPush
│   │   │   └── weekly-progress/       # OnPush
│   │   └── nutrition.ts               # Componente principal
│   │
│   └── progress/
│       ├── stores/
│       │   └── progress.store.ts      # Store de progreso
│       ├── services/
│       │   └── progress.service.ts    # HTTP client
│       ├── components/
│       │   ├── nutrient-counter/      # OnPush
│       │   └── strength-gain-chart/   # OnPush
│       └── progress.ts                # Componente principal
```

---

### 6.9 Resumen de Cumplimiento de Requisitos

| Requisito | Estado | Implementacion |
|-----------|--------|----------------|
| Operaciones CRUD sin recargas | Implementado | TrainingStore.add/update/remove |
| Contadores derivados | Implementado | computed() en cada store |
| Preservar scroll al refrescar | Implementado | Estado en memoria del store |
| Patron de estado documentado | Implementado | Servicios + Signals |
| Comparativa BehaviorSubject/NgRx | Documentado | Seccion 6.2.1 |
| OnPush en componentes de lista | Implementado | 12 componentes |
| trackBy en @for | Implementado | track por id o $index |
| takeUntilDestroyed | Implementado | En componentes con suscripciones |
| Paginacion simple | Implementado | TrainingStore, NutritionStore, ProgressStore |
| Busqueda con debounce | Implementado | 300ms + distinctUntilChanged |
| Estados de carga | Implementado | loading, error, isEmpty signals |
| WebSockets/Polling | No aplica | Documentada justificacion |
