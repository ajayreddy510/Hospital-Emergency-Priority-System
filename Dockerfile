# Multi-stage Dockerfile for Hospital Emergency Priority System Backend
# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml from backend/ and cache dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY backend/src ./src
RUN mvn clean package -DskipTests=true -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled jar from builder stage
COPY --from=builder /app/target/hospital-emergency-priority-system-1.0.0.jar app.jar

# Set permissions
RUN chown -R appuser:appgroup /app
USER appuser

# Render injects PORT dynamically (defaults to 8080)
ENV PORT=8080
EXPOSE 8080 10000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
