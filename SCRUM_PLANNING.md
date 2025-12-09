# COFIRA - Planificación Scrum

> Sprint Planning para el desarrollo completo del proyecto Angular

## 📋 Product Backlog Priorizado

### Epic 1: Configuración Inicial y Arquitectura
**Prioridad**: CRÍTICA | **Story Points**: 13

#### US-001: Configurar proyecto Angular 20
**Como** desarrollador
**Quiero** inicializar un proyecto Angular 20 con arquitectura ITCSS
**Para que** pueda construir una aplicación escalable y mantenible

**Criterios de Aceptación**:
- [x] Angular 20 instalado con CLI
- [x] Estructura de carpetas ITCSS configurada
- [x] SCSS configurado como preprocesador
- [x] Standalone components como default
- [x] Configuración de linter (ESLint) y Prettier

**Tareas**:
1. Crear proyecto: `ng new cofira --standalone --style=scss --routing`
2. Configurar ITCSS: settings, tools, generic, elements, objects, components, utilities
3. Instalar dependencias base
4. Configurar scripts en package.json

**Story Points**: 5

---

#### US-002: Implementar Design Tokens
**Como** desarrollador
**Quiero** tener todos los design tokens (colores, tipografía, espaciado) definidos
**Para que** la UI sea consistente con el diseño

**Criterios de Aceptación**:
- [x] Variables SCSS de colores definidas
- [x] Tipografía (Montserrat, Poppins) importada
- [x] Sistema de espaciado implementado
- [x] Radios de borde definidos
- [x] CSS custom properties para theming

**Tareas**:
1. Crear `src/styles/settings/_colors.scss`
2. Crear `src/styles/settings/_typography.scss`
3. Crear `src/styles/settings/_spacing.scss`
4. Crear `src/styles/settings/_radios.scss`
5. Importar Google Fonts
6. Definir CSS variables para temas

**Story Points**: 3

---

#### US-003: Sistema de Temas Claro/Oscuro
**Como** usuario
**Quiero** poder cambiar entre tema claro y oscuro
**Para que** pueda usar la app según mi preferencia

**Criterios de Aceptación**:
- [x] Toggle funcional en navbar
- [x] Persistencia en localStorage
- [x] Detección de prefers-color-scheme
- [x] Transición suave entre temas
- [x] Todos los componentes respetan el tema

**Tareas**:
1. Crear ThemeService con BehaviorSubject
2. Implementar toggle button component
3. Configurar CSS variables por tema
4. Añadir localStorage persistence
5. Detectar preferencia del sistema
6. Añadir clase al document element

**Story Points**: 5

**DOD (Definition of Done)**:
- Código committed y pushed
- Sin errores de compilación
- Tests unitarios pasando
- Documentación actualizada

---

### Epic 2: Layout y Navegación Base
**Prioridad**: CRÍTICA | **Story Points**: 21

#### US-004: Componente Header/Navbar
**Como** usuario
**Quiero** ver un header con navegación
**Para que** pueda acceder a todas las secciones

**Criterios de Aceptación**:
- [x] Logo COFIRA en la izquierda
- [x] Nav links: Entrenamiento, Alimentación, Seguimiento
- [x] Botón "Inscríbete" (amarillo)
- [x] Botón "Cuenta" (outline)
- [x] Menú hamburguesa en mobile
- [x] Sticky header al hacer scroll

**Tareas**:
1. Crear HeaderComponent
2. Crear NavigationComponent
3. Implementar RouterLink active
4. Crear HamburgerMenuComponent
5. Añadir responsive styles
6. Integrar ThemeToggle en header

**Story Points**: 8

---

#### US-005: Sistema de Rutas Principal
**Como** usuario
**Quiero** navegar por la aplicación sin recargar
**Para que** tenga una experiencia SPA fluida

**Criterios de Aceptación**:
- [x] Rutas principales definidas (/, /entrenamiento, /alimentacion, /seguimiento, /preferencias)
- [x] Lazy loading para módulos feature
- [x] Ruta 404 con componente NotFound
- [ ] Breadcrumbs dinámicos
- [ ] Guardas de autenticación (CanActivate)

