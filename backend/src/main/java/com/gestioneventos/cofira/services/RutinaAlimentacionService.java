package com.gestioneventos.cofira.services;

import com.gestioneventos.cofira.dto.rutinaalimentacion.*;
import com.gestioneventos.cofira.entities.*;
import com.gestioneventos.cofira.enums.DiaSemana;
import com.gestioneventos.cofira.exceptions.RecursoNoEncontradoException;
import com.gestioneventos.cofira.repositories.RutinaAlimentacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RutinaAlimentacionService {
    private static final String RUTINA_NO_ENCONTRADA = "Rutina de alimentación no encontrada con id ";

    private final RutinaAlimentacionRepository rutinaAlimentacionRepository;

    public RutinaAlimentacionService(RutinaAlimentacionRepository rutinaAlimentacionRepository) {
        this.rutinaAlimentacionRepository = rutinaAlimentacionRepository;
    }

    public List<RutinaAlimentacionDTO> listarRutinas() {
        return rutinaAlimentacionRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public RutinaAlimentacionDTO obtenerRutina(Long id) {
        RutinaAlimentacion rutina = rutinaAlimentacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(RUTINA_NO_ENCONTRADA + id));
        return convertirADTO(rutina);
    }

    @Transactional
    public RutinaAlimentacionDTO crearRutina(CrearRutinaAlimentacionDTO dto) {
        RutinaAlimentacion rutina = new RutinaAlimentacion();
        rutina.setFechaInicio(dto.getFechaInicio());

        List<DiaAlimentacion> dias = dto.getDiasAlimentacion().stream()
                .map(this::convertirDiaAlimentacionDTOAEntidad)
                .collect(Collectors.toList());

        rutina.setDiasAlimentacion(dias);

        RutinaAlimentacion guardada = rutinaAlimentacionRepository.save(rutina);
        return convertirADTO(guardada);
    }

    @Transactional
    public void eliminarRutina(Long id) {
        RutinaAlimentacion rutina = rutinaAlimentacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(RUTINA_NO_ENCONTRADA + id));
        rutinaAlimentacionRepository.delete(rutina);
    }

    public RutinaAlimentacionDTO convertirADTO(RutinaAlimentacion rutina) {
        RutinaAlimentacionDTO dto = new RutinaAlimentacionDTO();
        dto.setId(rutina.getId());
        dto.setFechaInicio(rutina.getFechaInicio());

        if (rutina.getDiasAlimentacion() != null) {
            List<DiaAlimentacionDTO> diasDTO = rutina.getDiasAlimentacion().stream()
                    .map(this::convertirDiaAlimentacionADTO)
                    .collect(Collectors.toList());
            dto.setDiasAlimentacion(diasDTO);
        }

        return dto;
    }

    private DiaAlimentacionDTO convertirDiaAlimentacionADTO(DiaAlimentacion dia) {
        DiaAlimentacionDTO dto = new DiaAlimentacionDTO();
        dto.setId(dia.getId());
        dto.setDiaSemana(dia.getDiaSemana().name());
        dto.setDesayuno(convertirComidaADTO(dia.getDesayuno()));
        dto.setAlmuerzo(convertirComidaADTO(dia.getAlmuerzo()));
        dto.setComida(convertirComidaADTO(dia.getComida()));
        dto.setMerienda(convertirComidaADTO(dia.getMerienda()));
        dto.setCena(convertirComidaADTO(dia.getCena()));
        return dto;
    }

    private ComidaDTO convertirComidaADTO(Object comida) {
        if (comida == null) return null;

        ComidaDTO dto = new ComidaDTO();
        if (comida instanceof Desayuno) {
            Desayuno d = (Desayuno) comida;
            dto.setId(d.getId());
            dto.setAlimentos(d.getAlimentos());
        } else if (comida instanceof Almuerzo) {
            Almuerzo a = (Almuerzo) comida;
            dto.setId(a.getId());
            dto.setAlimentos(a.getAlimentos());
        } else if (comida instanceof Comida) {
            Comida c = (Comida) comida;
            dto.setId(c.getId());
            dto.setAlimentos(c.getAlimentos());
        } else if (comida instanceof Merienda) {
            Merienda m = (Merienda) comida;
            dto.setId(m.getId());
            dto.setAlimentos(m.getAlimentos());
        } else if (comida instanceof Cena) {
            Cena c = (Cena) comida;
            dto.setId(c.getId());
            dto.setAlimentos(c.getAlimentos());
        }
        return dto;
    }

    private DiaAlimentacion convertirDiaAlimentacionDTOAEntidad(CrearDiaAlimentacionDTO dto) {
        DiaAlimentacion dia = new DiaAlimentacion();
        dia.setDiaSemana(DiaSemana.valueOf(dto.getDiaSemana().toUpperCase()));

        if (dto.getDesayuno() != null) {
            Desayuno desayuno = new Desayuno();
            desayuno.setAlimentos(dto.getDesayuno().getAlimentos());
            dia.setDesayuno(desayuno);
        }

        if (dto.getAlmuerzo() != null) {
            Almuerzo almuerzo = new Almuerzo();
            almuerzo.setAlimentos(dto.getAlmuerzo().getAlimentos());
            dia.setAlmuerzo(almuerzo);
        }

        if (dto.getComida() != null) {
            Comida comida = new Comida();
            comida.setAlimentos(dto.getComida().getAlimentos());
            dia.setComida(comida);
        }

        if (dto.getMerienda() != null) {
            Merienda merienda = new Merienda();
            merienda.setAlimentos(dto.getMerienda().getAlimentos());
            dia.setMerienda(merienda);
        }

        if (dto.getCena() != null) {
            Cena cena = new Cena();
            cena.setAlimentos(dto.getCena().getAlimentos());
            dia.setCena(cena);
        }

        return dia;
    }
}
