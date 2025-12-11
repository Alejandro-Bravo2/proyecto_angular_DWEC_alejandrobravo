# ============================================================================
# COFIRA Backend - Multi-Stage Dockerfile
# ============================================================================
# Stage 1: Build Spring Boot Application
# Stage 2: Run with optimized JRE
# ============================================================================

# ============================================================================
# STAGE 1: Build
# ============================================================================
FROM gradle:8.5-jdk17 AS build

# Set working directory
WORKDIR /app

# Add labels
LABEL maintainer="alejandrobravo"
LABEL description="Cofira Backend - Spring Boot Application"
LABEL version="1.0.0"

# Copy gradle files
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build application
RUN gradle clean bootJar --no-daemon -x test

# ============================================================================
# STAGE 2: Production
# ============================================================================
FROM eclipse-temurin:17-jre-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create app user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Set working directory
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Change ownership to spring user
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM options for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
