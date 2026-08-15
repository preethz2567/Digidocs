# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml and resolve dependencies first (for caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal production runtime
FROM eclipse-temurin:21-jre-alpine

# Create a non-root user and group
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership to the non-root user
RUN chown -R spring:spring /app

# Switch to the non-root user
USER spring:spring

# Expose the Spring Boot port
EXPOSE 8081

# Run the application with container-aware memory settings
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
