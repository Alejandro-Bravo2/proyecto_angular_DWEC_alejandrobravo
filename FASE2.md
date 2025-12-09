FASE 2: COMPONENTES INTERACTIVOS Y COMUNICACIÓN¶
Criterios: RA6.e, RA6.g, RA6.h

Entrega: 18 de diciembre (paralela a DIW Fases 1-2-3)

Objetivos:

Implementar comunicación entre componentes usando servicios y patrones reactivos. Independizar lógica de presentación.

Tarea 1: Servicios de comunicación¶
Los servicios de comunicación permiten compartir datos y notificaciones entre componentes hermanos o no relacionados mediante inyección de dependencias, evitando @Input/@Output en jerarquías complejas. Implementa un servicio singleton con RxJS BehaviorSubject para estado reactivo global, donde componentes suscriben (subscribe) a cambios y emiten (next()) actualizaciones. Este patrón sigue el principio de unidirectional data flow, ideal para Angular standalone components con signals complementarios.

Crear servicio para comunicación entre componentes hermanos¶
Genera el servicio con Angular CLI: ng generate service shared/communication. Usa BehaviorSubject para mantener el último valor emitido, permitiendo suscripciones tardías.

// shared/communication.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private notificationSubject = new BehaviorSubject<string>('');
  public notifications$ = this.notificationSubject.asObservable();

  sendNotification(message: string): void {
    this.notificationSubject.next(message);
  }
}
En componentes hermanos, inyecta el servicio e implementa OnDestroy para limpiar suscripciones con takeUntilDestroyed() (Angular 16+)

Implementar patrón Observable/Subject para notificaciones¶
Los Subjects actúan como puentes: Subject para eventos one-time, BehaviorSubject para estado persistente con valor inicial. Componentes emiten vía service.sendNotification('¡Actualizado!') y consumen con this.notifications$.subscribe(msg => this.showToast(msg)). Para estado global complejo, combina con signals: signal(this.service.data$ | async). Evita memory leaks unsubscribe manualmente o usa AsyncPipe en templates.

Uso en Componente Emisor (hermano1.component.ts) (hay que tener en cuenta que en Angular 2 la palabra component se elimina):

constructor(private commService: CommunicationService) {}
onAction() {
  this.commService.sendNotification('Dato enviado desde Hermano 1');
}
Uso en Componente Receptor (hermano2.component.ts) (hay que tener en cuenta que en Angular 2 la palabra component se elimina):

ngOnInit() {
  this.commService.notifications$.subscribe(msg => 
    console.log('Recibido:', msg)
  );
}
Servicio de estado global para datos compartidos¶
Extiende el servicio para objetos complejos como { user: User, theme: string } con múltiples BehaviorSubject. Para escalabilidad, usa signalStore (NgRx 18+) o un facade service que agrupa múltiples observables.

Tipo Subject	Uso Recomendado	Ventajas
Subject	Eventos únicos (clicks, logs)	No retiene valor
BehaviorSubject	Estado compartido (filtros, user)	Valor inicial + histórico
ReplaySubject	Historial limitado de emisiones	Para logs/notificaciones
Inyecta en app.config.ts si necesitas configuración avanzada. Este enfoque centraliza lógica, facilita testing y soporta OnPush change detection.

Tarea 2: Separación de responsabilidades¶
La separación de responsabilidades (SRP) organiza el código donde componentes manejan solo UI y eventos, mientras servicios encapsulan lógica de negocio, datos y APIs. Esto mejora testabilidad, reutilización y mantenimiento, siguiendo el patrón MVC adaptado a Angular con servicios como modelos/controladores. Usa providedIn: 'root' para singletons y signals para estado reactivo en componentes.

Extraer lógica de negocio a servicios¶
Mueve cálculos, validaciones y llamadas HTTP de componentes a servicios dedicados. Genera con ng g service data/user y usa HttpClient para APIs.

// data/user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users').pipe(
      map(users => users.filter(u => u.active)),
      catchError(this.handleError)
    );
  }

  private handleError(err: any) {
    return throwError(() => new Error('Error cargando usuarios'));
  }
}
Inyecta en componentes para delegar: users$ = this.userService.getUsers();

Componentes gestionan solo presentación¶
Componentes se limitan a templates, signals locales y handlers que llaman servicios. Evita lógica compleja en .ts; usa OnPush para rendimiento.

