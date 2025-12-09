# COFIRA - Estado del Proyecto

> Resumen ejecutivo del proyecto Angular

## ✅ Completado

### 1. Análisis y Documentación
- [x] Análisis completo de mockups de Figma (12 páginas + componentes)
- [x] Sistema de diseño documentado ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md))
  - Paleta de colores completa (amarillo brand, grises, semánticos)
  - Tipografía (Montserrat + Poppins)
  - Sistema de espaciado y radios
  - Componentes UI documentados
  - Variables SCSS preparadas para ITCSS
- [x] Planning Scrum completo ([SCRUM_PLANNING.md](SCRUM_PLANNING.md))
  - 35 User Stories distribuidas en 11 sprints
  - ~260 Story Points totales
  - Definition of Done/Ready
  - Estimación: 33 días laborables

### 2. Configuración Inicial
- [x] Proyecto Angular 20.3.12 creado
  - Standalone components habilitados
  - SCSS configurado
  - Routing configurado
  - Estructura base generada

## 🚧 En Progreso

### Sprint 1: Foundation (Actual)
- [ ] Implementar estructura ITCSS completa
- [ ] Configurar design tokens como variables SCSS
- [ ] Sistema de temas claro/oscuro
- [ ] Componente Header/Navbar

## 📂 Estructura del Proyecto

```
proyecto_angular_DWEC_alejandrobravo/
├── cofira-app/                    # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   ├── styles/                # A crear: ITCSS structure
│   │   └── assets/
│   ├── angular.json
│   └── package.json
├── DESIGN_SYSTEM.md               # ✅ Sistema de diseño
├── SCRUM_PLANNING.md              # ✅ Planning completo
├── PROJECT_STATUS.md              # ✅ Este archivo
├── CRONOGRAMA.md                  # Cronograma oficial
├── FASE1.md                       # Manipulación DOM y Eventos
├── FASE2.md                       # Componentes y Comunicación
├── FASE3.md                       # Formularios Reactivos
├── FASE4.md                       # Rutas y Navegación
└── FASE5.md                       # Servicios y HTTP
```

## 🎯 Próximos Pasos Inmediatos

### Paso 1: Estructura ITCSS (Ahora)
Crear carpetas en `cofira-app/src/styles/`:
```
styles/
├── settings/      # Variables, mapas, configuración
│   ├── _colors.scss
│   ├── _typography.scss
│   ├── _spacing.scss
│   └── _radios.scss
├── tools/         # Mixins, funciones
│   ├── _mixins.scss
│   └── _functions.scss
├── generic/       # Resets, normalize
│   └── _reset.scss
├── elements/      # Estilos de elementos HTML
│   ├── _body.scss
│   ├── _headings.scss
│   └── _links.scss
├── objects/       # Layouts sin decoración
│   ├── _container.scss
│   └── _grid.scss
├── components/    # Componentes específicos
│   ├── _buttons.scss
│   ├── _forms.scss
│   └── _cards.scss
└── utilities/     # Clases de utilidad
    ├── _spacing.scss
    └── _text.scss
```

### Paso 2: Import Principal
Actualizar `src/styles.scss` con imports ITCSS:
```scss
// Settings
@import 'styles/settings/colors';
@import 'styles/settings/typography';
@import 'styles/settings/spacing';
@import 'styles/settings/radios';

// Tools
@import 'styles/tools/mixins';
@import 'styles/tools/functions';

// Generic
@import 'styles/generic/reset';

// Elements
@import 'styles/elements/body';
@import 'styles/elements/headings';
@import 'styles/elements/links';

// Objects
@import 'styles/objects/container';
@import 'styles/objects/grid';

// Components
@import 'styles/components/buttons';
@import 'styles/components/forms';
@import 'styles/components/cards';

// Utilities
@import 'styles/utilities/spacing';
@import 'styles/utilities/text';
```

### Paso 3: Google Fonts
Añadir en `src/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
```

### Paso 4: Componente AppComponent
Limpiar el template generado y crear estructura base:
```html
<app-header></app-header>
<router-outlet></router-outlet>
<app-footer></app-footer>
<app-toast-container></app-toast-container>
```

## 📊 Métricas del Proyecto

