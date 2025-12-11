package com.gestioneventos.cofira.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestioneventos.cofira.dto.sala.CrearSalaDTO;
import com.gestioneventos.cofira.dto.sala.ModificarSalaDTO;
import com.gestioneventos.cofira.dto.sala.SalaDTO;
import com.gestioneventos.cofira.services.SalaDeGimnasioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/salas")
public class SalaDeGimnasioController {

    private final SalaDeGimnasioService salaDeGimnasioService;

    public SalaDeGimnasioController(SalaDeGimnasioService salaDeGimnasioService) {
        this.salaDeGimnasioService = salaDeGimnasioService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SalaDTO>> listarSalas() {
        List<SalaDTO> salas = salaDeGimnasioService.listarSalas();
        return ResponseEntity.ok(salas);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SalaDTO> obtenerSala(@PathVariable Long id) {
        SalaDTO sala = salaDeGimnasioService.obtenerSala(id);
        return ResponseEntity.ok(sala);
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZADOR')")
    public ResponseEntity<SalaDTO> crearSala(@RequestBody @Valid CrearSalaDTO dto) {
        SalaDTO nuevaSala = salaDeGimnasioService.crearSala(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSala);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZADOR')")
    public ResponseEntity<SalaDTO> actualizarSala(@PathVariable Long id,
                                                  @RequestBody @Valid ModificarSalaDTO dto) {
        SalaDTO salaActualizada = salaDeGimnasioService.actualizarSala(id, dto);
        return ResponseEntity.ok(salaActualizada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZADOR')")
    public ResponseEntity<?> eliminarSala(@PathVariable Long id) {
        salaDeGimnasioService.eliminarSala(id);
        return ResponseEntity.noContent().build();
    }
}
