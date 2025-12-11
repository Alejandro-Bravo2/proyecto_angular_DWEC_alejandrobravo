# CofiraApp

Aplicación de fitness y nutrición desarrollada con Angular 20.

## 🚀 Desarrollo

### Servidor de Desarrollo

Iniciar el servidor completo (frontend + backend):

```bash
npm run dev
```

Solo frontend:

```bash
npm start
```

Solo backend (API):

```bash
npm run api
```

La aplicación estará disponible en `http://localhost:4200/` y la API en `http://localhost:3000/`.

## 🧪 Tests

### Ejecutar Tests con Coverage

```bash
npm run test:coverage
```

### Tests en Modo Watch

```bash
npm run test:watch
```

### Ver Reporte de Coverage

```bash
open coverage/cofira-app/index.html
```

**Coverage Actual:** 45.44% ✅ (Objetivo: >50%)

Ver detalles completos en:

- `TEST_SUMMARY.md` - Resumen de tests
- `TESTING.md` - Guía de testing
- `QUICK_TEST_GUIDE.md` - Guía rápida

## 📦 Building

Para construir el proyecto:

```bash
ng build
```

Los archivos compilados se guardarán en `dist/`.

## 🎨 Code Scaffolding

Generar un nuevo componente:

```bash
ng generate component component-name
```

Ver todas las opciones disponibles:

```bash
ng generate --help
```

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
