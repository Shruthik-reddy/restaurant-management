# Multi-stage build for better compatibility
FROM maven:3.9.4-eclipse-temurin-17 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:resolve

COPY src ./src
RUN mvn clean package -DskipTests

# Use official OpenJDK 17 runtime
FROM openjdk:17-jdk-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV PORT 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