**Tareas**:
1. Configurar app.routes.ts
2. Crear componentes de páginas base
3. Implementar lazy loading
4. Crear NotFoundComponent
5. Implementar BreadcrumbsComponent
6. Crear AuthGuard

**Story Points**: 8

---

#### US-006: Footer Component
**Como** usuario
**Quiero** ver un footer con información legal y redes sociales
**Para que** pueda acceder a condiciones y contactar

**Criterios de Aceptación**:
- [x] Link "Leer condiciones de uso"
- [x] Copyright "©Copyright - Cofira"
- [x] Iconos de redes sociales (YouTube, Facebook, Twitter, Instagram, LinkedIn)
- [x] Responsive en mobile

**Tareas**:
1. Crear FooterComponent
2. Añadir iconos SVG inline
3. Implementar estilos responsive

**Story Points**: 3

---

#### US-007: Componente de Loading Global
**Como** usuario
**Quiero** ver un indicador de carga durante operaciones async
**Para que** sepa que la app está procesando

**Criterios de Aceptación**:
- [x] Spinner overlay con backdrop
- [x] LoadingService centralizado
- [x] HTTP Interceptor para loading automático
- [x] Animación smooth

**Tareas**:
1. Crear LoadingService
2. Crear SpinnerComponent
3. Crear LoadingInterceptor
4. Añadir animaciones CSS

**Story Points**: 5

---

### Epic 3: Páginas Principales (FASE 1)
**Prioridad**: ALTA | **Story Points**: 34

#### US-008: Página de Inicio (Home)
**Como** visitante
**Quiero** ver la propuesta de valor en la landing
**Para que** entienda qué ofrece COFIRA

**Criterios de Aceptación**:
- [x] Hero section con imagen de fondo
- [x] H1: "Tu entrenamiento, nutrición y progreso en un solo lugar"
- [x] CTAs: INSCRÍBETE, VER PLANES
- [x] Sección de planes (3 cards)
- [x] Formulario newsletter
- [x] Responsive en todos los breakpoints

**Tareas**:
1. Crear HomeComponent
2. Crear HeroSection component
3. Crear PricingPlans component
4. Crear NewsletterForm component
5. Implementar estilos según mockup
6. Añadir animaciones scroll

**Story Points**: 8

---

#### US-009: Página Entrenamiento
**Como** usuario registrado
**Quiero** ver mi tabla de entrenamiento semanal
**Para que** pueda seguir mi rutina

**Criterios de Aceptación**:
- [x] Tabla semanal con navegación < > entre días
- [x] Lista de ejercicios con repeticiones y series
- [x] Checkboxes de completado (verde/rojo)
- [x] Formulario de retroalimentación
- [x] Card "Ver mi progreso" con CTA
- [x] Persistencia de completados

**Tareas**:
1. Crear TrainingComponent
2. Crear WeeklyTableComponent
3. Crear ExerciseRowComponent
4. Crear FeedbackFormComponent
5. Crear TrainingService para data
6. Implementar navigation arrows
7. Añadir persistencia en localStorage

**Story Points**: 13

---

#### US-010: Página Alimentación
**Como** usuario registrado
**Quiero** ver mi menú diario con información nutricional
**Para que** pueda seguir mi plan alimenticio

**Criterios de Aceptación**:
- [x] Navegación de fechas con calendario
- [x] Secciones: Desayuno, Almuerzo, Cena
- [x] Items con icono, cantidad y nombre
- [x] Botón (i) que abre modal de ingredientes
- [x] Costo total por comida
- [x] Modal con lista detallada de ingredientes y precios

**Tareas**:
1. Crear NutritionComponent
2. Crear DailyMenuComponent
3. Crear MealSectionComponent
4. Crear FoodItemComponent
5. Crear IngredientsModalComponent
6. Crear NutritionService
7. Implementar date navigation
8. Añadir modal system

**Story Points**: 13

---

### Epic 4: Seguimiento y Gráficos
**Prioridad**: ALTA | **Story Points**: 21

#### US-011: Página de Seguimiento
**Como** usuario registrado
**Quiero** ver mis métricas y progreso
**Para que** pueda evaluar mi evolución

