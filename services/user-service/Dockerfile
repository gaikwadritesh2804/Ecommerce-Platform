FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY services/user-service/pom.xml ./services/user-service/pom.xml
RUN mvn -f services/user-service/pom.xml dependency:go-offline
COPY services/user-service/src ./services/user-service/src
RUN mvn -f services/user-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build --chown=10001:10001 /app/services/user-service/target/*.jar ./user-service.jar
USER 10001:10001
EXPOSE 8081
ENTRYPOINT ["java","-jar","user-service.jar"]