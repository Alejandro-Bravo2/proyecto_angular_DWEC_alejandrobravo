# Guía de Implementación de Seguridad - Backend COFIRA

Esta guía documenta cómo implementar la validación de tokens JWT y el hash de contraseñas con BCrypt en el backend de Spring Boot 4.0.

## 📋 Índice
1. [Configuración de BCrypt para Hash de Contraseñas](#1-configuración-de-bcrypt)
2. [Implementación del Filtro JWT](#2-filtro-jwt)
3. [Configuración de Spring Security](#3-configuración-de-security)
4. [Utilidades JWT](#4-utilidades-jwt)
5. [Integración con Servicios](#5-integración-con-servicios)

---

## 1. Configuración de BCrypt

### SecurityConfig.java
```java
package com.gestioneventos.cofira.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordEncoderConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength 12 para mayor seguridad
    }
}
```

**Uso en AuthService:**
```java
package com.gestioneventos.cofira.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    public UserDTO register(RegisterDTO registerDTO) {
        // Hash la contraseña antes de guardar
        String hashedPassword = passwordEncoder.encode(registerDTO.getPassword());
        
        User user = User.builder()
            .name(registerDTO.getName())
            .email(registerDTO.getEmail())
            .password(hashedPassword) // Contraseña hasheada
            .role("USER")
            .build();
            
        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }
    
    public LoginResponseDTO login(LoginDTO loginDTO) {
        User user = userRepository.findByEmail(loginDTO.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar contraseña usando BCrypt
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }
        
        // Generar JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        
        return LoginResponseDTO.builder()
            .token(token)
            .userInfo(mapToDTO(user))
            .build();
    }
}
```

---

## 2. Filtro JWT

### JwtAuthenticationFilter.java
```java
package com.gestioneventos.cofira.security;

import com.gestioneventos.cofira.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro que intercepta cada request para validar el token JWT
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Obtener el token del header Authorization
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Extraer el token (después de "Bearer ")
            final String token = authHeader.substring(7);
            
            // Validar el token
            if (jwtUtil.validateToken(token)) {
                // Extraer información del token
                String email = jwtUtil.getEmailFromToken(token);
                String userId = jwtUtil.getUserIdFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);
                
                // Crear autenticación
                List<SimpleGrantedAuthority> authorities = 
                    List.of(new SimpleGrantedAuthority("ROLE_" + role));
                
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        authorities
                    );
                
                authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                
                // Establecer la autenticación en el contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                log.debug("Usuario autenticado: {}", email);
            }
        } catch (Exception e) {
            log.error("Error validando token JWT: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token JWT inválido o expirado");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // No aplicar el filtro a endpoints públicos
        return path.startsWith("/auth/") || 
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/actuator/health");
    }
}
```

---

## 3. Configuración de Security

### SecurityConfig.java
```java
package com.gestioneventos.cofira.config;

import com.gestioneventos.cofira.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitar CSRF (no necesario para APIs REST stateless)
            .csrf(csrf -> csrf.disable())
            
            // Configurar CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configurar autorización de requests
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos (sin autenticación)
                .requestMatchers(
                    "/auth/**",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()
                
                // Todos los demás endpoints requieren autenticación
                .anyRequest().authenticated()
            )
            
            // Configurar sesión stateless (sin estado)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Agregar el filtro JWT antes del filtro de autenticación por defecto
            .addFilterBefore(
                jwtAuthFilter, 
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Orígenes permitidos
        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",  // Angular dev
            "http://localhost:3000"   // Posible producción
        ));
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Headers expuestos
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        
        // Permitir credenciales
        configuration.setAllowCredentials(true);
        
        // Tiempo de caché para preflight requests
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## 4. Utilidades JWT

### JwtUtil.java
```java
package com.gestioneventos.cofira.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret:MiSecretoSuperSeguroParaJWTQueDebeSerMuyLargoYComplejo123456}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 horas en milisegundos
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Genera un token JWT con información del usuario
     */
    public String generateToken(String email, Long userId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("email", email);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Valida si un token es válido y no ha expirado
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            log.error("Token inválido: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extrae el email del token
     */
    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extrae el userId del token
     */
    public String getUserIdFromToken(String token) {
        return getClaims(token).get("userId", String.class);
    }

    /**
     * Extrae el role del token
     */
    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    /**
     * Extrae todos los claims del token
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Verifica si el token ha expirado
     */
    public boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }
}
```

---

## 5. Integración con Servicios

### application.properties
```properties
# JWT Configuration
jwt.secret=${JWT_SECRET:MiSecretoSuperSeguroParaJWTQueDebeSerMuyLargoYComplejo123456}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Security
spring.security.filter.dispatcher-types=REQUEST,FORWARD,ERROR
```

### Variables de Entorno (Producción)
```bash
# En producción, configurar estas variables de entorno:
export JWT_SECRET="tu-secreto-super-seguro-generado-aleatoriamente"
export JWT_EXPIRATION=86400000
```

---

## 📝 Notas Importantes

### Seguridad de BCrypt
- **Strength 12**: Balance entre seguridad y rendimiento
- Cada hash es único gracias al salt automático
- No es reversible, solo se puede verificar

### Seguridad JWT
- **Secret Key**: Debe ser de al menos 512 bits (64 caracteres)
- **Expiración**: 24 horas por defecto, ajustar según necesidad
- **Stateless**: No se almacena sesión en servidor
- **Bearer Token**: Formato `Authorization: Bearer <token>`

### Endpoints Públicos
Los siguientes endpoints NO requieren autenticación:
- `/auth/login` - Login de usuario
- `/auth/register` - Registro de usuario
- `/auth/logout` - Logout (opcional)
- `/swagger-ui/**` - Documentación API
- `/v3/api-docs/**` - OpenAPI docs
- `/actuator/health` - Health check
- `/actuator/info` - Info de la aplicación

### Endpoints Protegidos
Todos los demás endpoints requieren JWT válido:
- `/rutinas-ejercicio/**`
- `/rutinas-alimentacion/**`
- `/alimentos/**`
- `/usuarios/**`
- `/progreso/**`

---

## 🧪 Testing

### Probar el Login
```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Respuesta:
# {
#   "token": "eyJhbGciOiJIUzUxMiJ9...",
#   "userInfo": {
#     "id": 1,
#     "name": "Test User",
#     "email": "test@example.com"
#   }
# }
```

### Probar Endpoint Protegido
```bash
# Usar el token recibido
curl -X GET http://localhost:8080/rutinas-ejercicio \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

### Verificar Hash de Contraseña
```java
// En pruebas
@Test
void testPasswordEncoding() {
    String rawPassword = "password123";
    String encoded = passwordEncoder.encode(rawPassword);
    
    assertTrue(passwordEncoder.matches(rawPassword, encoded));
    assertNotEquals(rawPassword, encoded);
    
    // Cada hash es único
    String encoded2 = passwordEncoder.encode(rawPassword);
    assertNotEquals(encoded, encoded2);
    assertTrue(passwordEncoder.matches(rawPassword, encoded2));
}
```

---

## 🔧 Troubleshooting

### Error: "Token JWT inválido o expirado"
- Verificar que el token esté en el formato correcto: `Bearer <token>`
- Verificar que el token no haya expirado
- Verificar que el secret key sea el mismo que generó el token

### Error: "CORS policy"
- Verificar que el origen esté en la lista de `allowedOrigins`
- Verificar que el método HTTP esté permitido
- Verificar que los headers estén permitidos

### Error: "Access Denied"
- Verificar que el usuario tenga el rol correcto
- Verificar que el endpoint no esté en la lista de públicos si debería estarlo

---

## 📚 Referencias

- [Spring Security Official Docs](https://docs.spring.io/spring-security/reference/)
- [JWT.io](https://jwt.io/)
- [BCrypt Calculator](https://bcrypt-generator.com/)
- [Spring Boot Security](https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.security)
