# COFIRA - Guía de Implementación Completa

> Instrucciones paso a paso para implementar todo el proyecto Angular sin ambigüedades

## 🎯 OBJETIVO FINAL

Crear una aplicación web Angular 20 llamada **COFIRA** que sea un sistema integral de entrenamiento, nutrición y seguimiento de progreso. La aplicación debe ser **idéntica** a los mockups de Figma proporcionados, con funcionalidad completa siguiendo las 5 fases especificadas.

---

## 📋 REQUISITOS TÉCNICOS OBLIGATORIOS

### Tecnologías
- **Angular**: 20.3.12 (standalone components)
- **Estilos**: SCSS con arquitectura ITCSS
- **Tipado**: TypeScript strict mode
- **Formularios**: Reactive Forms con validadores personalizados
- **HTTP**: HttpClient con interceptores
- **Routing**: Angular Router con lazy loading
- **State Management**: Signals + Services (BehaviorSubject)
- **Charts**: Chart.js o ng2-charts
- **Backend Mock**: json-server
- **Testing**: Jasmine/Karma (>50% coverage)

### Arquitectura
```
cofira-app/
├── src/
│   ├── app/
│   │   ├── core/                    # Servicios singleton, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.guard.ts
│   │   │   ├── guards/
│   │   │   │   ├── can-deactivate.guard.ts
│   │   │   │   └── auth-redirect.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── loading.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── services/
│   │   │       ├── base-http.service.ts
│   │   │       ├── theme.service.ts
│   │   │       ├── loading.service.ts
│   │   │       └── toast.service.ts
│   │   ├── features/                # Módulos por funcionalidad (lazy loaded)
│   │   │   ├── home/
│   │   │   │   ├── home.component.ts
│   │   │   │   ├── home.component.html
│   │   │   │   ├── home.component.scss
│   │   │   │   ├── components/
│   │   │   │   │   ├── hero-section/
│   │   │   │   │   ├── pricing-plans/
│   │   │   │   │   └── newsletter-form/
│   │   │   │   └── home.routes.ts
│   │   │   ├── training/
│   │   │   │   ├── training.component.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── weekly-table/
│   │   │   │   │   ├── exercise-row/
│   │   │   │   │   └── feedback-form/
│   │   │   │   ├── services/
│   │   │   │   │   └── training.service.ts
│   │   │   │   └── training.routes.ts
│   │   │   ├── nutrition/
│   │   │   │   ├── nutrition.component.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── daily-menu/
│   │   │   │   │   ├── meal-section/
│   │   │   │   │   ├── food-item/
│   │   │   │   │   └── ingredients-modal/
│   │   │   │   ├── services/
│   │   │   │   │   └── nutrition.service.ts
│   │   │   │   └── nutrition.routes.ts
│   │   │   ├── progress/
│   │   │   │   ├── progress.component.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── nutrient-counter/
│   │   │   │   │   └── strength-chart/
│   │   │   │   ├── services/
│   │   │   │   │   └── progress.service.ts
│   │   │   │   └── progress.routes.ts
│   │   │   ├── preferences/
│   │   │   │   ├── preferences.component.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── searchable-tags/
│   │   │   │   │   └── account-settings/
│   │   │   │   ├── services/
│   │   │   │   │   └── preferences.service.ts
│   │   │   │   └── preferences.routes.ts
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── reset-password/
│   │   │   │   └── auth.routes.ts
│   │   │   └── onboarding/
│   │   │       ├── onboarding-container/
│   │   │       ├── steps/
│   │   │       │   ├── about/
│   │   │       │   ├── nutrition/
│   │   │       │   ├── goal/
│   │   │       │   ├── pricing/
│   │   │       │   └── muscles/
│   │   │       ├── services/
│   │   │       │   └── onboarding.service.ts
│   │   │       └── onboarding.routes.ts
│   │   ├── shared/                  # Componentes/servicios compartidos
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   ├── modal/
│   │   │   │   ├── toast/
│   │   │   │   ├── spinner/
│   │   │   │   ├── calendar/
│   │   │   │   ├── breadcrumbs/
│   │   │   │   └── ui/             # Componentes UI reutilizables
│   │   │   │       ├── button/
│   │   │   │       ├── input/
│   │   │   │       ├── dropdown/
│   │   │   │       ├── checkbox/
│   │   │   │       ├── radio/
│   │   │   │       └── badge/
│   │   │   ├── validators/
│   │   │   │   ├── password-strength.validator.ts
│   │   │   │   ├── spanish-formats.validator.ts
│   │   │   │   ├── cross-field.validators.ts
│   │   │   │   └── async-validators.service.ts
│   │   │   ├── models/             # Interfaces TypeScript
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── exercise.model.ts
│   │   │   │   ├── meal.model.ts
│   │   │   │   ├── ingredient.model.ts
│   │   │   │   └── progress.model.ts
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles/                      # ITCSS Architecture
│   │   ├── settings/
│   │   │   ├── _colors.scss
│   │   │   ├── _typography.scss
│   │   │   ├── _spacing.scss
│   │   │   ├── _radios.scss
│   │   │   └── _breakpoints.scss
│   │   ├── tools/
│   │   │   ├── _mixins.scss
│   │   │   └── _functions.scss
│   │   ├── generic/
│   │   │   └── _reset.scss
│   │   ├── elements/
│   │   │   ├── _body.scss
│   │   │   ├── _headings.scss
│   │   │   └── _links.scss
│   │   ├── objects/
│   │   │   ├── _container.scss
│   │   │   └── _grid.scss
│   │   ├── components/
│   │   │   ├── _buttons.scss
│   │   │   ├── _forms.scss
│   │   │   ├── _cards.scss
│   │   │   ├── _modals.scss
│   │   │   └── _tables.scss
│   │   └── utilities/
│   │       ├── _spacing.scss
│   │       ├── _text.scss
│   │       └── _display.scss
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── styles.scss                  # Import principal ITCSS
│   └── index.html
├── db.json                          # json-server database
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 📝 PASO 1: CONFIGURACIÓN INICIAL DEL PROYECTO

### 1.1 Crear Estructura de Carpetas

```bash
cd cofira-app/src

