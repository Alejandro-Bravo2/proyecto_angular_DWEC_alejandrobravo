FASE 5: SERVICIOS Y COMUNICACIÓN HTTP¶
Criterios: RA7.a, RA7.b, RA7.c, RA7.d, RA7.e, RA7.f, RA7.g

Entrega: 18 de diciembre (paralela a DIW Fases 1-2-3-4-5)

Objetivos:

Implementar comunicación asíncrona con backend usando HttpClient. Consumir APIs REST reales o simuladas para obtener y enviar datos.

Tareas:

Configuración de HttpClient

Importar HttpClientModule

Crear servicio base para HTTP
Configurar interceptores para headers comunes
Operaciones CRUD completas

GET: Obtener listados y elementos individuales

POST: Crear nuevos recursos
PUT/PATCH: Actualizar recursos
DELETE: Eliminar recursos
Manejo de respuestas

Tipado de respuestas con interfaces TypeScript

Transformación de datos con map
Manejo de errores con catchError
Retry logic para peticiones fallidas
Diferentes formatos

JSON (principal)

FormData para upload de archivos
Query params para filtros y paginación
Headers personalizados cuando necesario
Estados de carga y error

Loading state durante peticiones

Error state con mensajes al usuario
Empty state cuando no hay datos
Success feedback después de operaciones
Interceptores HTTP

Interceptor para añadir token de autenticación

Interceptor para manejo global de errores
Interceptor para logging de requests
Documentación

Catálogo de endpoints consumidos

Estructura de datos (interfaces)
Estrategia de manejo de errores
Entregables:

Servicio HTTP con operaciones CRUD completas
Consumo de API REST (real o simulada con json-server)
Manejo de errores robusto
Loading/error/empty states en UI
Interceptores HTTP implementados
Interfaces TypeScript para todas las respuestas
Documentación de API
 Volver al principio