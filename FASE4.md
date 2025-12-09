FASE 4: SISTEMA DE RUTAS Y NAVEGACIÓN¶
Criterios: RA6.g, RA6.h

Entrega: 18 de diciembre (paralela a DIW Fases 1-2-3-4)

Objetivos:

Implementar sistema completo de navegación SPA con Angular Router. Las páginas usan los layouts que estás creando en DIW.

Tareas:

Configuración de rutas

Rutas principales (home, listado, detalle, formularios, about)

Rutas con parámetros (/producto/:id)
Rutas hijas anidadas
Ruta wildcard para 404
Navegación programática

Usar Router para navegación desde código

Pasar parámetros de ruta
Query params y fragments
NavigationExtras para estado
Lazy Loading

Módulos de funcionalidad con carga perezosa

Estrategia de precarga (PreloadAllModules)
Verificar chunking en build production
Route Guards

CanActivate para proteger rutas

Simular autenticación
Redirección si no autorizado
CanDeactivate para formularios con cambios sin guardar
Resolvers

Resolver para precargar datos antes de activar ruta

Loading state mientras resuelve
Manejo de errores en resolver
Breadcrumbs dinámicos

Generar breadcrumbs automáticamente desde rutas

Actualizar según navegación
Documentación

Mapa completo de rutas

Estrategia de lazy loading explicada
Guards y resolvers documentados
Entregables:

Sistema de rutas completo (mínimo 5 rutas principales)
Lazy loading en al menos 1 módulo
Route guards implementados
Resolver en al menos 1 ruta
Navegación funcional en toda la aplicación
Breadcrumbs dinámicos
Documentación de rutas
Tarea 1: Configuración de rutas¶
La configuración de rutas para este proyecto Angular puede quedar documentada así en tu README técnico.

Rutas principales¶
Define las rutas base de la SPA para home, listado, detalle genérico, formularios y about.^1

// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductListComponent } from './features/products/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail.component';
import { ProductFormComponent } from './features/products/product-form.component';
import { AboutComponent } from './features/about/about.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  { path: 'home', component: HomeComponent },
  { path: 'productos', component: ProductListComponent },
  { path: 'productos/nuevo', component: ProductFormComponent },
  { path: 'about', component: AboutComponent },

  // wildcard 404 siempre la última
  { path: '**', component: NotFoundComponent }
];
Rutas con parámetros¶
Para pantallas de detalle se usan rutas con parámetros tipo /productos/:id, accediendo al id vía @Input() o ActivatedRoute.^2

// app.routes.ts (añadir)
{ path: 'productos/:id', component: ProductDetailComponent }
// product-detail.component.ts (opción clásica)
constructor(private route: ActivatedRoute) {}

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id'); // string | null
}
<!-- ejemplo de navegación con routerLink -->
<a [routerLink]="['/productos', producto.id]">Ver detalle</a>
Rutas hijas anidadas¶
Para secciones con subpáginas (por ejemplo área de usuario) se definen child routes con <router-outlet> interno.^4

// app.routes.ts
import { UserLayoutComponent } from './features/user/user-layout.component';
import { UserProfileComponent } from './features/user/user-profile.component';
import { UserOrdersComponent } from './features/user/user-orders.component';

export const routes: Routes = [
  // ...
  {
    path: 'usuario',
    component: UserLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
      { path: 'perfil', component: UserProfileComponent },
      { path: 'pedidos', component: UserOrdersComponent }
    ]
  },
  { path: '**', component: NotFoundComponent }
];
<!-- user-layout.component.html -->
<nav>
  <a routerLink="perfil" routerLinkActive="active">Perfil</a>
  <a routerLink="pedidos" routerLinkActive="active">Pedidos</a>
</nav>

<router-outlet></router-outlet>
Ruta wildcard para 404¶
La ruta wildcard ** captura cualquier URL no reconocida y muestra una página 404 personalizada; debe ir siempre en último lugar.^6

// shared/not-found/not-found.component.ts
@Component({
  selector: 'app-not-found',
  template: `
    <h1>404 - Página no encontrada</h1>
    <p>La ruta solicitada no existe.</p>
    <a routerLink="/home">Volver al inicio</a>
  `
})
export class NotFoundComponent {}
// app.routes.ts (ya visto)
{ path: '**', component: NotFoundComponent }

⁂