# Crear estructura de features
mkdir -p app/features/{home,training,nutrition,progress,preferences,auth,onboarding}

# Crear estructura de core
mkdir -p app/core/{auth,guards,interceptors,services}

# Crear estructura de shared
mkdir -p app/shared/{components,validators,models,pipes,directives}
mkdir -p app/shared/components/{header,footer,modal,toast,spinner,calendar,breadcrumbs,ui}
mkdir -p app/shared/components/ui/{button,input,dropdown,checkbox,radio,badge}

# Crear estructura ITCSS
mkdir -p styles/{settings,tools,generic,elements,objects,components,utilities}

# Crear carpeta assets
mkdir -p assets/{images,icons,fonts}
```

### 1.2 Instalar Dependencias

```bash
cd cofira-app

# Chart.js para gráficos
npm install chart.js ng2-charts

# json-server para backend mock
npm install -D json-server

# date-fns para manejo de fechas
npm install date-fns

# Concurrently para correr dev server y json-server juntos
npm install -D concurrently
```

### 1.3 Actualizar package.json Scripts

```json
{
  "scripts": {
    "start": "ng serve",
    "api": "json-server --watch db.json --port 3000",
    "dev": "concurrently \"npm start\" \"npm run api\"",
    "build": "ng build",
    "test": "ng test",
    "test:coverage": "ng test --code-coverage",
    "lint": "ng lint"
  }
}
```

---

## 🎨 PASO 2: IMPLEMENTAR DESIGN SYSTEM (ITCSS)

### 2.1 Settings Layer

#### `src/styles/settings/_colors.scss`
```scss
// Brand Colors
$color-brand-primary: #FDB913;
$color-brand-primary-hover: #E5A611;
$color-brand-primary-active: #CC9310;
$color-brand-primary-dark: #B8850E;

// Dark Colors
$color-dark-primary: #3B4455;
$color-dark-secondary: #2F3742;
$color-dark-tertiary: #1F232B;

// Neutral Colors
$color-black: #0A0A0A;
$color-white: #FFFFFF;
$color-gray-light: #E8E8E8;
$color-gray-medium: #B8B8B8;
$color-gray-dark: #666666;
$color-gray-disabled: #999999;

// Semantic Colors
$color-success: #4CAF50;
$color-error: #F44336;
$color-info: #2196F3;
$color-warning: #FF9800;

// Overlay
$color-overlay: rgba(0, 0, 0, 0.6);

