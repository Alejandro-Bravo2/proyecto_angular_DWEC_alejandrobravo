package com.gestioneventos.cofira.dto.rutinaalimentacion;

import lombok.Data;
import java.util.List;

@Data
public class ComidaDTO {
    private Long id;
    private List<String> alimentos;
}