### Páginas a Implementar
1. ✅ Home (Hero + Planes + Newsletter)
2. ⏳ Entrenamiento (Tabla semanal + Retroalimentación)
3. ⏳ Alimentación (Menú diario + Modals ingredientes)
4. ⏳ Seguimiento (Gráficos nutrientes + Progreso fuerza)
5. ⏳ Preferencias (Alergias + Favoritos)
6. ⏳ Login/Registro/Reset
7. ⏳ Onboarding (5 pasos)

### Componentes Clave
- [ ] Header con navegación responsive
- [ ] Theme Toggle (claro/oscuro)
- [ ] Menú hamburguesa (mobile)
- [ ] Tabla de entrenamiento
- [ ] Calendario
- [ ] Gráfico circular (nutrientes)
- [ ] Gráfico de línea (progreso)
- [ ] Modal system
- [ ] Toast notifications
- [ ] Form controls (Input, Dropdown, Checkbox, Radio, etc.)
- [ ] Buttons (Primary, Secondary, Ghost)
- [ ] Cards (Standard, Pricing)
- [ ] Pills/Badges (preferencias)
- [ ] Footer

### Servicios a Implementar
- [ ] AuthService (login, register, logout)
- [ ] ThemeService (tema claro/oscuro)
- [ ] ToastService (notificaciones)
- [ ] LoadingService (spinner global)
- [ ] TrainingService (rutinas, ejercicios)
- [ ] NutritionService (menús, ingredientes)
- [ ] ProgressService (métricas, gráficos)
- [ ] PreferencesService (alergias, favoritos)
- [ ] OnboardingService (flujo multi-step)
- [ ] UserService (perfil, cuenta)

### Validadores Personalizados
- [ ] passwordStrength (mayúsculas, minúsculas, números, símbolos, 12+ chars)
- [ ] nif (formato español con validación letra)
- [ ] telefono (6/7 + 8 dígitos)
- [ ] codigoPostal (5 dígitos)
- [ ] passwordMatch (cross-field)
- [ ] emailUnique (async)
- [ ] usernameAvailable (async)

## 🎨 Temas Implementados

### Modo Claro (Light)
- Background principal: `#FFFFFF`
- Texto: `#0A0A0A`
- Cards: `#FFFFFF` con sombra sutil
- Brand color: `#FDB913` (amarillo)

### Modo Oscuro (Dark)
- Background principal: `#0A0A0A`
- Texto: `#FFFFFF`
- Cards: `#3B4455` (gris oscuro)
- Brand color: `#FDB913` (sin cambio)

## 📋 Fases del Proyecto

### FASE 1: Manipulación DOM y Eventos ✅ Planificada
- Manipulación del DOM con ViewChild, ElementRef, Renderer2
- Event binding (click, keyboard, mouse, focus/blur)
- Componentes interactivos (menú, modales, tabs, tooltips)
- Theme switcher funcional con localStorage

### FASE 2: Componentes y Comunicación ✅ Planificada
- Servicios de comunicación (BehaviorSubject)
- Separación de responsabilidades (Smart/Dumb components)
- Sistema de notificaciones/toasts
- Loading states global y local

### FASE 3: Formularios Reactivos ✅ Planificada
- FormBuilder con validadores síncronos
- Validadores personalizados (NIF, teléfono, CP, password)
- Validadores asíncronos (email único, username disponible)
- FormArray para listas dinámicas
- Validación cross-field
- Feedback visual completo

### FASE 4: Rutas y Navegación ✅ Planificada
- Rutas principales con parámetros
- Rutas hijas anidadas
- Lazy loading de módulos
- Route Guards (CanActivate, CanDeactivate)
- Resolvers para precargar datos
- Breadcrumbs dinámicos
- Ruta 404

### FASE 5: Servicios HTTP ✅ Planificada
- HttpClient configurado
- json-server como backend mock
- Operaciones CRUD completas
- Interceptores (Auth, Loading, Error)
- Manejo de errores robusto
- Loading/error/empty states
- Retry logic

## 🚀 Tecnologías Usadas

### Core
- **Angular**: 20.3.12
- **TypeScript**: Latest
- **SCSS**: Con ITCSS
- **Node.js**: v25.2.1

### Librerías a Instalar
```bash
# Charts
npm install chart.js ng2-charts

# Backend Mock
npm install -D json-server

# Testing (ya incluidas)
# - Jasmine/Karma (unit tests)
# - Cypress/Playwright (e2e tests) - opcional

# Utilidades
npm install date-fns  # Manejo de fechas
```

