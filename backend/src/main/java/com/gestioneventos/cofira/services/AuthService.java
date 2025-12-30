package com.gestioneventos.cofira.services;

import com.gestioneventos.cofira.dto.auth.AuthResponseDTO;
import com.gestioneventos.cofira.dto.auth.LoginRequestDTO;
import com.gestioneventos.cofira.dto.auth.RegisterRequestDTO;
import com.gestioneventos.cofira.dto.auth.UserInfoDTO;
import com.gestioneventos.cofira.entities.TokenRevocado;
import com.gestioneventos.cofira.entities.Usuario;
import com.gestioneventos.cofira.enums.Rol;
import com.gestioneventos.cofira.exceptions.RecursoDuplicadoException;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.TokenRevocadoRepository;
import com.gestioneventos.cofira.repositories.UsuarioRepository;
import com.gestioneventos.cofira.security.JwtUtils;
import com.gestioneventos.cofira.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenRevocadoRepository tokenRevocadoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String roleString = userDetails.getAuthorities().stream()
                .findFirst()
                .map(item -> item.getAuthority().replace("ROLE_", ""))
                .orElse("");

        // Convertir el String a Rol enum
        Rol rol = roleString.equals("ADMIN") ? Rol.ADMIN : Rol.USER;

        // Obtener estado de onboarding
        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElse(null);
        Boolean isOnboarded = usuario != null && Boolean.TRUE.equals(usuario.getIsOnboarded());

        return AuthResponseDTO.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .rol(rol)
                .isOnboarded(isOnboarded)
                .build();
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO registerRequest) {
        if (usuarioRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RecursoDuplicadoException("Error: El username ya está en uso!");
        }

        if (usuarioRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RecursoDuplicadoException("Error: El email ya está en uso!");
        }

        // Determinar el rol (por defecto USER si no se especifica o es inválido)
        Rol rol = Rol.USER;
        if (registerRequest.getRol() != null) {
            rol = registerRequest.getRol();
        }

        Usuario usuario = Usuario.builder()
                .nombre(registerRequest.getNombre())
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .rol(rol)
                .build();

        usuarioRepository.save(usuario);

        // Autenticar y generar token
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setUsername(registerRequest.getUsername());
        loginRequest.setPassword(registerRequest.getPassword());

        return login(loginRequest);
    }

    public UserInfoDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        return UserInfoDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .edad(usuario.getEdad())
                .peso(usuario.getPeso())
                .altura(usuario.getAltura())
                .build();
    }

    @Transactional
    public void logout(String token) {
        String jti = jwtUtils.getJtiFromJwtToken(token);
        LocalDateTime expiresAt = jwtUtils.getExpirationFromJwtToken(token)
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        TokenRevocado tokenRevocado = TokenRevocado.builder()
                .jti(jti)
                .expiresAt(expiresAt)
                .revokedAt(LocalDateTime.now())
                .build();

        tokenRevocadoRepository.save(tokenRevocado);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        tokenRevocadoRepository.deleteExpiredTokens(LocalDateTime.now());
    }
}
