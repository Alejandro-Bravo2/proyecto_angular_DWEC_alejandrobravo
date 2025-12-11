# Integración Frontend-Backend COFIRA

Este documento describe cómo el frontend de Angular está integrado con el backend de Spring Boot.

## Arquitectura

### Backend
- **Framework**: Spring Boot 4.0.0
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Puerto**: 8080
- **URL base**: `http://localhost:8080`

### Frontend
- **Framework**: Angular 20.3.0
- **Puerto**: 4200
- **URL base**: `http://localhost:4200`

## Configuración de Environment

Los archivos de configuración se encuentran en `src/environments/`:

```typescript
// environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};

// environment.prod.ts (producción)
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080'  // Cambiar a URL de producción
};
```

## Servicios Actualizados

Todos los servicios ahora se conectan al backend real:

### 1. AuthService (`src/app/core/auth/auth.service.ts`)

**Endpoints del backend:**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/logout` - Cerrar sesión

**Uso:**
```typescript
// Login
authService.login(email, password).subscribe({
  next: (response) => {
    // response.token contiene el JWT
    // response.userInfo contiene la información del usuario
  }
});

// Register
authService.register(nombre, email, password).subscribe({
  next: (response) => console.log('Usuario registrado:', response)
});

// Logout
authService.logout().subscribe({
  next: () => console.log('Sesión cerrada')
});
```

### 2. NutritionService (`src/app/features/nutrition/services/nutrition.service.ts`)

**Endpoints del backend:**
- `GET /rutinas-alimentacion` - Listar rutinas de alimentación
- `GET /rutinas-alimentacion/{id}` - Obtener rutina por ID
- `POST /rutinas-alimentacion` - Crear rutina
- `DELETE /rutinas-alimentacion/{id}` - Eliminar rutina
- `GET /alimentos` - Listar alimentos
- `GET /alimentos/{id}` - Obtener alimento por ID

**Uso:**
```typescript
// Listar rutinas
nutritionService.listarRutinas().subscribe({
  next: (rutinas) => console.log('Rutinas:', rutinas)
});

// Crear rutina
const nuevaRutina: CrearRutinaAlimentacionDTO = {
  fechaInicio: '2025-12-11',
  diasAlimentacion: [...]
};
nutritionService.crearRutina(nuevaRutina).subscribe({
  next: (rutina) => console.log('Rutina creada:', rutina)
});
```

### 3. TrainingService (`src/app/features/training/services/training.service.ts`)

**Endpoints del backend:**
- `GET /rutinas-ejercicio` - Listar rutinas de ejercicio
- `GET /rutinas-ejercicio/{id}` - Obtener rutina por ID
- `POST /rutinas-ejercicio` - Crear rutina
- `DELETE /rutinas-ejercicio/{id}` - Eliminar rutina
- `GET /ejercicios` - Listar ejercicios
- `GET /ejercicios/{id}` - Obtener ejercicio por ID

**Uso:**
```typescript
// Listar rutinas
trainingService.listarRutinas().subscribe({
  next: (rutinas) => console.log('Rutinas:', rutinas)
});

// Listar ejercicios disponibles
trainingService.listarEjercicios().subscribe({
  next: (ejercicios) => console.log('Ejercicios:', ejercicios)
});
```

### 4. ProgressService (`src/app/features/progress/services/progress.service.ts`)

**Endpoints del backend:**
- `GET /objetivos` - Listar objetivos
- `GET /objetivos/{id}` - Obtener objetivos por ID
- `GET /objetivos/usuario/{usuarioId}` - Obtener objetivos de un usuario
- `POST /objetivos` - Crear objetivos
- `PUT /objetivos/{id}` - Actualizar objetivos
- `DELETE /objetivos/{id}` - Eliminar objetivos

**Uso:**
```typescript
// Obtener objetivos del usuario
progressService.obtenerObjetivosPorUsuario(userId).subscribe({
  next: (objetivos) => console.log('Objetivos:', objetivos)
});

// Crear objetivos
const nuevosObjetivos: CrearObjetivosDTO = {
  listaObjetivos: ['Ganar músculo', 'Perder grasa'],
  usuarioId: 1
};
progressService.crearObjetivos(nuevosObjetivos).subscribe({
  next: (objetivos) => console.log('Objetivos creados:', objetivos)
});
```

### 5. UserService (`src/app/features/user/services/user.service.ts`)

**Endpoints del backend:**
- `GET /usuarios` - Listar usuarios (paginado)
- `GET /usuarios/{id}` - Obtener usuario por ID
- `GET /usuarios/email?email={email}` - Obtener usuario por email
- `POST /usuarios` - Crear usuario
- `PUT /usuarios/{id}` - Actualizar usuario
- `DELETE /usuarios/{id}` - Eliminar usuario

**Uso:**
```typescript
// Obtener usuario por ID
userService.obtenerUsuario(1).subscribe({
  next: (usuario) => console.log('Usuario:', usuario)
});

