# COFIRA - Sistema de Diseño

> Documentación completa del sistema de diseño basado en los mockups de Figma

## Índice
1. [Paleta de Colores](#paleta-de-colores)
2. [Tipografía](#tipografía)
3. [Espaciado y Radios](#espaciado-y-radios)
4. [Iconografía](#iconografía)
5. [Componentes](#componentes)
6. [Páginas](#páginas)

---

## Paleta de Colores

### Colores Principales

#### Amarillo (Brand Color)
- **Hex**: `#FDB913`
- **Uso**: Botones principales, CTAs, elementos destacados, íconos activos
- **Variantes**:
  - Hover: `#E5A611`
  - Active: `#CC9310`
  - Dark variant: `#B8850E`

#### Gris Oscuro (Primary Text/Backgrounds)
- **Hex**: `#3B4455`
- **Uso**: Texto principal en modo claro, fondos de tarjetas en modo oscuro
- **Variantes**:
  - Normal: `#3B4455`
  - Hover: `#2F3742`
  - Dark: `#1F232B`

#### Negro
- **Hex**: `#0A0A0A`
- **Uso**: Fondos principales modo oscuro, texto en contraste alto

#### Blanco
- **Hex**: `#FFFFFF`
- **Uso**: Fondos modo claro, texto sobre fondos oscuros

#### Gris Claro
- **Hex**: `#E8E8E8` (aproximado)
- **Uso**: Fondos secundarios en modo claro, bordes sutiles

### Colores Semánticos

#### Success (Verde)
- **Hex**: `#4CAF50`
- **Uso**: Mensajes de éxito, check icons

#### Error (Rojo)
- **Hex**: `#F44336`
- **Uso**: Errores, botones de eliminar, badges de alergias

#### Info (Azul)
- **Hex**: `#2196F3`
- **Uso**: Mensajes informativos

#### Warning (Naranja)
- **Hex**: `#FF9800`
- **Uso**: Advertencias

---

## Tipografía

### Familias de Fuentes

#### Texto Principal
- **Familia**: Montserrat
- **Pesos**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Uso**: Todo el texto del cuerpo, párrafos, labels

#### Títulos y Headings
- **Familia**: Poppins
- **Pesos**: 600 (SemiBold), 700 (Bold)
- **Uso**: H1, H2, H3, títulos de sección

### Escala Tipográfica

```scss
// Headings
H1: 48px / 3rem      - Bold Poppins    - Line height: 1.2
H2: 36px / 2.25rem   - Bold Poppins    - Line height: 1.3
H3: 24px / 1.5rem    - SemiBold Poppins - Line height: 1.4
H4: 20px / 1.25rem   - SemiBold Montserrat - Line height: 1.5

// Body text
Body: 16px / 1rem    - Regular Montserrat - Line height: 1.6
Button: 16px / 1rem  - SemiBold Montserrat - Line height: 1
Small: 14px / 0.875rem - Regular Montserrat - Line height: 1.5
```

### Variantes por Tema

#### Modo Claro
- Texto principal: `#0A0A0A` (negro)
- Texto secundario: `#666666`
- Texto deshabilitado: `#999999`

#### Modo Oscuro
- Texto principal: `#FFFFFF` (blanco)
- Texto secundario: `#B8B8B8`
- Texto deshabilitado: `#666666`

---

## Espaciado y Radios

### Sistema de Espaciado

Basado en múltiplos de 8px:

```scss
$spacing-xss: 4px;    // XSS - 4
$spacing-xs: 8px;     // XS - 8
$spacing-s: 16px;     // S - 16
$spacing-m: 24px;     // M - 24
$spacing-l: 32px;     // L - 32
$spacing-xl: 40px;    // XL - 40
$spacing-xxl: 48px;   // XXL - 48
$spacing-xxxl: 64px;  // XXXL - 64
```

### Radios de Borde

```scss
$radius-xss: 4px;     // Botones pequeños, badges
$radius-xs: 8px;      // Botones estándar
$radius-s: 12px;      // Tarjetas pequeñas
$radius-m: 16px;      // Tarjetas medianas
$radius-l: 24px;      // Tarjetas grandes, modales
$radius-xl: 32px;     // Elementos hero
```

### Breakpoints Responsive

```scss
$breakpoint-xs: 0;
$breakpoint-s: 576px;   // Mobile landscape
$breakpoint-m: 768px;   // Tablet
$breakpoint-l: 992px;   // Desktop
$breakpoint-xl: 1200px; // Large desktop
$breakpoint-xxl: 1440px; // Extra large
```

---

## Iconografía

### Sistema de Iconos

**Fuente**: Custom icon font o SVG inline

#### Categorías de Iconos (Modo Claro y Oscuro)

**Entrenamiento/Training**:
- 🏋️ Dumbbell / Pesas
- 🔁 Reload / Repeticiones
- ✓ Check / Completado
- ✗ Cross / No completado

**Alimentación/Nutrition**:
- 🍕 Pizza
- 🥛 Glass / Vaso
- 🍴 Fork & Knife
- 📊 Chart / Gráfico

**Seguimiento/Progress**:
- 📈 Graph Line
- 📊 Bar Chart
- 🎯 Target / Objetivo
- 📅 Calendar

**Usuarios**:
- 👤 User / Perfil
- 🔒 Lock / Contraseña
- ✉️ Email
- 🔔 Bell / Notificaciones

### Tamaños de Iconos

```scss
$icon-xs: 16px;
$icon-s: 20px;
$icon-m: 24px;
$icon-l: 32px;
$icon-xl: 48px;
```

---

## Componentes

### 1. Botones

#### Primario (Primary Button)
- **Background**: Amarillo `#FDB913`
- **Text**: Negro `#0A0A0A`
- **Font**: Montserrat SemiBold, 16px
- **Padding**: 16px 32px
- **Border Radius**: 8px
- **Hover**: Amarillo oscuro `#E5A611`
- **Active**: `#CC9310`
- **Uso**: CTAs principales (INSCRÍBETE, VER PLANES, Guardar)

#### Secundario (Secondary Button)
- **Background**: Transparente
- **Border**: 2px solid (color según tema)
- **Text**: Color del tema
- **Padding**: 14px 30px
- **Hover**: Background semi-transparente

#### Terciario/Ghost
- **Background**: Transparente
- **Text**: Color del tema
- **Hover**: Background sutilmente coloreado

### 2. Inputs y Form Controls

#### Text Input
- **Height**: 48px
- **Padding**: 12px 16px
- **Border**: 1px solid (gris claro en modo claro, gris oscuro en modo oscuro)
- **Border Radius**: 8px
- **Font**: Montserrat Regular, 16px
- **Placeholder**: Color gris secundario
- **Focus**: Border amarillo `#FDB913`, outline 2px

#### Estados:
- **Normal**: Border gris
- **Focus**: Border amarillo + glow
- **Error**: Border rojo + mensaje abajo
- **Success**: Border verde + check icon
- **Disabled**: Background gris, cursor not-allowed

### 3. Tarjetas (Cards)

#### Card Estándar
- **Background**: Blanco (claro) / Gris oscuro `#3B4455` (oscuro)
- **Border Radius**: 16px
- **Padding**: 24px
- **Box Shadow**: `0 2px 8px rgba(0,0,0,0.1)` (claro) / ninguna (oscuro)

#### Card de Planes (Pricing Cards)
- **Width**: ~320px
- **Background**: Gris oscuro `#3B4455` (ambos temas)
- **Border Radius**: 16px
- **Padding**: 32px 24px
- **Destacada**: Border amarillo 2px

### 4. Navegación

#### Header/Navbar
- **Height**: 80px
- **Background**: Gris oscuro `#3B4455`
- **Logo**: Izquierda
- **Nav Links**: Centro (Desktop)
- **Actions**: Derecha (Inscríbete, Cuenta)

#### Nav Link
- **Font**: Montserrat Medium, 16px
- **Color**: Blanco
- **Hover**: Subrayado amarillo
- **Active**: Texto amarillo

#### Menú Hamburguesa (Mobile)
- **Icon**: 3 líneas, 24px
- **Menú Desplegable**: Full width, background oscuro

### 5. Modales

#### Modal Overlay
- **Background**: `rgba(0, 0, 0, 0.6)`
- **Z-index**: 1000

#### Modal Content
- **Width**: Max 600px
- **Background**: Según tema
- **Border Radius**: 16px
- **Padding**: 32px
- **Close Button**: Esquina superior derecha (X)

### 6. Calendario

#### Estructura
- **Grid**: 7 columnas (días de la semana)
- **Cell Height**: 48px
- **Día Seleccionado**: Background amarillo, texto negro
- **Día Actual**: Border amarillo
- **Otros Días**: Background según tema

### 7. Tabla de Entrenamiento

#### Weekly Table
- **Headers**: Días de la semana (Lunes, Martes, etc.)
- **Rows**: Ejercicios
- **Cells**:
  - Ejercicio: Texto + descripción
  - Repeticiones: Número
  - Series: Número
  - Resultado: Check (verde) / Cross (rojo)

### 8. Toast/Notificaciones

#### Success Toast
- **Background**: Verde `#4CAF50`
- **Text**: Blanco
- **Position**: Top-right
- **Border Radius**: 8px
- **Auto-dismiss**: 4 segundos

#### Error Toast
- **Background**: Rojo `#F44336`
- **Duration**: 8 segundos

#### Info Toast
- **Background**: Azul `#2196F3`
- **Duration**: 3 segundos

---

## Páginas

### 1. Home (Inicio)

#### Hero Section
- **Background**: Imagen con overlay oscuro
- **Texto H1**: "Tu entrenamiento, nutrición y progreso en un solo lugar"
- **Subtitle**: "Inscríbete hoy y empieza tu cambio"
- **CTAs**: INSCRÍBETE (amarillo), VER PLANES (gris)

#### Planes Section
- **Background**: Negro
- **Título H2**: "PLANES" (amarillo)
- **3 Cards**: Individual, Cuota mensual, Cuota anual
- **Precio destacado**: Amarillo
- **Botón**: INSCRÍBETE (amarillo)

#### Newsletter Section
- **Background**: Gris oscuro
- **Título**: "¿Quieres estar al tanto de todas las noticias?"
- **Form**: Nombre, Apellido, Email + Botón Enviar (amarillo)

### 2. Página Entrenamiento

#### Tabla Semanal
- **Navegación**: < Lunes | Martes | Miércoles >
- **Ejercicios**: Lista con checks de completado

#### Retroalimentación Form
- **2 preguntas**:
  - ¿Cuáles son los ejercicios que más te ha costado?
  - ¿Crees que podrías con más peso?
- **Botones**: Cancelar, Enviar (amarillo)

#### Ver mi progreso
- **Card**: Imagen + CTA "Ver mi progreso"

### 3. Página Alimentación

#### Menú Diario
- **Navegación**: < Viernes 24 >
- **Secciones**: Desayuno, Almuerzo, Cena, Snacks
- **Items**: Icono + cantidad + nombre
- **Info Button**: (i) abre modal

#### Modal Ingredientes
- **Título**: Ingredientes - [nombre]
- **Lista**: Íconos + cantidades + precios
- **Close**: X

### 4. Página Seguimiento

#### Contador de Nutrientes
- **Gráfico Circular**: Proteínas, Carbohidratos, Grasas
- **Leyenda**: Calorías totales, Fibra, Agua

#### Ganancia de Fuerza
- **Dropdown**: Ejercicio seleccionado
- **Gráfico de Línea**: Progreso temporal (eje X: fechas, eje Y: kg)

### 5. Página Preferencias

#### Alergias o Intolerancias
- **Search Input**: "Busca alergias (ej. Lácteos, Gluten...)"
- **Pills/Badges**: Lácteos (rojo), Gluten (rojo), Frutos secos, Cacahuete

#### Ingredientes Favoritos
- **Search Input**: "Busca ingredientes (ej. Pollo, Arroz...)"
- **Pills**: Plátano (amarillo), Arroz (amarillo), Aguacate, Espinacas

### 6. Páginas de Autenticación

#### Login
- **Modal redondo oscuro** con logo amarillo
- **Fields**: Email, Contraseña
- **CTA**: Iniciar sesión (amarillo)
- **Links**: ¿Has olvidado la contraseña?, ¿No tienes cuenta?

#### Registro
- **Fields**: Nombre, Email, Contraseña
- **CTA**: Registrarse (amarillo)
- **Link**: ¿Ya tienes cuenta?

#### Reset Password
- **Opción 1**: Campos para nueva contraseña
- **Opción 2**: Envío de código por email

### 7. Páginas de Onboarding

#### Sobre ti (About me)
- **Fields**:
  - Género: Botones Masculino/Femenino
  - Altura: Dropdown (ej. 180cm)
  - Edad: Dropdown (ej. 20 años)
- **CTA**: Continuar (amarillo)

#### Alimentación (Nutrition)
- **Pregunta**: "Frecuencia con la que quieres variedad en las comidas"
- **Opciones**: Mucha variedad, Variedad frecuente, Poca variedad
- **Selección**: Variedad frecuente (amarillo)

#### Objetivo (Goal)
- **Pregunta**: "Vamos a establecer unos objetivos claros"
- **Opciones**: Ganar masa muscular, Perder grasa, Mantenerse estable
- **Selección**: Perder grasa (amarillo)

#### Precios (Pricing)
- **Pregunta**: "Rango de precio medio por comida"
- **Opciones**: 0-10€, 0-15€, 0-20€
- **Selección**: 0-15€ (amarillo)

#### Músculos (Muscle Groups)
- **Pregunta**: "¿Estás interesado en enfocarte en algunos grupos musculares?"
- **Opciones**: Pecho, Espalda, Brazos, Pierna
- **Multi-select**: Pecho, Brazos (amarillo)
- **CTA**: Continuar (amarillo)

---

## Variables SCSS (ITCSS - Settings Layer)

```scss
// _colors.scss
$color-brand-primary: #FDB913;
$color-brand-primary-hover: #E5A611;
$color-brand-primary-active: #CC9310;

$color-dark-primary: #3B4455;
$color-dark-secondary: #2F3742;
$color-dark-tertiary: #1F232B;

$color-black: #0A0A0A;
$color-white: #FFFFFF;
$color-gray-light: #E8E8E8;
$color-gray-medium: #B8B8B8;
$color-gray-dark: #666666;

$color-success: #4CAF50;
$color-error: #F44336;
$color-info: #2196F3;
$color-warning: #FF9800;

// _typography.scss
$font-family-base: 'Montserrat', sans-serif;
$font-family-heading: 'Poppins', sans-serif;

$font-size-h1: 3rem;        // 48px
$font-size-h2: 2.25rem;     // 36px
$font-size-h3: 1.5rem;      // 24px
$font-size-h4: 1.25rem;     // 20px
$font-size-body: 1rem;      // 16px
$font-size-small: 0.875rem; // 14px

// _spacing.scss
$spacing-xss: 4px;
$spacing-xs: 8px;
$spacing-s: 16px;
$spacing-m: 24px;
$spacing-l: 32px;
$spacing-xl: 40px;
$spacing-xxl: 48px;
$spacing-xxxl: 64px;

// _radios.scss
$radius-xss: 4px;
$radius-xs: 8px;
$radius-s: 12px;
$radius-m: 16px;
$radius-l: 24px;
$radius-xl: 32px;
```

---

## Temas (Claro/Oscuro)

### Implementación con CSS Variables

```scss
:root {
  // Light theme (default)
  --bg-primary: #{$color-white};
  --bg-secondary: #{$color-gray-light};
  --text-primary: #{$color-black};
  --text-secondary: #{$color-gray-dark};
  --card-bg: #{$color-white};
  --border-color: #{$color-gray-light};
}

[data-theme='dark'] {
  // Dark theme
  --bg-primary: #{$color-black};
  --bg-secondary: #{$color-dark-tertiary};
  --text-primary: #{$color-white};
  --text-secondary: #{$color-gray-medium};
  --card-bg: #{$color-dark-primary};
  --border-color: #{$color-dark-secondary};
}
```

---

## Animaciones y Transiciones

```scss
// Transiciones estándar
$transition-fast: 150ms ease-in-out;
$transition-normal: 300ms ease-in-out;
$transition-slow: 500ms ease-in-out;

// Ejemplo de uso
.button {
  transition: background-color $transition-normal,
              transform $transition-fast;

  &:hover {
    transform: translateY(-2px);
  }
}
```

---

## Accesibilidad

### Contraste de Colores
- Texto sobre amarillo: Negro `#0A0A0A` (ratio 7.5:1)
- Texto sobre oscuro: Blanco `#FFFFFF` (ratio 15:1)
- Mínimo ratio WCAG AA: 4.5:1

### Focus States
- Outline amarillo 2px solid
- Offset: 2px

### Estados de Validación
- Error: Border rojo + aria-invalid
- Success: Border verde + aria-valid
- Loading: aria-busy="true"

---

## Responsive Design

### Mobile First Approach

```scss
// Base: Mobile (0-576px)
.component { /* mobile styles */ }

// Tablet (768px+)
@media (min-width: $breakpoint-m) {
  .component { /* tablet styles */ }
}

// Desktop (992px+)
@media (min-width: $breakpoint-l) {
  .component { /* desktop styles */ }
}
```

---

Esta documentación sirve como referencia completa para implementar todos los componentes y páginas de COFIRA manteniendo consistencia visual y funcional.
