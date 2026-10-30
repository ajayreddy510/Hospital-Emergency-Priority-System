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

# Install curl, ca-certificates, libssl3, bash
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libssl3 \
    bash \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install standalone native MongoDB 7.0 engine for zero-config operation
RUN curl -fsSL https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.14.tgz -o /tmp/mongodb.tgz \
    && tar -xzf /tmp/mongodb.tgz -C /tmp \
    && mv /tmp/mongodb-linux-x86_64-ubuntu2204-7.0.14/bin/mongod /usr/local/bin/mongod \
    && rm -rf /tmp/mongodb* \
    && chmod +x /usr/local/bin/mongod

# Setup data and log directories
RUN mkdir -p /data/db /var/log/mongodb

# Copy compiled jar from builder stage
COPY --from=builder /app/target/hospital-emergency-priority-system-1.0.0.jar app.jar

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Render standard port
ENV PORT=10000
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
