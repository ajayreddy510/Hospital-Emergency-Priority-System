# Multi-stage Dockerfile for Hospital Emergency Priority System Backend
# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-21-jammy AS builder
WORKDIR /app

# Copy pom.xml and cache dependencies (supports root context)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and package application
COPY backend/src ./src
RUN mvn clean package -DskipTests=true -B

# Stage 2: Runtime (Ubuntu Jammy with full glibc support)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install curl for health monitoring
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy compiled jar from builder stage
COPY --from=builder /app/target/hospital-emergency-priority-system-1.0.0.jar app.jar

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Render standard port
ENV PORT=10000
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-10000} -jar app.jar"]