Ejemplo componente limpio (user-list.component.ts):

@Component({...})
export class UserListComponent {
  users$ = this.userService.getUsers();
  selectedUser = signal<User | null>(null);

  constructor(private userService: UserService) {}

  onSelect(user: User) {
    this.selectedUser.set(user);
    this.userService.selectUser(user.id); // Delega lógica
  }
}
Template usa async pipe: *ngFor="let user of users$ | async". Esto reduce el componente a "dumb" presentation layer.

Servicios gestionan datos y lógica¶
Servicios manejan estado global (BehaviorSubject), caching, validaciones y orquestación de múltiples APIs. Agrupa por dominio: user.service.ts, cart.service.ts.

Tarea 3: Sistema de notificaciones/toasts¶
El sistema de toasts usa un servicio centralizado con BehaviorSubject para emitir mensajes tipados, un componente overlay que se suscribe automáticamente y se auto-elimina tras timeout configurable. Implementa tipos con enums y CSS classes dinámicas para estilos diferenciados, posicionado con position: fixed o CDK Overlay para portabilidad.

Servicio centralizado de notificaciones¶
Genera ng g service shared/toast con interfaz tipada para mensajes.

// shared/toast.service.ts
export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // ms, default 5000
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  public toast$ = this.toastSubject.asObservable();

  show(message: string, type: ToastMessage['type'], duration = 5000): void {
    this.toastSubject.next({ message, type, duration });
  }

  success(message: string, duration?: number) { this.show(message, 'success', duration); }
  error(message: string, duration?: number) { this.show(message, 'error', duration); }
  // info(), warning() similares
}
Componente toast que se subscribe al servicio¶
Crea ng g component shared/toast standalone con ChangeDetectionStrategy.OnPush.

// shared/toast.component.ts
@Component({
  selector: 'app-toast',
  template: `
    <div *ngIf="toast()" class="toast" [class]="toast()!.type" 
         [@fadeInOut] (click)="dismiss()">
      {{ toast()!.message }}
    </div>
  `,
  animations: [trigger('fadeInOut', [...])]
})
export class ToastComponent {
  toast = signal<ToastMessage | null>(null);
  private timeoutId: any;

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe(msg => {
      this.toast.set(msg);
      if (msg?.duration) {
        this.timeoutId = setTimeout(() => this.dismiss(), msg.duration);
      }
    });
  }

  dismiss() {
    this.toast.set(null);
    clearTimeout(this.timeoutId);
  }
}
Diferentes tipos (success, error, info, warning)¶
Añade estilos CSS con clases por tipo y posicionamiento global.