// CSS Custom Properties para theming
:root {
  // Light theme (default)
  --bg-primary: #{$color-white};
  --bg-secondary: #{$color-gray-light};
  --bg-tertiary: #F5F5F5;
  --text-primary: #{$color-black};
  --text-secondary: #{$color-gray-dark};
  --text-disabled: #{$color-gray-disabled};
  --card-bg: #{$color-white};
  --card-border: #{$color-gray-light};
  --input-bg: #{$color-white};
  --input-border: #{$color-gray-light};
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  // Dark theme
  --bg-primary: #{$color-black};
  --bg-secondary: #{$color-dark-tertiary};
  --bg-tertiary: #{$color-dark-secondary};
  --text-primary: #{$color-white};
  --text-secondary: #{$color-gray-medium};
  --text-disabled: #{$color-gray-dark};
  --card-bg: #{$color-dark-primary};
  --card-border: #{$color-dark-secondary};
  --input-bg: #{$color-dark-secondary};
  --input-border: #{$color-dark-primary};
  --shadow: none;
}
```

#### `src/styles/settings/_typography.scss`
```scss
// Font Families
$font-family-base: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-family-heading: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

// Font Sizes
$font-size-h1: 3rem;        // 48px
$font-size-h2: 2.25rem;     // 36px
$font-size-h3: 1.5rem;      // 24px
$font-size-h4: 1.25rem;     // 20px
$font-size-body: 1rem;      // 16px
$font-size-small: 0.875rem; // 14px
$font-size-tiny: 0.75rem;   // 12px

// Font Weights
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Line Heights
$line-height-tight: 1.2;
$line-height-snug: 1.3;
$line-height-normal: 1.5;
$line-height-relaxed: 1.6;
```

#### `src/styles/settings/_spacing.scss`
```scss
// Spacing Scale (basado en 8px)
$spacing-xss: 4px;
$spacing-xs: 8px;
$spacing-s: 16px;
$spacing-m: 24px;
$spacing-l: 32px;
$spacing-xl: 40px;
$spacing-xxl: 48px;
$spacing-xxxl: 64px;
$spacing-xxxxl: 80px;

// Spacing Map para loops
$spacing-map: (
  'xss': $spacing-xss,
  'xs': $spacing-xs,
  's': $spacing-s,
  'm': $spacing-m,
  'l': $spacing-l,
  'xl': $spacing-xl,
  'xxl': $spacing-xxl,
  'xxxl': $spacing-xxxl,
  'xxxxl': $spacing-xxxxl
);
```

#### `src/styles/settings/_radios.scss`
```scss
// Border Radius
$radius-xss: 4px;
$radius-xs: 8px;
$radius-s: 12px;
$radius-m: 16px;
$radius-l: 24px;
$radius-xl: 32px;
$radius-circle: 50%;
$radius-pill: 9999px;
```

#### `src/styles/settings/_breakpoints.scss`
```scss
// Breakpoints
$breakpoint-xs: 0;
$breakpoint-s: 576px;
$breakpoint-m: 768px;
$breakpoint-l: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1440px;

// Container Max Widths
$container-xs: 100%;
$container-s: 540px;
$container-m: 720px;
$container-l: 960px;
$container-xl: 1140px;
$container-xxl: 1320px;
```

### 2.2 Tools Layer

#### `src/styles/tools/_mixins.scss`
```scss
// Responsive Breakpoints
@mixin respond-to($breakpoint) {
  @if $breakpoint == 's' {
    @media (min-width: $breakpoint-s) { @content; }
  } @else if $breakpoint == 'm' {
    @media (min-width: $breakpoint-m) { @content; }
  } @else if $breakpoint == 'l' {
    @media (min-width: $breakpoint-l) { @content; }
  } @else if $breakpoint == 'xl' {
    @media (min-width: $breakpoint-xl) { @content; }
  } @else if $breakpoint == 'xxl' {
    @media (min-width: $breakpoint-xxl) { @content; }
  }
}

// Flexbox Utilities
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// Transitions
@mixin transition($properties: all, $duration: 300ms, $easing: ease-in-out) {
  transition: $properties $duration $easing;
}

// Truncate Text
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Line Clamp
@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Focus Styles
@mixin focus-visible {
  &:focus-visible {
    outline: 2px solid $color-brand-primary;
    outline-offset: 2px;
  }
}

