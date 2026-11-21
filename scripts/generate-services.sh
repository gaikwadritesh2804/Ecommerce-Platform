
#!/bin/bash

create_service() {
    SERVICE=$1
    CLASS=$2
    PACKAGE=$3
    ENDPOINT=$4
    MESSAGE=$5

    DIR="services/$SERVICE"

    mkdir -p "$DIR/src/main/java/com/ecommerce/$PACKAGE/controller"
    mkdir -p "$DIR/src/main/java/com/ecommerce/$PACKAGE"
    mkdir -p "$DIR/src/test/java/com/ecommerce/$PACKAGE"

    # Service Maven POM
    cat > "$DIR/pom.xml" <<EOF
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.ecommerce</groupId>
        <artifactId>ecommerce-parent</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <artifactId>$SERVICE</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
EOF

    # Spring Boot main class
    cat > "$DIR/src/main/java/com/ecommerce/$PACKAGE/$CLASS.java" <<EOF
package com.ecommerce.$PACKAGE;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class $CLASS {

    public static void main(String[] args) {
        SpringApplication.run($CLASS.class, args);
    }
}
EOF

    # REST Controller
    cat > "$DIR/src/main/java/com/ecommerce/$PACKAGE/controller/${CLASS}Controller.java" <<EOF
package com.ecommerce.$PACKAGE.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class ${CLASS}Controller {

    @GetMapping("$ENDPOINT")
    public Map<String, String> getInfo() {
        return Map.of(
            "service", "$SERVICE",
            "message", "$MESSAGE",
            "status", "UP"
        );
    }
}
EOF

    echo "Created $SERVICE"
}

create_service "user-service" "UserApplication" "user" "/api/users" "User service is running"

create_service "product-service" "ProductApplication" "product" "/api/products" "Product service is running"

create_service "order-service" "OrderApplication" "order" "/api/orders" "Order service is running"

create_service "payment-service" "PaymentApplication" "payment" "/api/payments" "Payment service is running"

echo "All four Spring Boot services created successfully!"
