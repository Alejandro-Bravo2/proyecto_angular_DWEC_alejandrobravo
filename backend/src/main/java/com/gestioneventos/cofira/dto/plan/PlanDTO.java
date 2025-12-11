package com.gestioneventos.cofira.dto.plan;

import lombok.Data;

@Data
public class PlanDTO {
    private Long id;
    private Double precio;
    private Boolean subscripcionActiva;
    private Long usuarioId;
}