// Button Reset
@mixin button-reset {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

// Visually Hidden (accesibilidad)
@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// Card Base
@mixin card {
  background: var(--card-bg);
  border-radius: $radius-m;
  padding: $spacing-m;
  box-shadow: var(--shadow);
}
```

#### `src/styles/tools/_functions.scss`
```scss
// Convertir px a rem
@function rem($px) {
  @return calc($px / 16px) * 1rem;
}

// Get spacing value
@function spacing($key) {
  @return map-get($spacing-map, $key);
}
```

### 2.3 Generic Layer

#### `src/styles/generic/_reset.scss`
```scss
// CSS Reset moderno
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  overflow-x: hidden;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

button {
  cursor: pointer;
}

a {
  text-decoration: none;
  color: inherit;
}

ul, ol {
  list-style: none;
}
```

### 2.4 Elements Layer

#### `src/styles/elements/_body.scss`
```scss
body {
  font-family: $font-family-base;
  font-size: $font-size-body;
  font-weight: $font-weight-regular;
  line-height: $line-height-relaxed;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  @include transition(background-color, 300ms);
}
```

#### `src/styles/elements/_headings.scss`
```scss
h1, h2, h3, h4, h5, h6 {
  font-family: $font-family-heading;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
  color: var(--text-primary);
  margin-bottom: $spacing-s;
}

h1 {
  font-size: $font-size-h1;

  @include respond-to(m) {
    font-size: $font-size-h1;
  }
}

h2 {
  font-size: $font-size-h2;
}

h3 {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
}

h4 {
  font-size: $font-size-h4;
  font-family: $font-family-base;
  font-weight: $font-weight-semibold;
}
```

#### `src/styles/elements/_links.scss`
```scss
a {
  color: $color-brand-primary;
  @include transition(color);

  &:hover {
    color: $color-brand-primary-hover;
  }

  @include focus-visible;
}
```

### 2.5 Objects Layer

#### `src/styles/objects/_container.scss`
```scss
.o-container {
  width: 100%;
  max-width: $container-xxl;
  margin-left: auto;
  margin-right: auto;
  padding-left: $spacing-s;
  padding-right: $spacing-s;

  @include respond-to(m) {
    padding-left: $spacing-m;
    padding-right: $spacing-m;
  }

  &--narrow {
    max-width: $container-l;
  }

  &--wide {
    max-width: 100%;
  }
}
```

#### `src/styles/objects/_grid.scss`
```scss
.o-grid {
  display: grid;
  gap: $spacing-m;

  &--2-cols {
    grid-template-columns: repeat(2, 1fr);
  }

  &--3-cols {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  &--4-cols {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

.o-flex {
  display: flex;
  gap: $spacing-s;

  &--center {
    @include flex-center;
  }

  &--between {
    @include flex-between;
  }

  &--column {
    flex-direction: column;
  }

  &--wrap {
    flex-wrap: wrap;
  }
}
```

### 2.6 Components Layer

#### `src/styles/components/_buttons.scss`
```scss
.c-button {
  @include button-reset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-s $spacing-l;
  border-radius: $radius-xs;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  font-family: $font-family-base;
  text-align: center;
  white-space: nowrap;
  @include transition(all, 150ms);
  @include focus-visible;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  // Primary Button
  &--primary {
    background-color: $color-brand-primary;
    color: $color-black;

    &:hover:not(:disabled) {
      background-color: $color-brand-primary-hover;
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      background-color: $color-brand-primary-active;
      transform: translateY(0);
    }
  }

  // Secondary Button
  &--secondary {
    background-color: transparent;
    border: 2px solid var(--text-primary);
    color: var(--text-primary);
    padding: calc(#{$spacing-s} - 2px) calc(#{$spacing-l} - 2px);

    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  // Ghost Button
  &--ghost {
    background-color: transparent;
    color: var(--text-primary);

    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }

  // Sizes
  &--small {
    padding: $spacing-xs $spacing-s;
    font-size: $font-size-small;
  }

  &--large {
    padding: $spacing-m $spacing-xl;
    font-size: $font-size-body;
  }

  // Full Width
  &--full {
    width: 100%;
  }
}
```

#### `src/styles/components/_forms.scss`
```scss
.c-form {
  &__group {
    margin-bottom: $spacing-m;
  }

  &__label {
    display: block;
    margin-bottom: $spacing-xs;
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
    color: var(--text-primary);
  }

  &__input,
  &__textarea,
  &__select {
    width: 100%;
    padding: $spacing-s;
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: $radius-xs;
    color: var(--text-primary);
    font-size: $font-size-body;
    font-family: $font-family-base;
    @include transition(border-color);

    &::placeholder {
      color: var(--text-disabled);
    }

    &:focus {
      outline: none;
      border-color: $color-brand-primary;
      box-shadow: 0 0 0 2px rgba($color-brand-primary, 0.2);
    }

    &--error {
      border-color: $color-error;

      &:focus {
        box-shadow: 0 0 0 2px rgba($color-error, 0.2);
      }
    }

    &--success {
      border-color: $color-success;
    }

    &:disabled {
      background-color: var(--bg-secondary);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__textarea {
    min-height: 100px;
    resize: vertical;
  }

  &__error {
    display: block;
    margin-top: $spacing-xs;
    color: $color-error;
    font-size: $font-size-small;
  }

  &__hint {
    display: block;
    margin-top: $spacing-xs;
    color: var(--text-secondary);
    font-size: $font-size-small;
  }

  &__loading {
    color: $color-info;
    font-size: $font-size-small;
    font-style: italic;
  }
}

// Checkbox y Radio
.c-checkbox,
.c-radio {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  cursor: pointer;

  input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: $color-brand-primary;
  }

  label {
    cursor: pointer;
    user-select: none;
  }
}
```

#### `src/styles/components/_cards.scss`
```scss
.c-card {
  @include card;

  &__header {
    margin-bottom: $spacing-s;
    padding-bottom: $spacing-s;
    border-bottom: 1px solid var(--card-border);
  }

  &__title {
    font-size: $font-size-h3;
    font-weight: $font-weight-semibold;
    margin: 0;
  }

  &__body {
    color: var(--text-primary);
  }

  &__footer {
    margin-top: $spacing-s;
    padding-top: $spacing-s;
    border-top: 1px solid var(--card-border);
  }

  // Pricing Card
  &--pricing {
    background-color: $color-dark-primary;
    color: $color-white;
    text-align: center;
    padding: $spacing-l $spacing-m;

    &--featured {
      border: 2px solid $color-brand-primary;
    }
  }
}
```

#### `src/styles/components/_modals.scss`
```scss
.c-modal {
  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $color-overlay;
    @include flex-center;
    z-index: 1000;
    padding: $spacing-m;
  }

  &__content {
    position: relative;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    background-color: var(--card-bg);
    border-radius: $radius-m;
    padding: $spacing-l;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  &__close {
    position: absolute;
    top: $spacing-s;
    right: $spacing-s;
    @include button-reset;
    width: 32px;
    height: 32px;
    @include flex-center;
    border-radius: $radius-xs;
    color: var(--text-secondary);

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
      color: var(--text-primary);
    }
  }

  &__header {
    margin-bottom: $spacing-m;
    padding-right: $spacing-xl; // espacio para botón close
  }

  &__title {
    font-size: $font-size-h3;
    margin: 0;
  }

  &__body {
    margin-bottom: $spacing-m;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-s;
  }
}
```

#### `src/styles/components/_tables.scss`
```scss
.c-table {
  width: 100%;
  border-collapse: collapse;

  &__header {
    background-color: var(--bg-secondary);
    border-bottom: 2px solid var(--card-border);
  }

  &__row {
    border-bottom: 1px solid var(--card-border);
    @include transition(background-color);

    &:hover {
      background-color: var(--bg-secondary);
    }
  }

  &__cell,
  &__header-cell {
    padding: $spacing-s;
    text-align: left;
  }

  &__header-cell {
    font-weight: $font-weight-semibold;
    color: var(--text-primary);
  }

  &__cell {
    color: var(--text-primary);
  }

  // Responsive table
  @media (max-width: $breakpoint-m) {
    &--responsive {
      display: block;

      thead {
        display: none;
      }

      tbody, tr, td {
        display: block;
      }

      tr {
        margin-bottom: $spacing-m;
        border: 1px solid var(--card-border);
        border-radius: $radius-xs;
      }

      td {
        padding: $spacing-s;
        position: relative;
        padding-left: 50%;

        &::before {
          content: attr(data-label);
          position: absolute;
          left: $spacing-s;
          font-weight: $font-weight-semibold;
        }
      }
    }
  }
}
```

### 2.7 Utilities Layer

#### `src/styles/utilities/_spacing.scss`
```scss
// Margin utilities
@each $name, $value in $spacing-map {
  .u-mt-#{$name} { margin-top: $value !important; }
  .u-mb-#{$name} { margin-bottom: $value !important; }
  .u-ml-#{$name} { margin-left: $value !important; }
  .u-mr-#{$name} { margin-right: $value !important; }
  .u-mx-#{$name} {
    margin-left: $value !important;
    margin-right: $value !important;
  }
  .u-my-#{$name} {
    margin-top: $value !important;
    margin-bottom: $value !important;
  }
  .u-m-#{$name} { margin: $value !important; }
}

// Padding utilities
@each $name, $value in $spacing-map {
  .u-pt-#{$name} { padding-top: $value !important; }
  .u-pb-#{$name} { padding-bottom: $value !important; }
  .u-pl-#{$name} { padding-left: $value !important; }
  .u-pr-#{$name} { padding-right: $value !important; }
  .u-px-#{$name} {
    padding-left: $value !important;
    padding-right: $value !important;
  }
  .u-py-#{$name} {
    padding-top: $value !important;
    padding-bottom: $value !important;
  }
  .u-p-#{$name} { padding: $value !important; }
}

// Zero spacing
.u-m-0 { margin: 0 !important; }
.u-p-0 { padding: 0 !important; }
```

#### `src/styles/utilities/_text.scss`
```scss
.u-text {
  &-left { text-align: left !important; }
  &-center { text-align: center !important; }
  &-right { text-align: right !important; }

  &-uppercase { text-transform: uppercase !important; }
  &-lowercase { text-transform: lowercase !important; }
  &-capitalize { text-transform: capitalize !important; }

  &-bold { font-weight: $font-weight-bold !important; }
  &-semibold { font-weight: $font-weight-semibold !important; }
  &-medium { font-weight: $font-weight-medium !important; }
  &-normal { font-weight: $font-weight-regular !important; }

  &-small { font-size: $font-size-small !important; }
  &-tiny { font-size: $font-size-tiny !important; }

  &-truncate { @include truncate; }
  &-line-clamp-2 { @include line-clamp(2); }
  &-line-clamp-3 { @include line-clamp(3); }

  &-primary { color: var(--text-primary) !important; }
  &-secondary { color: var(--text-secondary) !important; }
  &-brand { color: $color-brand-primary !important; }
  &-success { color: $color-success !important; }
  &-error { color: $color-error !important; }
  &-warning { color: $color-warning !important; }
  &-info { color: $color-info !important; }
}
```

#### `src/styles/utilities/_display.scss`
```scss
.u-display {
  &-none { display: none !important; }
  &-block { display: block !important; }
  &-inline-block { display: inline-block !important; }
  &-flex { display: flex !important; }
  &-inline-flex { display: inline-flex !important; }
  &-grid { display: grid !important; }
}

.u-visibility {
  &-hidden { visibility: hidden !important; }
  &-visible { visibility: visible !important; }
}

.u-sr-only {
  @include visually-hidden;
}

// Responsive display utilities
@each $breakpoint in (s, m, l, xl) {
  @include respond-to($breakpoint) {
    .u-display-#{$breakpoint}-none { display: none !important; }
    .u-display-#{$breakpoint}-block { display: block !important; }
    .u-display-#{$breakpoint}-flex { display: flex !important; }
  }
}
```

### 2.8 Main Styles File

#### `src/styles.scss`
```scss
// ============================================================================
// COFIRA - Main Styles (ITCSS Architecture)
// ============================================================================

// Settings: Variables, maps, configuration
@import 'styles/settings/colors';
@import 'styles/settings/typography';
@import 'styles/settings/spacing';
@import 'styles/settings/radios';
@import 'styles/settings/breakpoints';

// Tools: Mixins, functions
@import 'styles/tools/mixins';
@import 'styles/tools/functions';

// Generic: Resets, normalize
@import 'styles/generic/reset';

// Elements: HTML element styles
@import 'styles/elements/body';
@import 'styles/elements/headings';
@import 'styles/elements/links';

// Objects: Layout patterns without decoration
@import 'styles/objects/container';
@import 'styles/objects/grid';

// Components: Specific UI components
@import 'styles/components/buttons';
@import 'styles/components/forms';
@import 'styles/components/cards';
@import 'styles/components/modals';
@import 'styles/components/tables';

// Utilities: Helper classes, overrides
@import 'styles/utilities/spacing';
@import 'styles/utilities/text';
@import 'styles/utilities/display';

// ============================================================================
// Global Styles
// ============================================================================

// Smooth scrolling
html {
  scroll-behavior: smooth;
}

// Focus visible polyfill
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid $color-brand-primary;
  outline-offset: 2px;
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Animation utility classes
.u-animate {
  &-fade-in {
    animation: fadeIn 300ms ease-in-out;
  }

  &-slide-in-up {
    animation: slideInUp 300ms ease-out;
  }

  &-slide-in-down {
    animation: slideInDown 300ms ease-out;
  }

  &-spin {
    animation: spin 1s linear infinite;
  }
}
```

### 2.9 Update index.html

#### `src/index.html`
```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>COFIRA - Tu entrenamiento, nutrición y progreso</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="COFIRA: Sistema integral de entrenamiento, nutrición y seguimiento de progreso personalizado">
  <meta name="theme-color" content="#FDB913">
  <link rel="icon" type="image/x-icon" href="favicon.ico">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

---

## 🔧 PASO 3: CONFIGURAR SERVICES CORE

### 3.1 Theme Service

#### `src/app/core/services/theme.service.ts`
```typescript
import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal para el tema actual
  currentTheme = signal<Theme>('light');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    // 1. Intentar leer de localStorage
    const savedTheme = localStorage.getItem('cofira-theme') as Theme | null;

    if (savedTheme) {
      this.setTheme(savedTheme);
      return;
    }

    // 2. Si no hay guardado, detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme: Theme = prefersDark ? 'dark' : 'light';
    this.setTheme(defaultTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cofira-theme', theme);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
```

### 3.2 Toast Service

#### `src/app/shared/models/toast.model.ts`
```typescript
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}
```

#### `src/app/core/services/toast.service.ts`
```typescript
import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType, ToastConfig } from '../../shared/models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Signal con array de toasts activos
  toasts = signal<ToastMessage[]>([]);

  private readonly DEFAULT_DURATIONS: Record<ToastType, number> = {
    success: 4000,
    error: 8000,
    info: 3000,
    warning: 6000
  };

  show(config: ToastConfig): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      message: config.message,
      type: config.type,
      duration: config.duration ?? this.DEFAULT_DURATIONS[config.type]
    };

    // Añadir toast al array
    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-dismiss si duration > 0
    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  dismiss(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 3.3 Loading Service

#### `src/app/core/services/loading.service.ts`
```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal para estado de loading
  isLoading = signal<boolean>(false);

  // Contador de requests pendientes
  private requestCount = 0;

  show(): void {
    this.requestCount++;
    this.isLoading.set(true);
  }

  hide(): void {
    this.requestCount--;

    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.isLoading.set(false);
    }
  }

  reset(): void {
    this.requestCount = 0;
    this.isLoading.set(false);
  }
}
```

---

## 📄 PASO 4: CREAR COMPONENTES BASE

### 4.1 App Component

#### `src/app/app.component.ts`
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { LoadingSpinnerComponent } from './shared/components/spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastContainerComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'COFIRA';
}
```

