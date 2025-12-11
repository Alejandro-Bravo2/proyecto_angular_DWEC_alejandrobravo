package com.gestioneventos.cofira.dto.plan;

import lombok.Data;

@Data
public class ModificarPlanDTO {
    private Double precio;
    private Boolean subscripcionActiva;
    private Long usuarioId;
}
