
# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

ARG SERVICE_DIR

WORKDIR /app

# Copy Maven parent and service POM
COPY pom.xml ./pom.xml
COPY ${SERVICE_DIR}/pom.xml ${SERVICE_DIR}/pom.xml

# Download dependencies
RUN mvn -f ${SERVICE_DIR}/pom.xml dependency:go-offline

# Copy source code
COPY ${SERVICE_DIR}/src ${SERVICE_DIR}/src

# Compile and package
RUN mvn -f ${SERVICE_DIR}/pom.xml clean package -DskipTests


# Stage 2: Runtime
FROM eclipse-temurin:21.0.13.1_2-jre-alpine-3.24
RUN apk update && apk upgrade --no-cache zlib

ARG SERVICE_DIR
ARG SERVICE_PORT

WORKDIR /app

# Copy packaged JAR
COPY --from=build --chown=10001:10001 \
    /app/${SERVICE_DIR}/target/*.jar app.jar

# Non-root execution
USER 10001:10001

EXPOSE ${SERVICE_PORT}

ENTRYPOINT ["java", "-jar", "app.jar"]