**Criterios de Aceptación**:
- [x] Contador de nutrientes (gráfico circular)
- [x] Desglose: Proteínas, Carbohidratos, Grasas, Fibra, Agua
- [x] Calorías totales con formato (ej. 1850/2250 kcal)
- [x] Gráfico de ganancia de fuerza (línea temporal)
- [x] Dropdown para seleccionar ejercicio
- [x] Ejes X (fechas) e Y (kg) con puntos de progreso

**Tareas**:
1. Crear ProgressComponent
2. Crear NutrientCounterComponent
3. Crear StrengthGainChartComponent
4. Integrar librería de gráficos (Chart.js o ng2-charts)
5. Crear ProgressService
6. Implementar dropdown de ejercicios
7. Formatear datos para gráficos

**Story Points**: 13

---

#### US-012: Calendario Component
**Como** usuario
**Quiero** seleccionar fechas en un calendario visual
**Para que** pueda navegar entre días fácilmente

**Criterios de Aceptación**:
- [x] Grid 7x5 (días de la semana)
- [x] Mes y año en header con navegación < >
- [x] Día actual resaltado (border amarillo)
- [x] Día seleccionado (background amarillo)
- [x] Responsive en mobile

**Tareas**:
1. Crear CalendarComponent
2. Implementar lógica de fechas
3. Añadir navegación mes anterior/siguiente
4. Emitir evento de selección
5. Estilos según mockup

**Story Points**: 8

---

### Epic 5: Autenticación y Autorización (FASE 4)
**Prioridad**: ALTA | **Story Points**: 21

#### US-013: Sistema de Login
**Como** usuario
**Quiero** iniciar sesión con email y contraseña
**Para que** pueda acceder a mi cuenta

**Criterios de Aceptación**:
- [x] Modal de login con diseño del mockup
- [x] Campos: Email, Contraseña
- [x] Validación en tiempo real
- [x] Botón "Iniciar sesión" deshabilitado si inválido
- [x] Link "¿Has olvidado la contraseña?"
- [x] Link "¿No tienes cuenta?" (va a registro)
- [x] Persistencia de sesión (JWT simulado)

**Tareas**:
1. Crear LoginComponent
2. Crear reactive form con validators
3. Crear AuthService con login()
4. Simular API con json-server
5. Guardar token en localStorage
6. Implementar auto-redirect si ya autenticado

**Story Points**: 8

---

#### US-014: Sistema de Registro
**Como** visitante
**Quiero** crear una cuenta
**Para que** pueda usar la plataforma

**Criterios de Aceptación**:
- [x] Modal de registro
- [x] Campos: Nombre, Email, Contraseña
- [x] Validación: Email único (async), Password strength
- [x] Confirmación de contraseña con cross-field validator
- [x] Botón "Registrarse" con loading state
- [x] Redirect a onboarding tras registro exitoso

**Tareas**:
1. Crear RegisterComponent
2. Implementar FormBuilder con validators
3. Crear custom validators (passwordStrength, passwordMatch)
4. Crear async validator (emailUnique)
5. Integrar con AuthService.register()
6. Añadir loading y toasts

**Story Points**: 8

---

#### US-015: Reset de Contraseña
**Como** usuario
**Quiero** recuperar mi contraseña si la olvido
**Para que** pueda volver a acceder

**Criterios de Aceptación**:
- [x] Flujo 1: Solicitar código por email
- [x] Flujo 2: Ingresar código y nueva contraseña
- [x] Validación de contraseña fuerte
- [x] Confirmación de contraseña
- [x] Feedback con toasts

**Tareas**:
1. Crear ResetPasswordComponent
2. Crear flujo de 2 pasos (email → código)
3. Implementar validators
4. Simular envío de email
5. Integrar con AuthService

**Story Points**: 5

---

### Epic 6: Onboarding Flow
**Prioridad**: MEDIA | **Story Points**: 21

#### US-016: Paso 1 - Sobre ti (About Me)
**Como** nuevo usuario
**Quiero** ingresar mi información personal
**Para que** el sistema personalice mi experiencia

**Criterios de Aceptación**:
- [x] Campos: Género (botones), Altura (dropdown), Edad (dropdown)
- [x] Validación: todos obligatorios
- [x] Botón "Continuar" va al siguiente paso
- [x] Progreso guardado en servicio

**Tareas**:
1. Crear OnboardingAboutComponent
2. Crear reactive form
3. Crear OnboardingService para estado compartido
4. Implementar navegación multi-paso
5. Estilos según mockup

