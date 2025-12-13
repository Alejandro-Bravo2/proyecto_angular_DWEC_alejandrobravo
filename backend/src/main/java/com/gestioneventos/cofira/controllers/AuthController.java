package com.gestioneventos.cofira.controllers;

import com.gestioneventos.cofira.api.AuthControllerApi;
import com.gestioneventos.cofira.dto.auth.AuthResponseDTO;
import com.gestioneventos.cofira.dto.auth.LoginRequestDTO;
import com.gestioneventos.cofira.dto.auth.RegisterRequestDTO;
import com.gestioneventos.cofira.dto.auth.UserInfoDTO;
import com.gestioneventos.cofira.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController implements AuthControllerApi {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        AuthResponseDTO response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        AuthResponseDTO response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoDTO> getCurrentUser() {
        UserInfoDTO userInfo = authService.getCurrentUser();
        return ResponseEntity.ok(userInfo);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
            return ResponseEntity.ok().body("Logout exitoso");
        }
        return ResponseEntity.badRequest().body("Token no proporcionado");
    }
}
