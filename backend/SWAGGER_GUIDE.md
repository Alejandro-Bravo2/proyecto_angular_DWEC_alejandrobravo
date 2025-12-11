# Guía de Swagger/OpenAPI - COFIRA

## Acceso a Swagger

Una vez que la aplicación esté corriendo, puedes acceder a Swagger en:

- **Swagger UI (Interfaz visual)**: http://localhost:8080/swagger-ui/index.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs
- **OpenAPI YAML**: http://localhost:8080/v3/api-docs.yaml

## Características Implementadas

### 1. **Interfaz Swagger UI Completa**
   - Documentación interactiva de todos los endpoints
   - Prueba directa de endpoints desde el navegador
   - Visualización de esquemas de DTOs
   - Ejemplos de request y response

### 2. **Autenticación JWT Integrada**
   Para probar endpoints protegidos:
   1. Haz clic en el botón **"Authorize"** (candado verde) en la parte superior derecha
   2. En el campo de texto, introduce: `Bearer {tu-token-jwt}`
   3. Haz clic en **"Authorize"**
   4. Ahora puedes probar todos los endpoints protegidos

### 3. **Organización por Tags**
   Los endpoints están organizados en las siguientes categorías:
   - **Autenticación**: Login, registro, logout, info del usuario
   - **Usuarios**: Gestión completa de usuarios
   - **Planes**: Planes de entrenamiento y alimentación
   - **Ejercicios**: Catálogo de ejercicios
   - **Alimentos**: Gestión de alimentos
   - **Objetivos**: Objetivos de usuarios
   - **Salas**: Salas de gimnasio

### 4. **Documentación Detallada**
   Cada endpoint incluye:
   - Descripción clara de su función
   - Parámetros con descripciones
   - Códigos de respuesta HTTP posibles
   - Esquemas de DTOs con todos los campos
   - Ejemplos de uso

## Ejemplo de Uso

### 1. Registrar un nuevo usuario
```bash
POST /auth/register
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

### 2. Iniciar sesión
```bash
POST /auth/login
{
  "email": "juan@example.com",
  "password": "password123"
}

# Respuesta:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { ... }
}
```

### 3. Usar el token en Swagger
1. Copia el token de la respuesta
2. Haz clic en **"Authorize"**
3. Pega: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. ¡Listo! Ahora puedes probar todos los endpoints

## Configuración

La configuración de Swagger está en:
- **Clase de configuración**: [OpenApiConfig.java](src/main/java/com/gestioneventos/cofira/config/OpenApiConfig.java)
- **Properties**: [application.properties](src/main/resources/application.properties)

```properties
# Swagger
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
```

## Interfaces API

Cada controlador implementa una interfaz API que contiene todas las anotaciones de Swagger:

- `AlimentoControllerApi` → `AlimentoController`
- `AuthControllerApi` → `AuthController`
- `EjerciciosControllerApi` → `EjerciciosController`
- `ObjetivosControllerApi` → `ObjetivosController`
- `PlanControllerApi` → `PlanController`
- `SalaDeGimnasioControllerApi` → `SalaDeGimnasioController`
- `UsuarioControllerApi` → `UsuarioController`

Esta separación mantiene el código limpio y la documentación organizada.

## Versiones

- **Spring Boot**: 4.0.0
- **Springdoc OpenAPI**: 2.8.4
- **OpenAPI Specification**: 3.0

## Servidores Configurados

En Swagger UI verás dos servidores disponibles:
1. **Desarrollo**: http://localhost:8080
2. **Producción**: https://api.cofira.com (cuando esté disponible)

Puedes cambiar entre ellos en el dropdown de Swagger UI.

## Tips

1. **Explorar esquemas**: En la parte inferior de Swagger UI están todos los esquemas de DTOs
2. **Copiar curl**: Cada request tiene un botón para copiar el comando curl equivalente
3. **Descargar especificación**: Puedes descargar el JSON/YAML de OpenAPI para usarlo en otras herramientas
4. **Probar errores**: Intenta enviar datos inválidos para ver las respuestas de error documentadas

## Problemas Comunes

### Error 401 en endpoints protegidos
- Asegúrate de haber usado el botón "Authorize"
- Verifica que el token tenga el prefijo "Bearer "
- Comprueba que el token no haya expirado (24h por defecto)

### Swagger UI no carga
- Verifica que la aplicación esté corriendo en el puerto 8080
- Limpia la caché del navegador
- Accede directamente a: http://localhost:8080/v3/api-docs

### Cambios en la API no aparecen
- Reinicia la aplicación
- Usa Ctrl+F5 para forzar recarga en el navegador