**Story Points**: 5

---

#### US-017: Paso 2-5 - Preferencias (Nutrition, Goal, Pricing, Muscles)
**Como** nuevo usuario
**Quiero** configurar mis preferencias
**Para que** reciba un plan personalizado

**Criterios de Aceptación**:
- [x] 4 pantallas con opciones de selección única o múltiple
- [x] Opción seleccionada resaltada en amarillo
- [x] Botón "Continuar" en cada paso
- [x] Paso final: "Continuar" completa onboarding y guarda datos
- [x] Redirect a dashboard

**Tareas**:
1. Crear OnboardingNutritionComponent
2. Crear OnboardingGoalComponent
3. Crear OnboardingPricingComponent
4. Crear OnboardingMusclesComponent
5. Implementar multi-select en músculos
6. Integrar con OnboardingService
7. Guardar preferencias en backend (simulado)

**Story Points**: 13

---

#### US-018: Wizard de Onboarding con Steps Indicator
**Como** nuevo usuario
**Quiero** ver mi progreso en el onboarding
**Para que** sepa cuántos pasos faltan

**Criterios de Aceptación**:
- [x] Indicador de pasos (1/5, 2/5, etc.)
- [x] Navegación adelante/atrás
- [x] Validación antes de avanzar
- [x] Botón "Atrás" habilitado excepto en paso 1

**Tareas**:
1. Crear OnboardingContainerComponent
2. Implementar stepper logic
3. Añadir validaciones por paso
4. Crear StepsIndicatorComponent

**Story Points**: 5

---

### Epic 7: Preferencias y Configuración
**Prioridad**: MEDIA | **Story Points**: 13

#### US-019: Página de Preferencias Alimentarias
**Como** usuario
**Quiero** gestionar mis alergias e ingredientes favoritos
**Para que** el sistema adapte mis menús

**Criterios de Aceptación**:
- [x] Sección "Alergias o intolerancias" con search + pills
- [x] Pills rojas para alergias (Lácteos, Gluten, etc.)
- [x] Sección "Ingredientes favoritos" con search + pills
- [x] Pills amarillas para favoritos
- [x] Búsqueda con autocomplete
- [x] Guardar cambios en backend

**Tareas**:
1. Crear PreferencesComponent
2. Crear SearchableTagsComponent (reutilizable)
3. Crear PreferencesService
4. Implementar autocomplete
5. Añadir/eliminar tags dinámicamente
6. Persistencia en API

**Story Points**: 8

---

#### US-020: Configuración de Cuenta
**Como** usuario
**Quiero** editar mi perfil
**Para que** pueda actualizar mis datos

**Criterios de Aceptación**:
- [ ] Ver datos actuales
- [ ] Editar: Nombre, Email, Contraseña
- [ ] Validación igual que registro
- [ ] Botón "Guardar cambios"
- [ ] Toast de confirmación

**Tareas**:
1. Crear AccountSettingsComponent
2. Implementar form con valores iniciales
3. Validadores de actualización
4. Integrar con UserService.update()

**Story Points**: 5

---

### Epic 8: Formularios Reactivos Avanzados (FASE 3)
**Prioridad**: CRÍTICA | **Story Points**: 21

#### US-021: Custom Validators
**Como** desarrollador
**Quiero** validators personalizados reutilizables
**Para que** valide datos específicos españoles

**Criterios de Aceptación**:
- [x] passwordStrength validator (mayúscula, minúscula, número, símbolo, 12+ chars)
- [x] nif validator (formato y letra correcta)
- [x] telefono validator (6/7 + 8 dígitos)
- [x] codigoPostal validator (5 dígitos)
- [x] passwordMatch validator (cross-field)

**Tareas**:
1. Crear `src/shared/validators/password-strength.validator.ts`
2. Crear `spanish-formats.validator.ts` (NIF, teléfono, CP)
3. Crear `cross-field.validators.ts` (passwordMatch, etc.)
4. Unit tests para cada validator

**Story Points**: 8

---

#### US-022: Async Validators
**Como** desarrollador
**Quiero** validators asíncronos para unicidad
**Para que** evite duplicados en backend

