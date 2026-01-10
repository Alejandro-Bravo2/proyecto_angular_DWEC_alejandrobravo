package com.gestioneventos.cofira.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestioneventos.cofira.dto.ai.*;
import com.gestioneventos.cofira.entities.*;
import com.gestioneventos.cofira.enums.DiaSemana;
import com.gestioneventos.cofira.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(AIGenerationService.class);

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.model}")
    private String model;

    @Value("${openrouter.model.fallback}")
    private String fallbackModel;

    @Autowired
    private RutinaEjercicioRepository rutinaEjercicioRepository;

    @Autowired
    private RutinaAlimentacionRepository rutinaAlimentacionRepository;

    @Autowired
    private EjerciciosRepository ejerciciosRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public RutinaEjercicio generateWeeklyWorkoutPlan(UserProfile profile) {
        String prompt = buildWorkoutPrompt(profile);
        String response = callOpenRouterAPI(prompt);

        if (response == null || response.isEmpty()) {
            logger.error("No response from AI for workout plan");
            return createDefaultWorkoutPlan(profile);
        }

        try {
            return parseWorkoutResponse(response, profile);
        } catch (Exception e) {
            logger.error("Error parsing workout response: {}", e.getMessage());
            return createDefaultWorkoutPlan(profile);
        }
    }

    @Transactional
    public RutinaAlimentacion generateWeeklyMealPlan(UserProfile profile) {
        String prompt = buildMealPrompt(profile);
        String response = callOpenRouterAPI(prompt);

        if (response == null || response.isEmpty()) {
            logger.error("No response from AI for meal plan");
            return createDefaultMealPlan(profile);
        }

        try {
            return parseMealResponse(response, profile);
        } catch (Exception e) {
            logger.error("Error parsing meal response: {}", e.getMessage());
            return createDefaultMealPlan(profile);
        }
    }

    public FoodAnalysisDTO analyzeFood(String base64Image) {
        String prompt = buildFoodAnalysisPrompt(base64Image);
        String response = callOpenRouterAPI(prompt);

        if (response == null || response.isEmpty()) {
            return createDefaultFoodAnalysis();
        }

        try {
            return parseFoodAnalysisResponse(response);
        } catch (Exception e) {
            logger.error("Error parsing food analysis: {}", e.getMessage());
            return createDefaultFoodAnalysis();
        }
    }

    private String buildWorkoutPrompt(UserProfile profile) {
        int age = Period.between(profile.getBirthDate(), LocalDate.now()).getYears();

        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres un entrenador personal profesional. Genera una rutina de ejercicios semanal personalizada.\n\n");
        prompt.append("DATOS DEL USUARIO:\n");
        prompt.append("- Genero: ").append(profile.getGender()).append("\n");
        prompt.append("- Edad: ").append(age).append(" anos\n");
        prompt.append("- Peso actual: ").append(profile.getCurrentWeightKg()).append(" kg\n");
        prompt.append("- Altura: ").append(profile.getHeightCm()).append(" cm\n");
        prompt.append("- Objetivo principal: ").append(translateGoal(profile.getPrimaryGoal())).append("\n");
        prompt.append("- Nivel de fitness: ").append(profile.getFitnessLevel()).append("\n");
        prompt.append("- Nivel de actividad: ").append(profile.getActivityLevel()).append("\n");
        prompt.append("- Dias de entrenamiento por semana: ").append(profile.getTrainingDaysPerWeek()).append("\n");
        prompt.append("- Duracion por sesion: ").append(profile.getSessionDurationMinutes()).append(" minutos\n");
        prompt.append("- Equipamiento disponible: ").append(profile.getEquipment() != null ? String.join(", ", profile.getEquipment()) : "GYM").append("\n");

        if (profile.getInjuries() != null && !profile.getInjuries().isEmpty()) {
            prompt.append("- Lesiones/limitaciones: ").append(String.join(", ", profile.getInjuries())).append("\n");
        }

        prompt.append("\nRESPONDE SOLO CON UN JSON VALIDO sin markdown ni texto adicional. El formato debe ser:\n");
        prompt.append("{\n");
        prompt.append("  \"dias\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"diaSemana\": \"LUNES\",\n");
        prompt.append("      \"ejercicios\": [\n");
        prompt.append("        {\n");
        prompt.append("          \"nombre\": \"Press de banca\",\n");
        prompt.append("          \"series\": 4,\n");
        prompt.append("          \"repeticiones\": 10,\n");
        prompt.append("          \"descansoSegundos\": 90,\n");
        prompt.append("          \"descripcion\": \"Ejercicio para pecho\",\n");
        prompt.append("          \"grupoMuscular\": \"Pecho\"\n");
        prompt.append("        }\n");
        prompt.append("      ]\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        prompt.append("\nGenera ejercicios para ").append(profile.getTrainingDaysPerWeek()).append(" dias. ");
        prompt.append("Usa dias de semana validos: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO.");

        return prompt.toString();
    }

    private String buildMealPrompt(UserProfile profile) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres un nutricionista profesional. Genera un plan de comidas semanal personalizado.\n\n");
        prompt.append("DATOS DEL USUARIO:\n");
        prompt.append("- Calorias diarias objetivo: ").append(Math.round(profile.getDailyCalorieTarget())).append(" kcal\n");
        prompt.append("- Proteinas objetivo: ").append(Math.round(profile.getProteinTargetGrams())).append("g\n");
        prompt.append("- Carbohidratos objetivo: ").append(Math.round(profile.getCarbsTargetGrams())).append("g\n");
        prompt.append("- Grasas objetivo: ").append(Math.round(profile.getFatTargetGrams())).append("g\n");
        prompt.append("- Tipo de dieta: ").append(profile.getDietType()).append("\n");
        prompt.append("- Comidas por dia: ").append(profile.getMealsPerDay()).append("\n");

        if (profile.getAllergies() != null && !profile.getAllergies().isEmpty()) {
            prompt.append("- Alergias/intolerancias: ").append(String.join(", ", profile.getAllergies())).append("\n");
        }

        if (profile.getMedicalConditions() != null && !profile.getMedicalConditions().isEmpty()) {
            prompt.append("- Condiciones medicas: ").append(String.join(", ", profile.getMedicalConditions())).append("\n");
        }

        prompt.append("\nRESPONDE SOLO CON UN JSON VALIDO sin markdown ni texto adicional. El formato debe ser:\n");
        prompt.append("{\n");
        prompt.append("  \"dias\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"diaSemana\": \"LUNES\",\n");
        prompt.append("      \"desayuno\": [\"Avena con leche\", \"Platano\", \"Miel\"],\n");
        prompt.append("      \"almuerzo\": [\"Ensalada cesar\", \"Pollo a la plancha\"],\n");
        prompt.append("      \"comida\": [\"Arroz integral\", \"Verduras salteadas\", \"Tofu\"],\n");
        prompt.append("      \"merienda\": [\"Yogur natural\", \"Frutos secos\"],\n");
        prompt.append("      \"cena\": [\"Salmon al horno\", \"Ensalada verde\"]\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        prompt.append("\nGenera comidas para 7 dias. Usa dias de semana validos: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO.");
        prompt.append("\nCada comida es un array de strings con los alimentos que la componen.");

        return prompt.toString();
    }

    private String buildFoodAnalysisPrompt(String base64Image) {
        return "Analiza esta imagen de comida y proporciona informacion nutricional estimada.\n\n" +
               "RESPONDE SOLO CON UN JSON VALIDO sin markdown:\n" +
               "{\n" +
               "  \"nombreComida\": \"Nombre del plato\",\n" +
               "  \"descripcion\": \"Descripcion breve\",\n" +
               "  \"porcion\": \"Tamano estimado\",\n" +
               "  \"calorias\": 500,\n" +
               "  \"proteinas\": 30,\n" +
               "  \"carbohidratos\": 50,\n" +
               "  \"grasas\": 20,\n" +
               "  \"fibra\": 5,\n" +
               "  \"ingredientes\": [\"ingrediente1\", \"ingrediente2\"],\n" +
               "  \"confianza\": 0.85\n" +
               "}";
    }

    private String callOpenRouterAPI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", "https://cofira.app");
            headers.set("X-Title", "COFIRA App");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 4000);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.get("choices");
                if (choices != null && choices.isArray() && choices.size() > 0) {
                    JsonNode content = choices.get(0).get("message").get("content");
                    if (content != null) {
                        return cleanJsonResponse(content.asText());
                    }
                }
            }

            logger.warn("Trying fallback model...");
            return callWithFallbackModel(prompt);

        } catch (Exception e) {
            logger.error("Error calling OpenRouter API: {}", e.getMessage());
            return callWithFallbackModel(prompt);
        }
    }

    private String callWithFallbackModel(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", fallbackModel);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 4000);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.get("choices");
                if (choices != null && choices.isArray() && choices.size() > 0) {
                    return cleanJsonResponse(choices.get(0).get("message").get("content").asText());
                }
            }
        } catch (Exception e) {
            logger.error("Fallback model also failed: {}", e.getMessage());
        }
        return null;
    }

    private String cleanJsonResponse(String response) {
        if (response == null) return null;

        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        }
        if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }
        return response.trim();
    }

    private RutinaEjercicio parseWorkoutResponse(String response, UserProfile profile) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(response);
        JsonNode diasNode = root.get("dias");

        List<DiaEjercicio> diasEjercicio = new ArrayList<>();

        if (diasNode != null && diasNode.isArray()) {
            for (JsonNode diaNode : diasNode) {
                String diaSemanaStr = diaNode.get("diaSemana").asText();
                DiaSemana diaSemana = DiaSemana.valueOf(diaSemanaStr.toUpperCase());

                List<Ejercicios> ejerciciosList = new ArrayList<>();
                JsonNode ejerciciosNode = diaNode.get("ejercicios");

                if (ejerciciosNode != null && ejerciciosNode.isArray()) {
                    for (JsonNode ejNode : ejerciciosNode) {
                        Ejercicios ejercicio = Ejercicios.builder()
                            .nombreEjercicio(ejNode.get("nombre").asText())
                            .series(ejNode.get("series").asInt())
                            .repeticiones(ejNode.get("repeticiones").asInt())
                            .tiempoDescansoSegundos(ejNode.has("descansoSegundos") ? ejNode.get("descansoSegundos").asInt() : 60)
                            .descripcion(ejNode.has("descripcion") ? ejNode.get("descripcion").asText() : "")
                            .grupoMuscular(ejNode.has("grupoMuscular") ? ejNode.get("grupoMuscular").asText() : "General")
                            .build();

                        ejercicio = ejerciciosRepository.save(ejercicio);
                        ejerciciosList.add(ejercicio);
                    }
                }

                DiaEjercicio diaEjercicio = DiaEjercicio.builder()
                    .diaSemana(diaSemana)
                    .ejercicios(ejerciciosList)
                    .build();

                diasEjercicio.add(diaEjercicio);
            }
        }

        RutinaEjercicio rutina = RutinaEjercicio.builder()
            .fechaInicio(LocalDate.now())
            .diasEjercicio(diasEjercicio)
            .build();

        return rutinaEjercicioRepository.save(rutina);
    }

    private RutinaAlimentacion parseMealResponse(String response, UserProfile profile) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(response);
        JsonNode diasNode = root.get("dias");

        List<DiaAlimentacion> diasAlimentacion = new ArrayList<>();

        if (diasNode != null && diasNode.isArray()) {
            for (JsonNode diaNode : diasNode) {
                String diaSemanaStr = diaNode.get("diaSemana").asText();
                DiaSemana diaSemana = DiaSemana.valueOf(diaSemanaStr.toUpperCase());

                DiaAlimentacion.DiaAlimentacionBuilder builder = DiaAlimentacion.builder()
                    .diaSemana(diaSemana);

                // Parse each meal type
                if (diaNode.has("desayuno")) {
                    builder.desayuno(Desayuno.builder()
                        .alimentos(parseAlimentos(diaNode.get("desayuno")))
                        .build());
                }

                if (diaNode.has("almuerzo")) {
                    builder.almuerzo(Almuerzo.builder()
                        .alimentos(parseAlimentos(diaNode.get("almuerzo")))
                        .build());
                }

                if (diaNode.has("comida")) {
                    builder.comida(Comida.builder()
                        .alimentos(parseAlimentos(diaNode.get("comida")))
                        .build());
                }

                if (diaNode.has("merienda")) {
                    builder.merienda(Merienda.builder()
                        .alimentos(parseAlimentos(diaNode.get("merienda")))
                        .build());
                }

                if (diaNode.has("cena")) {
                    builder.cena(Cena.builder()
                        .alimentos(parseAlimentos(diaNode.get("cena")))
                        .build());
                }

                diasAlimentacion.add(builder.build());
            }
        }

        RutinaAlimentacion rutina = RutinaAlimentacion.builder()
            .fechaInicio(LocalDate.now())
            .diasAlimentacion(diasAlimentacion)
            .build();

        return rutinaAlimentacionRepository.save(rutina);
    }

    private List<String> parseAlimentos(JsonNode node) {
        List<String> alimentos = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                alimentos.add(item.asText());
            }
        }
        return alimentos;
    }

    private FoodAnalysisDTO parseFoodAnalysisResponse(String response) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(response);

        FoodAnalysisDTO analysis = new FoodAnalysisDTO();
        analysis.setNombreComida(root.has("nombreComida") ? root.get("nombreComida").asText() : "Comida desconocida");
        analysis.setDescripcion(root.has("descripcion") ? root.get("descripcion").asText() : "");
        analysis.setPorcion(root.has("porcion") ? root.get("porcion").asText() : "1 porcion");
        analysis.setCalorias(root.has("calorias") ? root.get("calorias").asInt() : 0);
        analysis.setProteinas(root.has("proteinas") ? root.get("proteinas").asDouble() : 0);
        analysis.setCarbohidratos(root.has("carbohidratos") ? root.get("carbohidratos").asDouble() : 0);
        analysis.setGrasas(root.has("grasas") ? root.get("grasas").asDouble() : 0);
        analysis.setFibra(root.has("fibra") ? root.get("fibra").asDouble() : 0);
        analysis.setConfianza(root.has("confianza") ? root.get("confianza").asDouble() : 0.5);

        if (root.has("ingredientes") && root.get("ingredientes").isArray()) {
            List<String> ingredientes = new ArrayList<>();
            for (JsonNode ing : root.get("ingredientes")) {
                ingredientes.add(ing.asText());
            }
            analysis.setIngredientes(ingredientes);
        }

        return analysis;
    }

    private String translateGoal(com.gestioneventos.cofira.enums.PrimaryGoal goal) {
        if (goal == null) return "Mantener forma fisica";
        return switch (goal) {
            case LOSE_WEIGHT -> "Perder peso";
            case GAIN_MUSCLE -> "Ganar musculo";
            case MAINTAIN -> "Mantener forma fisica";
            case IMPROVE_HEALTH -> "Mejorar salud general";
        };
    }

    private RutinaEjercicio createDefaultWorkoutPlan(UserProfile profile) {
        List<DiaEjercicio> dias = new ArrayList<>();
        int trainingDays = profile.getTrainingDaysPerWeek() != null ? profile.getTrainingDaysPerWeek() : 3;
        DiaSemana[] diasSemana = {DiaSemana.LUNES, DiaSemana.MIERCOLES, DiaSemana.VIERNES, DiaSemana.MARTES, DiaSemana.JUEVES, DiaSemana.SABADO};

        for (int i = 0; i < Math.min(trainingDays, diasSemana.length); i++) {
            List<Ejercicios> ejercicios = new ArrayList<>();
            ejercicios.add(ejerciciosRepository.save(Ejercicios.builder()
                .nombreEjercicio("Sentadillas")
                .series(3).repeticiones(12)
                .tiempoDescansoSegundos(60)
                .descripcion("Ejercicio basico de piernas")
                .grupoMuscular("Piernas")
                .build()));
            ejercicios.add(ejerciciosRepository.save(Ejercicios.builder()
                .nombreEjercicio("Flexiones")
                .series(3).repeticiones(10)
                .tiempoDescansoSegundos(60)
                .descripcion("Ejercicio basico de pecho")
                .grupoMuscular("Pecho")
                .build()));
            ejercicios.add(ejerciciosRepository.save(Ejercicios.builder()
                .nombreEjercicio("Plancha")
                .series(3).repeticiones(30)
                .tiempoDescansoSegundos(45)
                .descripcion("Ejercicio de core - segundos")
                .grupoMuscular("Core")
                .build()));

            dias.add(DiaEjercicio.builder()
                .diaSemana(diasSemana[i])
                .ejercicios(ejercicios)
                .build());
        }

        return rutinaEjercicioRepository.save(RutinaEjercicio.builder()
            .fechaInicio(LocalDate.now())
            .diasEjercicio(dias)
            .build());
    }

    private RutinaAlimentacion createDefaultMealPlan(UserProfile profile) {
        List<DiaAlimentacion> dias = new ArrayList<>();
        DiaSemana[] diasSemana = DiaSemana.values();

        for (DiaSemana dia : diasSemana) {
            DiaAlimentacion diaAlimentacion = DiaAlimentacion.builder()
                .diaSemana(dia)
                .desayuno(Desayuno.builder()
                    .alimentos(Arrays.asList("Avena con leche", "Platano", "Miel"))
                    .build())
                .almuerzo(Almuerzo.builder()
                    .alimentos(Arrays.asList("Ensalada cesar", "Pollo a la plancha", "Pan integral"))
                    .build())
                .comida(Comida.builder()
                    .alimentos(Arrays.asList("Arroz integral", "Verduras salteadas", "Pechuga de pollo"))
                    .build())
                .merienda(Merienda.builder()
                    .alimentos(Arrays.asList("Yogur natural", "Frutos secos"))
                    .build())
                .cena(Cena.builder()
                    .alimentos(Arrays.asList("Salmon al horno", "Ensalada verde"))
                    .build())
                .build();

            dias.add(diaAlimentacion);
        }

        return rutinaAlimentacionRepository.save(RutinaAlimentacion.builder()
            .fechaInicio(LocalDate.now())
            .diasAlimentacion(dias)
            .build());
    }

    private FoodAnalysisDTO createDefaultFoodAnalysis() {
        FoodAnalysisDTO analysis = new FoodAnalysisDTO();
        analysis.setNombreComida("Comida no identificada");
        analysis.setDescripcion("No se pudo analizar la imagen");
        analysis.setPorcion("Desconocida");
        analysis.setCalorias(0);
        analysis.setProteinas(0.0);
        analysis.setCarbohidratos(0.0);
        analysis.setGrasas(0.0);
        analysis.setFibra(0.0);
        analysis.setConfianza(0.0);
        analysis.setIngredientes(new ArrayList<>());
        return analysis;
    }

    @Transactional
    public void regenerateAllUserPlans() {
        List<UserProfile> profiles = userProfileRepository.findAll();
        for (UserProfile profile : profiles) {
            try {
                generateWeeklyWorkoutPlan(profile);
                generateWeeklyMealPlan(profile);
                logger.info("Regenerated plans for user: {}", profile.getUsuario().getUsername());
            } catch (Exception e) {
                logger.error("Failed to regenerate plans for user {}: {}",
                    profile.getUsuario().getUsername(), e.getMessage());
            }
        }
    }
}