#### `src/app/app.component.html`
```html
<app-header></app-header>

<main class="main-content">
  <router-outlet></router-outlet>
</main>

<app-footer></app-footer>

<!-- Global Components -->
<app-toast-container></app-toast-container>
<app-loading-spinner></app-loading-spinner>
```

#### `src/app/app.component.scss`
```scss
:host {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-top: 80px; // altura del header
}
```

### 4.2 Header Component

#### `src/app/shared/components/header/header.component.ts`
```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isMobileMenuOpen = signal<boolean>(false);

  constructor(public themeService: ThemeService) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
```

#### `src/app/shared/components/header/header.component.html`
```html
<header class="header">
  <div class="o-container">
    <div class="header__inner">
      <!-- Logo -->
      <a routerLink="/" class="header__logo">
        <span class="header__logo-text">COFIRA</span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="header__nav header__nav--desktop">
        <a
          routerLink="/entrenamiento"
          routerLinkActive="header__nav-link--active"
          class="header__nav-link">
          Entrenamiento
        </a>
        <a
          routerLink="/alimentacion"
          routerLinkActive="header__nav-link--active"
          class="header__nav-link">
          Alimentación
        </a>
        <a
          routerLink="/seguimiento"
          routerLinkActive="header__nav-link--active"
          class="header__nav-link">
          Seguimiento
        </a>
      </nav>

      <!-- Actions -->
      <div class="header__actions">
        <!-- Theme Toggle -->
        <button
          class="header__theme-toggle"
          (click)="toggleTheme()"
          [attr.aria-label]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
          <span class="header__theme-icon">
            {{ themeService.isDark() ? '☀️' : '🌙' }}
          </span>
        </button>

        <!-- Auth Buttons -->
        <button class="c-button c-button--primary c-button--small">
          Inscríbete
        </button>
        <button class="c-button c-button--secondary c-button--small">
          Cuenta
        </button>

        <!-- Mobile Menu Button -->
        <button
          class="header__hamburger"
          (click)="toggleMobileMenu()"
          [attr.aria-expanded]="isMobileMenuOpen()"
          aria-label="Menú de navegación">
          <span class="header__hamburger-line"></span>
          <span class="header__hamburger-line"></span>
          <span class="header__hamburger-line"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Navigation -->
  @if (isMobileMenuOpen()) {
    <nav class="header__nav header__nav--mobile" (click)="closeMobileMenu()">
      <a
        routerLink="/entrenamiento"
        routerLinkActive="header__nav-link--active"
        class="header__nav-link">
        Entrenamiento
      </a>
      <a
        routerLink="/alimentacion"
        routerLinkActive="header__nav-link--active"
        class="header__nav-link">
        Alimentación
      </a>
      <a
        routerLink="/seguimiento"
        routerLinkActive="header__nav-link--active"
        class="header__nav-link">
        Seguimiento
      </a>
      <a
        routerLink="/preferencias"
        routerLinkActive="header__nav-link--active"
        class="header__nav-link">
        Preferencias
      </a>
    </nav>
  }
</header>
```

