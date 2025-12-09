FASE 1: MANIPULACIÓN DEL DOM Y EVENTOS¶
Criterios: RA6.a, RA6.c, RA6.d, RA6.e, RA6.h

Entrega: 18 de diciembre (paralela a DIW Fases 1-2-3)

Objetivos:

Implementar la manipulación del DOM y gestión de eventos en los componentes que estás creando en DIW. Añadir interactividad básica: toggle de menús, modales, alerts, acordeones, etc.

Tarea 1: Manipulación del DOM en componentes Angular¶
Acceder a elementos del DOM usando ViewChild y ElementRef¶
Para acceder a un elemento del DOM en Angular, declara una variable en tu componente usando @ViewChild y refiérela en la plantilla HTML con una variable de referencia.

import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-ejemplo',
  template: `<div #miDiv>Contenido inicial</div>`
})
export class EjemploComponent implements AfterViewInit {
  @ViewChild('miDiv', { static: false }) miDiv: ElementRef;

  ngAfterViewInit() {
    // Accedes al elemento nativo del DOM
    console.log(this.miDiv.nativeElement);
  }
}
Puntos clave:

@Viewchild accede al elemento referenciado en la plantilla.
ElementRef contiene la referencia al elemento nativo del DOM.
Usa ngAfterViewInit para acceder al DOM después de la inicialización.
Modificar propiedades y estilos dinámicamente¶
Modifica propiedades y estilos usando Renderer2 para operaciones seguras y compatibles con diferentes plataformas.

import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-ejemplo',
  template: `<div #miDiv>Contenido inicial</div><button (click)="cambiarEstilo()">Cambiar</button>`
})
export class EjemploComponent {
  @ViewChild('miDiv', { static: false }) miDiv: ElementRef;

  constructor(private renderer: Renderer2) {}

  cambiarEstilo() {
    // Cambiar estilos con Renderer2
    this.renderer.setStyle(this.miDiv.nativeElement, 'color', 'red');
    this.renderer.setStyle(this.miDiv.nativeElement, 'fontSize', '20px');
  }

  cambiarPropiedad() {
    // Cambiar propiedades con Renderer2
    this.renderer.setProperty(this.miDiv.nativeElement, 'innerText', 'Texto modificado');
  }
}
Métodos principales de Renderer2:

setStyle(elemento, 'propiedad', 'valor') - Cambia estilos.
setProperty(elemento, 'propiedad', 'valor') - Cambia propiedades.
addClass/removeClass - Maneja clases CSS.
Crear y eliminar elementos del DOM programáticamente¶
Crea y elimina elementos usando Renderer2 para mantener compatibilidad y seguridad.

import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-ejemplo',
  template: `
    <div #contenedor></div>
    <button (click)="crearElemento()">Crear</button>
    <button (click)="eliminarElemento()">Eliminar</button>
  `
})
export class EjemploComponent {
  @ViewChild('contenedor', { static: false }) contenedor: ElementRef;

  constructor(private renderer: Renderer2) {}