**Criterios de Aceptación**:
- [x] emailUnique validator con debounce 500ms
- [x] usernameAvailable validator
- [x] Loading state (pending) en UI
- [x] Manejo de errores de red
- [x] updateOn: 'blur' para optimizar llamadas

**Tareas**:
1. Crear AsyncValidatorsService
2. Implementar emailUnique con timer + switchMap
3. Implementar usernameAvailable
4. Crear método simulado en backend
5. Añadir loading indicators en templates

**Story Points**: 8

---

#### US-023: FormArray para Listas Dinámicas
**Como** usuario
**Quiero** añadir múltiples teléfonos/direcciones
**Para que** el sistema tenga todos mis contactos

**Criterios de Aceptación**:
- [x] Ejemplo: Lista de teléfonos con validación
- [x] Botón "Añadir teléfono"
- [x] Botón "Eliminar" en cada item (si > 1)
- [x] Validación individual por item
- [x] Mínimo 1 elemento obligatorio

**Tareas**:
1. Crear example form con FormArray
2. Implementar add/remove methods
3. Template con *ngFor + formArrayName
4. Validación por elemento

**Story Points**: 5

---

### Epic 9: Servicios HTTP y API (FASE 5)
**Prioridad**: CRÍTICA | **Story Points**: 21

#### US-024: Configuración HttpClient y Backend Mock
**Como** desarrollador
**Quiero** un backend simulado funcional
**Para que** pueda desarrollar sin esperar el backend real

**Criterios de Aceptación**:
- [ ] json-server instalado y configurado
- [ ] db.json con datos iniciales (usuarios, ejercicios, menús, etc.)
- [ ] Endpoints REST funcionando
- [ ] Script npm para levantar json-server

**Tareas**:
1. Instalar json-server: `npm install -D json-server`
2. Crear `db.json` con estructura completa
3. Añadir script en package.json: `"api": "json-server --watch db.json --port 3000"`
4. Documentar endpoints en README

**Story Points**: 5

---

#### US-025: Base HTTP Service
**Como** desarrollador
**Quiero** un servicio HTTP base reutilizable
**Para que** no repita código en cada servicio

**Criterios de Aceptación**:
- [ ] Métodos genéricos: get, post, put, delete
- [ ] Tipado con TypeScript generics
- [ ] Manejo de errores centralizado con catchError
- [ ] Retry logic (retry(2))
- [ ] Loading state integrado

**Tareas**:
1. Crear BaseHttpService
2. Implementar métodos CRUD genéricos
3. Añadir error handling
4. Integrar LoadingService

**Story Points**: 5

---

#### US-026: Feature Services (User, Training, Nutrition, Progress)
**Como** desarrollador
**Quiero** servicios específicos por dominio
**Para que** la lógica esté organizada

**Criterios de Aceptación**:
- [ ] UserService: CRUD usuarios, login, register
- [ ] TrainingService: obtener rutinas, marcar completados
- [ ] NutritionService: obtener menús, ingredientes
- [ ] ProgressService: obtener métricas, gráficos

**Tareas**:
1. Crear UserService extends BaseHttpService
2. Crear TrainingService
3. Crear NutritionService
4. Crear ProgressService
5. Definir interfaces TypeScript para DTOs
6. Implementar métodos específicos

**Story Points**: 8

---

#### US-027: HTTP Interceptors
**Como** desarrollador
**Quiero** interceptors para funcionalidad cross-cutting
**Para que** no duplique lógica en cada request

**Criterios de Aceptación**:
- [ ] AuthInterceptor: añade JWT token en headers
- [ ] LoadingInterceptor: muestra/oculta spinner global
- [ ] ErrorInterceptor: maneja errores globalmente (401, 500, etc.)
- [ ] LoggingInterceptor (opcional, solo dev): console logs

**Tareas**:
1. Crear AuthInterceptor
2. Crear LoadingInterceptor
3. Crear ErrorInterceptor
4. Registrar en app.config.ts con provideHttpClient

**Story Points**: 5

---

### Epic 10: Componentes Interactivos (FASE 1 y 2)
**Prioridad**: ALTA | **Story Points**: 21

#### US-028: Sistema de Toast/Notificaciones
**Como** usuario
**Quiero** ver feedback visual de mis acciones
**Para que** sepa si fueron exitosas