// Actualizar usuario
const datosActualizados: ModificarUsuarioDTO = {
  peso: 75.5,
  altura: 1.75
};
userService.actualizarUsuario(1, datosActualizados).subscribe({
  next: (usuario) => console.log('Usuario actualizado:', usuario)
});
```

## Autenticación con JWT

### Flujo de Autenticación

1. El usuario inicia sesión con email y password
2. El backend valida las credenciales y devuelve un token JWT
3. El token se guarda en `localStorage` con la clave `'authToken'`
4. El interceptor `authInterceptor` añade automáticamente el header `Authorization: Bearer {token}` a todas las peticiones
5. El backend valida el token en cada petición protegida

### Interceptor de Autenticación

El interceptor está en `src/app/core/interceptors/auth.interceptor.ts`:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
```

### Guard de Rutas

El `authGuard` protege las rutas que requieren autenticación:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

## CORS Configuration

El backend está configurado para aceptar peticiones desde:
- `http://localhost:4200` (Angular dev server)
- `http://localhost:3000` (json-server)

Métodos permitidos: GET, POST, PUT, DELETE, PATCH, OPTIONS
Headers permitidos: Authorization, Content-Type, X-Requested-With

## Cómo Iniciar la Aplicación

### 1. Iniciar el Backend

```bash
cd ../backend
./gradlew bootRun
```

El backend estará disponible en `http://localhost:8080`

### 2. Iniciar el Frontend

```bash
cd cofira-app
npm start
```

El frontend estará disponible en `http://localhost:4200`

### 3. Acceder a Swagger UI (Opcional)

Para ver la documentación de la API:
```
http://localhost:8080/swagger-ui.html
```

## Estructura de DTOs

Todos los servicios tienen interfaces TypeScript que coinciden con los DTOs del backend:

### Ejemplo: Usuario

**Backend (Java):**
```java
@Data
public class UsuarioDetalleDTO {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
    // ... más campos
}
```

**Frontend (TypeScript):**
```typescript
export interface UsuarioDetalleDTO {
  id: number;
  nombre: string;
  email: string;
  rol: 'USER' | 'ADMIN';
  // ... más campos
}
```

## Manejo de Errores

El `error.interceptor` maneja automáticamente los errores HTTP:

```typescript
// Errores comunes:
// 401 Unauthorized - Token inválido o expirado
// 403 Forbidden - Sin permisos
// 404 Not Found - Recurso no encontrado
// 500 Internal Server Error - Error del servidor
```

## Base de Datos

El backend usa PostgreSQL. Configuración en `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cofira
spring.datasource.username=admin
spring.datasource.password=admin123
```

## Próximos Pasos

1. ✅ Servicios conectados al backend
2. ✅ Autenticación JWT implementada
3. ✅ CORS configurado
4. ⏳ Actualizar componentes para usar nuevos métodos de servicios
5. ⏳ Implementar manejo de errores en componentes
6. ⏳ Añadir transformadores de datos entre DTOs del backend y modelos del frontend
7. ⏳ Implementar formularios para crear/editar datos

## Notas Importantes

- El backend usa BCrypt para hashear contraseñas
- Los tokens JWT expiran después de 24 horas (86400000ms)
- Algunos métodos "legacy" se mantienen para compatibilidad con componentes existentes
- Los métodos legacy tienen comentarios `// TODO:` para indicar que necesitan transformación de datos

## Troubleshooting

### Error de CORS
Si ves errores de CORS, verifica que:
1. El backend esté corriendo en el puerto 8080
2. El frontend esté corriendo en el puerto 4200
3. La configuración CORS en `SecurityConfig.java` incluya el origen correcto

### Error 401 Unauthorized
Si ves este error:
1. Verifica que el token JWT esté guardado en localStorage
2. Verifica que el token no haya expirado
3. Intenta hacer logout y login nuevamente

### Error de conexión
Si no puedes conectarte al backend:
1. Verifica que el backend esté corriendo
2. Verifica que PostgreSQL esté corriendo
3. Verifica que las credenciales de la base de datos sean correctas