### Arquitectura
- **Standalone Components**: Por defecto en Angular 20
- **Signals**: Para estado reactivo
- **SCSS con ITCSS**: 7 capas organizadas
- **Lazy Loading**: Módulos feature cargados bajo demanda
- **HttpClient + Interceptors**: Comunicación con API

## 📅 Timeline

### Semana 1 (Días 1-7)
- [x] Setup inicial + Documentación
- [ ] Sprint 1: Foundation (Temas, Layout base)
- [ ] Sprint 2: Navigation & Core Pages (Rutas, Home)

### Semana 2 (Días 8-14)
- [ ] Sprint 3: Training & Nutrition
- [ ] Sprint 4: Progress & Charts

### Semana 3 (Días 15-21)
- [ ] Sprint 5: Authentication
- [ ] Sprint 6: Onboarding & Preferences

### Semana 4 (Días 22-28)
- [ ] Sprint 7: Forms & Validation
- [ ] Sprint 8: HTTP & Backend

### Semana 5 (Días 29-33)
- [ ] Sprint 9: Interactive Components
- [ ] Sprint 10: Testing
- [ ] Sprint 11: Deployment

**Fecha límite**: 18 de diciembre (paralelo a DIW)

## ✨ Features Destacadas

### 1. Sistema de Temas
- Toggle entre claro/oscuro con animación suave
- Persistencia en localStorage
- Detección automática de `prefers-color-scheme`
- CSS variables para fácil mantenimiento

### 2. Responsive Design
- Mobile-first approach
- Breakpoints: 576px, 768px, 992px, 1200px, 1440px
- Menú hamburguesa en mobile
- Grid system flexible

### 3. Formularios Avanzados
- Validación en tiempo real
- Mensajes de error específicos
- Validadores personalizados españoles (NIF, teléfono)
- Validación asíncrona con debounce
- FormArray para listas dinámicas

### 4. Visualización de Datos
- Gráfico circular de macronutrientes
- Gráfico de línea de progreso temporal
- Tabla interactiva de entrenamiento
- Calendario con selección de fechas

### 5. Experiencia de Usuario
- Loading states consistentes
- Toast notifications con auto-dismiss
- Modal system con backdrop y ESC
- Smooth animations y transitions
- Feedback visual inmediato

## 🧪 Testing Strategy

### Unit Tests (Objetivo: >50% coverage)
- Servicios: AuthService, ThemeService, ToastService
- Validators: Todos los custom y async
- Pipes: Si se crean (currency, date format, etc.)
- Utilities: Funciones helper

### Integration Tests
- Flujo completo: Registro → Onboarding → Dashboard
- Flujo autenticación: Login → Logout
- Flujo entrenamiento: Marcar ejercicios completados
- Flujo navegación: Cambio de tema persiste

### E2E Tests (Opcional)
- Cypress para flujos críticos
- User journeys completos

## 📦 Deployment

### Build
```bash
ng build --configuration production
```

### Hosting Options
1. **Netlify** (Recomendado)
   - Drop `dist/cofira-app/browser/` folder
   - Auto SSL
   - Continuous deployment from Git

2. **Vercel**
   - Similar a Netlify
   - Excelente para Angular

3. **Firebase Hosting**
   - `firebase init hosting`
   - `firebase deploy`

### Performance Targets
- Lighthouse Performance: >80
- Lighthouse Accessibility: >90
- Bundle size (initial): <500KB
- Time to Interactive: <3s

## 🎓 Cumplimiento de Requisitos

### Criterios de Evaluación Cubiertos

**RA6: Desarrollo con frameworks JS**
- ✅ a) Manipulación del DOM (ViewChild, Renderer2)
- ✅ c) Event handling
- ✅ d) Formularios reactivos
- ✅ e) Validación avanzada
- ✅ g) Componentes y servicios
- ✅ h) Arquitectura escalable

**RA7: Comunicación asíncrona**
- ✅ a-g) HttpClient, CRUD, interceptores, error handling

## 📞 Contacto y Recursos

- **Proyecto**: COFIRA - Sistema integral de entrenamiento y nutrición
- **Alumno**: Alejandro Bravo Calderón
- **Repositorio**: proyecto_angular_DWEC_alejandrobravo
- **Entrega**: 18 de diciembre 2025

---

**Última actualización**: 9 de diciembre 2025
**Estado**: 🟢 En progreso - Sprint 1
**Progreso general**: ~5% completado
