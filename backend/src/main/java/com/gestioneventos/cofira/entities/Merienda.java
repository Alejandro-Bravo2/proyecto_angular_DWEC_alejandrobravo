package com.gestioneventos.cofira.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Merienda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "merienda_alimentos", joinColumns = @JoinColumn(name = "merienda_id"))
    @Column(name = "alimento")
    private List<String> alimentos;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Merienda merienda)) return false;
        return Objects.equals(id, merienda.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
