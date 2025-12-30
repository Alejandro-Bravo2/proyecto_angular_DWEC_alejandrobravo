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