**Criterios de Aceptación**:
- [ ] ToastService centralizado
- [ ] 4 tipos: success, error, info, warning
- [ ] Auto-dismiss configurable (default 4s)
- [ ] Posición: top-right
- [ ] Stacking de múltiples toasts
- [ ] Animación fade in/out

**Tareas**:
1. Crear ToastService con BehaviorSubject
2. Crear ToastComponent
3. Añadir animaciones Angular
4. Integrar en AppComponent
5. Estilos por tipo

**Story Points**: 8

---

#### US-029: Modales Reutilizables
**Como** desarrollador
**Quiero** un sistema de modales genérico
**Para que** pueda mostrar contenido overlay fácilmente

**Criterios de Aceptación**:
- [ ] ModalService para abrir/cerrar programáticamente
- [ ] ModalComponent con proyección de contenido
- [ ] Backdrop con click para cerrar
- [ ] Cerrar con ESC
- [ ] Animaciones de entrada/salida
- [ ] Bloqueo de scroll del body

**Tareas**:
1. Crear ModalService
2. Crear ModalComponent con <ng-content>
3. Implementar @HostListener para ESC
4. Añadir animaciones
5. Ejemplo: IngredientsModal

**Story Points**: 8

---

#### US-030: Componentes de UI Reutilizables
**Como** desarrollador
**Quiero** componentes de UI consistentes
**Para que** la app tenga diseño uniforme

**Criterios de Aceptación**:
- [ ] ButtonComponent con variants (primary, secondary, ghost)
- [ ] InputComponent con validación integrada
- [ ] DropdownComponent
- [ ] CheckboxComponent
- [ ] RadioButtonComponent
- [ ] BadgeComponent (pills de preferencias)

**Tareas**:
1. Crear shared/ui/ folder
2. Implementar cada componente con @Input()/@Output()
3. Estilos según design system
4. Documentar uso en Storybook (opcional)

**Story Points**: 13

---

### Epic 11: Testing y Quality Assurance
**Prioridad**: MEDIA | **Story Points**: 21

#### US-031: Unit Tests de Servicios
**Como** desarrollador
**Quiero** tests de servicios con >50% coverage
**Para que** garantice la funcionalidad

**Criterios de Aceptación**:
- [ ] Tests de AuthService (login, register, logout)
- [ ] Tests de ThemeService
- [ ] Tests de ToastService
- [ ] Tests de custom validators
- [ ] Coverage > 50% en servicios

**Tareas**:
1. Configurar Karma/Jest
2. Escribir tests con TestBed
3. Mocking de HttpClient con HttpClientTestingModule
4. Ejecutar `ng test --code-coverage`

**Story Points**: 8

---

#### US-032: Integration Tests de Flujos
**Como** QA
**Quiero** tests e2e de flujos críticos
**Para que** la app funcione end-to-end

**Criterios de Aceptación**:
- [ ] Test: Registro → Onboarding → Dashboard
- [ ] Test: Login → Ver entrenamiento → Marcar completado
- [ ] Test: Login → Ver alimentación → Abrir modal ingredientes
- [ ] Test: Cambiar tema claro/oscuro

**Tareas**:
1. Configurar Cypress o Playwright
2. Escribir specs para cada flujo
3. Setup de datos de test

**Story Points**: 13

---

### Epic 12: Deployment y Optimización
**Prioridad**: ALTA | **Story Points**: 13

#### US-033: Build de Producción Optimizado
**Como** devops
**Quiero** un build optimizado
**Para que** la app sea rápida

**Criterios de Aceptación**:
- [ ] Build con `ng build --configuration production`
- [ ] Lazy loading chunks separados
- [ ] Minificación y tree-shaking
- [ ] Source maps deshabilitados
- [ ] Tamaño bundle < 500KB (initial)

**Tareas**:
1. Optimizar angular.json
2. Verificar lazy loading
3. Analizar bundle con webpack-bundle-analyzer
4. Comprimir assets

**Story Points**: 5

---

#### US-034: Deployment a Hosting
**Como** desarrollador
**Quiero** la app desplegada en producción
**Para que** esté accesible públicamente