// toast.component.scss
.toast {
  position: fixed; top: 20px; right: 20px; z-index: 9999;
  padding: 16px; border-radius: 4px; color: white;

  &.success { background: #4caf50; }
  &.error { background: #f44336; }
  &.info { background: #2196f3; }
  &.warning { background: #ff9800; }
}
Uso en cualquier componente:

constructor(private toast: ToastService) {}
onSuccess() { this.toast.success('¡Operación exitosa!', 3000); }
onError() { this.toast.error('Error de validación'); }
Incluye <app-toast /> en app.component.html. Soporta múltiples toasts con array de mensajes y stack vertical.

Auto-dismiss configurable¶
El auto-dismiss se configura por mensaje mediante la propiedad duration (ms) en ToastMessage, con fallback a 5000ms. El componente usa setTimeout dinámico que se cancela manualmente con clearTimeout al hacer click o nuevo toast, evitando overlaps y memory leaks.

Servicio actualizado con defaults por tipo:

// toast.service.ts - métodos con duración específica
success(message: string, duration = 4000): void { 
  this.show(message, 'success', duration); 
}
error(message: string, duration = 8000): void { 
  this.show(message, 'error', duration); 
}
info(message: string, duration = 3000): void { 
  this.show(message, 'info', duration); 
}
warning(message: string, duration = 6000): void { 
  this.show(message, 'warning', duration); 
}
Componente con lógica de timeout mejorada:

export class ToastComponent {
  toast = signal<ToastMessage | null>(null);
  private timeoutId: any = null;

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe(msg => {
      this.dismiss(); // Cancela timeout anterior
      this.toast.set(msg);

      if (msg?.duration) {
        this.timeoutId = setTimeout(() => {
          this.toast.set(null);
        }, msg.duration);
      }
    });
  }

  dismiss() {
    this.toast.set(null);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
Uso con configuraciones personalizadas:

// Duración corta para feedback inmediato
this.toast.success('Guardado', 2000);

// Persistente para errores críticos
this.toast.error('Sin conexión', 0); // Sin auto-dismiss

// Dinámico basado en longitud mensaje
const duration = message.length * 50 + 2000;
this.toast.info(message, duration);
Añade botón close opcional: × y CSS transition: opacity 0.3s para fade suave.

Tarea 4: Gestión de loading states¶
La gestión de loading states usa un servicio global con BehaviorSubject para spinner overlay y signals locales por operación async. Combina HttpInterceptor para loading automático de APIs y estados específicos en botones/services, con finalize() de RxJS para cleanup garantizado.

Servicio para gestionar estados de carga global¶
La gestión de loading states usa un servicio global con BehaviorSubject para spinner overlay y signals locales por operación async. Combina HttpInterceptor para loading automático de APIs y estados específicos en botones/services, con finalize() de RxJS para cleanup garantizado.

Spinner global durante operaciones async¶
Genera ng g service shared/loading para tracking centralizado de operaciones pendientes.

// shared/loading.service.ts
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loadingSubject.asObservable();
  private requestCount = 0;

  show(): void {
    this.requestCount++;
    this.loadingSubject.next(this.requestCount > 0);
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }
}
Loading local en botones y componentes específicos¶
Usa signals locales para botones y finalize en HTTP/services.

Botón con loading:

<button [disabled]="isSaving()" (click)="save()">
  {{ isSaving() ? 'Guardando...' : 'Guardar' }}
</button>
Servicio con loading automático:

// user.service.ts
saveUser(user: User): Observable<User> {
  return this.http.post<User>('/api/users', user).pipe(
    tap(() => this.toast.success('Usuario guardado')),
    finalize(() => this.loadingService.hide())
  );
}
Uso en componente:

isSaving = signal(false);

async save() {
  this.isSaving.set(true);
  this.loadingService.show();

  this.userService.saveUser(this.user).subscribe({
    next: () => this.isSaving.set(false),
    error: () => this.isSaving.set(false)
  });
}
HttpInterceptor opcional:

// interceptors/loading.interceptor.ts
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  this.loadingService.show();
  return next.handle(req).pipe(finalize(() => this.loadingService.hide()));
}
Tarea 5: Documentación¶
Diagrama de arquitectura de servicios¶
La arquitectura de servicios sigue un patrón jerárquico con servicios de dominio específicos (UserService, ProductService) que consumen HttpService y emiten a servicios reactivos (LoadingService, ToastService). La comunicación fluye unidireccionalmente: Componentes → Services → Estado Global → View.

Patrones de comunicación implementados¶
Se implementan cuatro patrones principales para comunicación desacoplada:

Observable/Subject: BehaviorSubject en CommunicationService para hermanos y estado persistente.
Servicio Singleton: providedIn: 'root' para estado global (LoadingService, ToastService).
HttpInterceptor: Loading automático y headers globales en todas las peticiones.
Signals + AsyncPipe: Estado reactivo local sin suscripciones manuales en templates.
Buenas prácticas de separación de responsabilidades¶
Componentes "Dumb": Solo templates, signals locales, handlers que delegan a servicios. Sin HTTP, validaciones o estado global.

Servicios "Smart": Lógica de negocio, caching, orquestación de APIs, validaciones. Métodos puros y observables pipeados.

// ❌ Componente con lógica pesada
// getUsers() { return this.http.get()... } ❌

// ✅ Componente limpio
users$ = this.userService.getUsers();
onSave() { this.userService.save(this.user); } ✅
Estructura de carpetas por feature:

src/app/
├── features/
│   ├── user/
│   │   ├── user.component.ts
│   │   └── user.service.ts
│   └── product/
├── shared/
│   ├── services/ (loading, toast)
│   └── components/ (spinner, toast)
Esta documentación valida la escalabilidad del proyecto, facilitando onboarding y mantenimiento.
Entregables:¶
Servicio de comunicación entre componentes
Sistema de notificaciones funcional
Loading states en operaciones asíncronas
Separación clara entre lógica y presentación
Documentación de arquitectura