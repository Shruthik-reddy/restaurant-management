# Use official Maven image
FROM maven:3.9.4 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn clean package -DskipTests

# Use official OpenJDK runtime
FROM openjdk:17

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