**Criterios de Aceptación**:
- [ ] Desplegado en Netlify/Vercel/Firebase Hosting
- [ ] URL pública funcionando
- [ ] SSL configurado
- [ ] Redirects para SPA (todas las rutas → index.html)
- [ ] Variables de entorno configuradas

**Tareas**:
1. Crear cuenta en hosting
2. Configurar build command: `ng build --configuration production`
3. Configurar redirects (_redirects o vercel.json)
4. Deploy automático desde Git

**Story Points**: 3

---

#### US-035: Lighthouse Performance Audit
**Como** developer
**Quiero** score Lighthouse > 80
**Para que** la app sea performante

**Criterios de Aceptación**:
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 80

**Tareas**:
1. Ejecutar Lighthouse
2. Optimizar imágenes (WebP, lazy loading)
3. Añadir meta tags
4. Optimizar fonts (font-display: swap)

**Story Points**: 5

---

## 🎯 Sprint Planning

### Sprint 1 (Días 1-3): Foundation
**Objetivo**: Configuración base y design system

**Sprint Backlog**:
- US-001: Configurar proyecto Angular 20 (5 SP) - COMPLETED
- US-002: Implementar Design Tokens (3 SP) - COMPLETED
- US-003: Sistema de Temas (5 SP) - COMPLETED
- US-004: Header/Navbar (8 SP) - COMPLETED

**Total**: 21 SP

**Ceremonies**:
- Sprint Planning: Día 1 mañana
- Daily Standup: Cada mañana 15min
- Sprint Review: Día 3 tarde
- Sprint Retrospective: Día 3 tarde

---

### Sprint 2 (Días 4-6): Navigation & Core Pages
**Objetivo**: Rutas y páginas principales

**Sprint Backlog**:
- US-005: Sistema de Rutas (8 SP) - COMPLETED
- US-006: Footer (3 SP) - COMPLETED
- US-007: Loading Global (5 SP) - COMPLETED
- US-008: Página Home (8 SP) - COMPLETED

**Total**: 24 SP

---

### Sprint 3 (Días 7-10): Training & Nutrition
**Objetivo**: Páginas de contenido principal

**Sprint Backlog**:
- US-009: Página Entrenamiento (13 SP) - COMPLETED
- US-010: Página Alimentación (13 SP) - COMPLETED

**Total**: 26 SP

---

### Sprint 4 (Días 11-13): Progress & Charts
**Objetivo**: Seguimiento y visualización de datos

**Sprint Backlog**:
- US-011: Página Seguimiento (13 SP) - COMPLETED
- US-012: Calendario Component (8 SP) - COMPLETED

**Total**: 21 SP

---

### Sprint 5 (Días 14-16): Authentication
**Objetivo**: Sistema de autenticación completo

**Sprint Backlog**:
- US-013: Login (8 SP) - COMPLETED
- US-014: Registro (8 SP) - COMPLETED
- US-015: Reset Password (5 SP) - COMPLETED

**Total**: 21 SP

---

### Sprint 6 (Días 17-19): Onboarding & Preferences
**Objetivo**: Flujo de bienvenida

**Sprint Backlog**:
- US-016: Onboarding About (5 SP) - COMPLETED
- US-017: Onboarding Preferences (13 SP) - COMPLETED
- US-018: Wizard Stepper (5 SP) - COMPLETED
- US-019: Preferencias (8 SP) - COMPLETED

**Total**: 31 SP

---

### Sprint 7 (Días 20-22): Forms & Validation
**Objetivo**: Formularios reactivos avanzados

**Sprint Backlog**:
- US-021: Custom Validators (8 SP) - COMPLETED
- US-022: Async Validators (8 SP) - COMPLETED
- US-023: FormArray (5 SP) - COMPLETED

**Total**: 21 SP

---

### Sprint 8 (Días 23-25): HTTP & Backend
**Objetivo**: Servicios y comunicación HTTP

**Sprint Backlog**:
- US-024: Configuración HttpClient y Backend Mock (5 SP)
- US-025: Base HTTP Service (5 SP)
- US-026: Feature Services (8 SP)
- US-027: Interceptors (5 SP)

**Total**: 23 SP

---

### Sprint 9 (Días 26-28): Interactive Components
**Objetivo**: Componentes de UI avanzados

**Sprint Backlog**:
- US-028: Toast System (8 SP)
- US-029: Modal System (8 SP)
- US-030: UI Components (13 SP)

