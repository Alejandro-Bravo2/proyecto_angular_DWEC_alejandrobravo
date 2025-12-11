package com.gestioneventos.cofira.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Double precio;

    @NotNull
    private Boolean subscripcionActiva;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Plan plan)) return false;
        return Objects.equals(id, plan.id) &&
                Objects.equals(usuario, plan.usuario);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, usuario);
    }
}
