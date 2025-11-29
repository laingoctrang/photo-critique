# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy maven wrapper + project
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src ./src

RUN chmod +x mvnw
RUN ./mvnw -B -DskipTests package

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Ensure a default PORT (useful for local runs). Render will override PORT env var.
ENV PORT=8080
EXPOSE 8080

# Use shell to allow env var expansion. Bind to 0.0.0.0 for external access.
ENTRYPOINT ["sh", "-c", "java -Dserver.address=0.0.0.0 -Dserver.port=${PORT} -jar /app/app.jar"]