#### `src/app/shared/components/header/header.component.scss`
```scss
@import '../../../styles/settings/all';
@import '../../../styles/tools/all';

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: $color-dark-primary;
  color: $color-white;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &__inner {
    @include flex-between;
    height: 80px;
  }

  &__logo {
    font-family: $font-family-heading;
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $color-brand-primary;
    text-decoration: none;
    @include transition(color);

    &:hover {
      color: $color-brand-primary-hover;
    }
  }

  &__nav {
    display: flex;
    gap: $spacing-l;

    &--desktop {
      @media (max-width: $breakpoint-m) {
        display: none;
      }
    }

    &--mobile {
      display: none;

      @media (max-width: $breakpoint-m) {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 80px;
        left: 0;
        right: 0;
        background-color: $color-dark-primary;
        padding: $spacing-m;
        gap: $spacing-s;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        animation: slideInDown 300ms ease-out;
      }
    }
  }

  &__nav-link {
    color: $color-white;
    font-weight: $font-weight-medium;
    text-decoration: none;
    padding: $spacing-xs $spacing-s;
    border-radius: $radius-xs;
    @include transition(all);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &--active {
      color: $color-brand-primary;
      background-color: rgba($color-brand-primary, 0.1);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-s;
  }

  &__theme-toggle {
    @include button-reset;
    width: 40px;
    height: 40px;
    @include flex-center;
    border-radius: $radius-xs;
    background-color: rgba(255, 255, 255, 0.1);
    @include transition(background-color);

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  &__theme-icon {
    font-size: 20px;
  }

  &__hamburger {
    @include button-reset;
    display: none;
    flex-direction: column;
    justify-content: space-around;
    width: 32px;
    height: 32px;
    padding: 4px;

    @media (max-width: $breakpoint-m) {
      display: flex;
    }

    &-line {
      width: 100%;
      height: 3px;
      background-color: $color-white;
      border-radius: 2px;
      @include transition(all);
    }

    &[aria-expanded="true"] {
      .header__hamburger-line {
        &:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        &:nth-child(2) {
          opacity: 0;
        }

        &:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }
      }
    }
  }

  // Ocultar botones en mobile, mostrar en hamburger
  @media (max-width: $breakpoint-m) {
    .c-button {
      display: none;
    }
  }
}
```

---

**CONTINÚA EN LA SIGUIENTE RESPUESTA** debido al límite de caracteres. Esta guía incluye TODO lo necesario para implementar el proyecto completo sin ambigüedades.
