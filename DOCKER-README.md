# COFIRA - Docker Compose Setup

Este proyecto incluye una configuración completa de Docker Compose para levantar todos los servicios necesarios de forma automática.

## Servicios Incluidos

1. **PostgreSQL** - Base de datos en el puerto 5432
2. **PgAdmin** - Administrador de base de datos en el puerto 5050
3. **Backend** - API Spring Boot en el puerto 8080
4. **Frontend** - Aplicación Angular en el puerto 4200

## Requisitos Previos

- Docker Desktop instalado y ejecutándose
- Docker Compose v2.0 o superior
- Al menos 4GB de RAM disponible para Docker

## Configuración Inicial

1. **Copia el archivo de variables de entorno** (opcional, ya existe con valores por defecto):
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env`** si quieres cambiar alguna configuración (opcional):
   ```bash
   # Ejemplo de variables que puedes modificar
   DB_NAME=cofira
   DB_USERNAME=admin
   DB_PASSWORD=admin123
   ANGULAR_PORT=4200
   SERVER_PORT=8080
   ```

## Iniciar Todos los Servicios

Para levantar toda la aplicación (base de datos, backend y frontend) ejecuta:

```bash
docker-compose up --build
```

Este comando hará:
- Construir las imágenes Docker del backend y frontend
- Descargar la imagen de PostgreSQL
- Crear la red y volúmenes necesarios
- Iniciar todos los servicios en el orden correcto
- Esperar a que cada servicio esté listo antes de iniciar el siguiente

**Para ejecutar en segundo plano** (detached mode):
```bash
docker-compose up --build -d
```

## Verificar el Estado de los Servicios

```bash
docker-compose ps
```

## Acceder a los Servicios

Una vez levantados todos los servicios, puedes acceder a:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:4200 | - |
| **Backend API** | http://localhost:8080 | - |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | - |
| **PgAdmin** | http://localhost:5050 | admin@admin.com / admin123 |
| **PostgreSQL** | localhost:5432 | admin / admin123 |

## Configurar PgAdmin

1. Accede a http://localhost:5050
2. Inicia sesión con las credenciales (ver tabla arriba)
3. Crea una nueva conexión:
   - **Host**: `postgres` (nombre del contenedor)
   - **Puerto**: `5432`
   - **Database**: `cofira`
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

## Ver Logs

**Ver logs de todos los servicios:**
```bash
docker-compose logs -f
```

**Ver logs de un servicio específico:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Detener los Servicios

**Detener sin eliminar los contenedores:**
```bash
docker-compose stop
```

**Detener y eliminar los contenedores:**
```bash
docker-compose down
```

**Detener y eliminar contenedores + volúmenes (borra la base de datos):**
```bash
docker-compose down -v
```

## Reiniciar un Servicio Específico

```bash
# Reiniciar el backend
docker-compose restart backend

# Reiniciar el frontend
docker-compose restart frontend

# Reiniciar la base de datos
docker-compose restart postgres
```

## Reconstruir Imágenes

Si haces cambios en el código y quieres reconstruir las imágenes:

```bash
# Reconstruir todo
docker-compose up --build

# Reconstruir solo un servicio
docker-compose up --build backend
docker-compose up --build frontend
```

## Limpiar Todo

Para eliminar todo (contenedores, volúmenes, redes e imágenes):

```bash
docker-compose down -v --rmi all
```

## Troubleshooting

### Error: "port is already allocated"
Si ves este error, significa que el puerto ya está en uso. Opciones:
1. Detén el proceso que usa ese puerto
2. Cambia el puerto en el archivo `.env`

### Error: "backend unhealthy"
El backend puede tardar hasta 40 segundos en estar listo. Espera un poco más.

### La base de datos no se conecta
Verifica que el contenedor de PostgreSQL esté en estado "healthy":
```bash
docker-compose ps
```

### Cambios en el código no se reflejan
Reconstruye las imágenes:
```bash
docker-compose up --build
```

## Health Checks

Todos los servicios tienen health checks configurados:

- **PostgreSQL**: Verifica cada 10s si la base de datos responde
- **Backend**: Verifica cada 30s el endpoint `/actuator/health`
- **Frontend**: Verifica cada 30s que Nginx responda

## Consejos

1. **Primera ejecución**: La primera vez tomará más tiempo porque descarga todas las imágenes y construye el proyecto
2. **Desarrollo**: Usa `docker-compose up` (sin `-d`) para ver los logs en tiempo real
3. **Producción**: Usa `docker-compose up -d` para ejecutar en segundo plano
4. **Actualizar dependencias**: Reconstruye con `--build` después de cambiar `package.json` o `build.gradle`

## Seguridad

**IMPORTANTE**: Los valores por defecto son para desarrollo. En producción:
1. Cambia todas las contraseñas
2. Usa un JWT_SECRET seguro y único
3. No expongas puertos innecesarios
4. Usa HTTPS con certificados válidos

## Más Información

- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de Spring Boot](https://spring.io/projects/spring-boot)
- [Documentación de Angular](https://angular.io/)
