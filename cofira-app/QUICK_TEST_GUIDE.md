# 🧪 Guía Rápida de Tests

## ⚡ Ejecutar Tests

```bash
# Tests con coverage (recomendado)
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests básicos
npm test
```

## 📊 Ver Resultados

### En Terminal

Después de `npm run test:coverage`, verás:

```
=============================== Coverage summary ===============================
Statements   : 45.44% ( 404/889 )
Branches     : 34.09% ( 60/176 )
Functions    : 31.01% ( 98/316 )
Lines        : 45.34% ( 380/838 )
================================================================================
```

### En Navegador

Abre el archivo HTML generado:

```bash
# macOS
open coverage/cofira-app/index.html

# Linux
xdg-open coverage/cofira-app/index.html

# Windows
start coverage/cofira-app/index.html
```

## ✅ Estado Actual

- **Total Tests:** 441
- **Pasando:** 383 (86.8%)
- **Coverage:** 45.44% ✅

## 📁 Archivos Importantes

- `TEST_SUMMARY.md` - Resumen completo de tests
- `TESTING.md` - Guía detallada para desarrolladores
- `coverage/` - Reportes de coverage (generados)

## 🔍 Troubleshooting

### Tests Fallando

```bash
# Ver detalles completos
npm test

# Ejecutar test específico
npm test -- --include='**/auth.service.spec.ts'
```

### Coverage Bajo

1. Revisa `coverage/cofira-app/index.html`
2. Identifica archivos con bajo coverage
3. Añade tests para métodos sin cubrir

### ChromeHeadless No Disponible

```bash
# Usa Chrome normal
npm test -- --browsers=Chrome
```

## 📈 Mejorar Coverage

### Prioridad Alta

1. Servicios críticos (auth, API)
2. Guards y navegación
3. Formularios y validación

### Prioridad Media

4. Componentes compartidos
5. Pipes y directivas
6. Utilidades

### Prioridad Baja

7. Componentes estáticos
8. Configuración
9. Constantes

---

**¿Necesitas ayuda?** Ver `TESTING.md` para guía completa