  crearElemento() {
    // Crear nuevo elemento
    const nuevoDiv = this.renderer.createElement('div');
    this.renderer.setProperty(nuevoDiv, 'innerText', 'Nuevo elemento creado');
    this.renderer.setStyle(nuevoDiv, 'backgroundColor', 'lightblue');
    this.renderer.setStyle(nuevoDiv, 'padding', '10px');
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
Métodos Renderer2 para DOM dinámico:
createElement('tag') - Crea elemento HTML.
appendChild(parent, child) - Inserta elemento.
removeChild(parent, child) - Elimina elemento hijo.
Tarea 2: Sistema de eventos en Angular¶
Angular usa un sistema de eventos basado en el DOM pero adaptado a su arquitectura de componentes. Los eventos en Angular se manejan mediante event binding que permite escuchar eventos del DOM (como click, teclado, mouse, focus) para ejecutar métodos del componente.

Implementar event binding en componentes interactivos¶
El event binding se realiza poniendo el nombre del evento entre paréntesis en el template y asignándole un método del componente:

<button (click)="onClick()">Haz clic aquí</button>
En el componente:

onClick() {
  console.log('Botón clickeado');
}
Para obtener el objeto evento se usa $event:

<input (keyup)="onKeyUp($event)">
onKeyUp(event: KeyboardEvent) {
  console.log(event.key);
}
Angular tiene pseudoeventos para simplificar el manejo, por ejemplo (keyup.enter) solo se dispara al presionar Enter sin chequear explícitamente la tecla.
Manejar eventos de teclado, mouse, focus y blur¶
Angular soporta todos los eventos comunes del DOM:

Teclado: (keydown), (keyup), (keyup.enter), etc.
Mouse: (click), (dblclick), (mouseenter), (mouseleave).
Focus/Blur: (focus), (blur).
Ejemplo para focus y blur:

<input (focus)="onFocus()" (blur)="onBlur()">
onFocus() {
  console.log('Input con foco');
}
onBlur() {
  console.log('Input perdió foco');
}
Prevenir comportamientos por defecto cuando sea necesario¶
Para evitar el comportamiento predeterminado de un evento (como un submit recargando la página):

 <form (submit)="onSubmit($event)">
  <button type="submit">Enviar</button>
</form>
onSubmit(event: Event) {
  event.preventDefault(); // Previene recarga
  console.log('Formulario enviado sin recarga');
}
Propagar o detener propagación de eventos según contexto¶
Por defecto, los eventos burbujean por el DOM. Puedes detener la propagación para evitar que el evento llegue a elementos padres:

onClick(event: MouseEvent) {
  event.stopPropagation(); // Detiene propagación
  console.log('Click manejado sin burbuja');
}
Tarea 3: Componentes interactivos funcionales¶
Menú hamburguesa¶
Mantén en el componente un booleano isOpen y en el template usa *ngIf o clases condicionales para mostrar/ocultar el menú y disparar animaciones CSS.

Para cerrar al hacer click fuera, puedes:

Escuchar al document con @HostListener('document:click', ['$event']) y comprobar si el click ocurrió fuera del elemento del menú.
Si el objetivo no pertenece al menú, pones isOpen = false.
Modales (incluyendo cierre con ESC)¶
Igual que el menú: un isOpen controla si se muestra el modal; el fondo oscuro suele ser otro div que al hacer click también cierra el modal.
Para cerrar con la tecla ESC, se puede usar @HostListener('document:keydown.escape',['$event']) en el componente del modal y, cuando se detecte, ejecutar el método close(), que pone isOpen = false.
​Tabs¶
Mantén en el componente una variable activeTab (un string o índice).
Cada botón de pestaña hace (click)="selectTab('detalles')" y en el contenido se usa *ngIf="activeTab === 'detalles'" o [ngSwitch] para mostrar solo el panel correspondiente.​
Las clases activas (.tab--active) se aplican con [class.tab--active]="activeTab === 'detalles'".
Tooltips¶
Estructura básica: un contenedor con el elemento objetivo y un elemento tooltip que se muestra/oculta en función de un booleano showTooltip o con :hover en CSS.
En Angular, puedes usar:
Solo CSS (:hover) para casos simples, o
Eventos (mouseenter) y (mouseleave) para cambiar showTooltip y controlar mejor tiempos, accesibilidad, etc.​
El tooltip suele posicionarse con clases y position: absolute, y se renderiza con *ngIf="showTooltip".
Tarea 4: Theme Switcher funcional¶
Detectar prefers-color-scheme¶
A nivel CSS se puede usar la media query @media (prefers-color-scheme: dark) para definir estilos por defecto cuando el sistema del usuario está en modo oscuro.​
A nivel TypeScript, se puede usar window.matchMedia('(prefers-color-scheme: dark)') para saber si el sistema prefiere oscuro y reaccionar en el componente o servicio de tema.​
Toggle entre tema claro/oscuro¶
Define dos clases globales en CSS/SCSS (por ejemplo .theme-light y .theme-dark) o dos conjuntos de variables CSS (--bg-color, --text-color, etc.).​
En Angular, mantén un estado currentTheme: 'light' | 'dark' en un servicio o en el AppComponent y aplica la clase al o con document.documentElement.classList.toggle(...) o enlazándola con [ngClass] en el contenedor raíz.​
El botón de cambio hace algo como (click)="toggleTheme()", y esa función cambia el estado de light a dark o al revés.
Persistir preferencia en localStorage¶
Cuando el usuario cambie de tema, guarda la elección en localStorage.setItem('theme', 'dark' | 'light').​- Así, aunque el navegador se cierre, al volver a entrar podrás leer localStorage.getItem('theme') y respetar esa preferencia en lugar de la del sistema si existe.
Aplicar tema al cargar la aplicación¶
Nada más arrancar la app (por ejemplo en AppComponent o en un ThemeService llamado desde main.ts / app.config), realiza esta lógica:
Leer const saved = localStorage.getItem('theme').
Si hay valor guardado, usarlo como tema actual.
Si no hay, mirar matchMedia('(prefers-color-scheme: dark)') y decidir entre claro/oscuro.​
Aplicar la clase correspondiente (theme-dark o theme-light) al o para que todos los estilos dependan de ese tema.
Tarea 5: Documentación¶
Sección en README técnico explicando la arquitectura de eventos¶
<<<<<<< HEAD

La arquitectura de eventos en esta aplicación Angular sigue el patrón unidireccional de datos, utilizando bindings de eventos nativos del DOM como (click), (keydown) y (pointerdown) directamente en las plantillas de componentes standalone. Los eventos se capturan con la sintaxis (eventName)="handler($event)", donde $event proporciona acceso al objeto nativo del evento (por ejemplo, KeyboardEvent o PointerEvent) para detalles como event.key o event.preventDefault(). Esta aproximación aprovecha Zone.js para detección de cambios automática, emitiendo datos hacia servicios o estados reactivos (signals) sin necesidad de @Output en componentes simples, promoviendo simplicidad y rendimiento.

Para flujos complejos, se centralizan eventos en servicios inyectables que usan EventEmitter o RxJS Subjects, evitando acoplamiento directo entre componentes. Modificadores como (keyup.enter) o (click.alt) filtran eventos específicos, reduciendo lógica condicional en handlers. Custom events se extienden vía EVENT_MANAGER_PLUGINS para casos como debounce.

Diagrama de flujo de eventos principales¶
El flujo principal inicia en la interacción del usuario (DOM event), pasa por el template binding, ejecuta el método del componente y actualiza el estado:

Usuario → DOM Event (click/keydown) 
      → Template Binding (event) 
      → Component Handler ($event) 
      → Service/State Update (signals/RxJS)
      → View Re-render (OnPush/Zone.js)
Este diagrama textual representa el ciclo: eventos nativos se propagan unidirectionalmente hacia lógica de negocio, con preventDefault() para bloquear comportamientos por defecto cuando sea necesario.

Tabla de compatibilidad navegadores para eventos usados¶
Tabla de compatibilidades¶
Diagrama de flujo de eventos principales¶
Tabla de compatibilidad navegadores para eventos usados¶
2ffefe68fde84741f1de4f366c44136f218270f3

Entregables:¶
Componentes interactivos funcionando con eventos
Theme switcher completamente funcional
Menú mobile con apertura/cierre
Mínimo 2 componentes adicionales interactivos (modal, acordeón, tabs, tooltip)
Documentación de eventos en README