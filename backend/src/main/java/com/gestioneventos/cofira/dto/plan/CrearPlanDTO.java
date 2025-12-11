package com.gestioneventos.cofira.dto.plan;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearPlanDTO {
    @NotNull(message = "El precio no puede ser nulo")
    private Double precio;

    @NotNull(message = "El estado de subscripción no puede ser nulo")
    private Boolean subscripcionActiva;

    @NotNull(message = "El ID del usuario no puede ser nulo")
    private Long usuarioId;
}
