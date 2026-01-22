// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Constructor injection sigue siendo válido en Angular
      "@angular-eslint/prefer-inject": "off",
      // Permitir parámetros con prefijo _ para interfaces de Angular (guards, resolvers)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Advertencia en lugar de error para any (necesario en formularios y servicios genéricos)
      "@typescript-eslint/no-explicit-any": "warn",
      // Permitir funciones vacías (necesarias para ControlValueAccessor)
      "@typescript-eslint/no-empty-function": "off",
      // Permitir métodos de ciclo de vida vacíos (patrón común en Angular)
      "@angular-eslint/no-empty-lifecycle-method": "off",
    },
  },
  // Reglas más permisivas para archivos de test
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@angular-eslint/prefer-inject": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      // Permitir tanto *ngIf/*ngFor como @if/@for (ambos válidos)
      "@angular-eslint/template/prefer-control-flow": "off",
      // Advertencias en lugar de errores para accesibilidad (mejoras futuras)
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",
      "@angular-eslint/template/label-has-associated-control": "warn",
    },
  }
]);