**Total**: 29 SP

---

### Sprint 10 (Días 29-31): Testing
**Objetivo**: Quality assurance

**Sprint Backlog**:
- US-031: Unit Tests (8 SP)
- US-032: Integration Tests (13 SP)

**Total**: 21 SP

---

### Sprint 11 (Días 32-33): Deployment
**Objetivo**: Producción y optimización

**Sprint Backlog**:
- US-033: Build Production (5 SP)
- US-034: Deployment (3 SP)
- US-035: Lighthouse Audit (5 SP)
- US-020: Account Settings (5 SP)

**Total**: 18 SP

---

## 📊 Burndown Chart (Estimado)

```
Story Points Remaining
260 |●
240 |  ●
220 |    ●
200 |      ●
180 |        ●
160 |          ●
140 |            ●
120 |              ●
100 |                ●
 80 |                  ●
 60 |                    ●
 40 |                      ●
 20 |                        ●
  0 |________________________●
    Sprint 1 2 3 4 5 6 7 8 9 10 11
```

**Total Story Points**: ~260 SP
**Estimated Duration**: 33 días laborables (~7 semanas)
**Velocity Target**: ~23 SP/sprint

---

## 🎨 Definition of Ready (DoR)

Una User Story está lista para sprint cuando:
- [ ] Tiene criterios de aceptación claros
- [ ] Está estimada en Story Points
- [ ] Las dependencias están identificadas
- [ ] El mockup/diseño está disponible
- [ ] Es entendida por el equipo

## ✅ Definition of Done (DoD)

Una User Story está completa cuando:
- [ ] Código implementado según AC
- [ ] Tests unitarios escritos y pasando
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Deployed en entorno de desarrollo
- [ ] Sin warnings de compilación
- [ ] Cumple estándares de accesibilidad (WCAG AA)
- [ ] Responsive en mobile/tablet/desktop

---

## 🚀 Release Plan

### Release 1.0 - MVP (Día 33)
**Scope**:
- ✅ Todas las páginas principales funcionales
- ✅ Sistema de autenticación
- ✅ CRUD completo de datos
- ✅ Temas claro/oscuro
- ✅ Responsive design
- ✅ Tests > 50% coverage
- ✅ Desplegado en producción

### Release 1.1 - Mejoras (Post-entrega)
**Scope**:
- [ ] PWA capabilities
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Optimizaciones adicionales

---

## 📝 Notas de Implementación

### Tecnologías Confirmadas
- **Framework**: Angular 20 standalone
- **Estilos**: SCSS con ITCSS
- **State Management**: Signals + Services
- **Forms**: Reactive Forms
- **HTTP**: HttpClient + Interceptors
- **Routing**: Angular Router con Lazy Loading
- **Charts**: Chart.js o ng2-charts
- **Icons**: SVG inline o custom icon font
- **Backend Mock**: json-server
- **Testing**: Jasmine/Karma (unit) + Cypress (e2e)
- **Deployment**: Netlify/Vercel
- **Fonts**: Google Fonts (Montserrat, Poppins)

### Estructura de Carpetas
```
src/
├── app/
│   ├── core/              # Servicios singleton
│   │   ├── auth/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── features/          # Módulos por funcionalidad
│   │   ├── home/
│   │   ├── training/
│   │   ├── nutrition/
│   │   ├── progress/
│   │   ├── auth/
│   │   └── onboarding/
│   ├── shared/            # Componentes/servicios compartidos
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   ├── validators/
│   │   └── models/
│   └── app.component.ts
├── styles/                # ITCSS layers
│   ├── settings/
│   ├── tools/
│   ├── generic/
│   ├── elements/
│   ├── objects/
│   ├── components/
│   └── utilities/
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

---

## 🎯 Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retraso en diseño de mockups | Baja | Alto | Ya tenemos todos los mockups |
| Complejidad de gráficos | Media | Medio | Usar librería madura (Chart.js) |
| Performance en mobile | Media | Alto | Testing continuo, lazy loading |
| Integración con backend real | Baja | Medio | json-server simula API completa |

---

Este planning sigue metodología Scrum adaptada para desarrollo individual. ¿Empezamos con el Sprint 1? 🚀