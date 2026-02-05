# Multi-stage build for Spring Boot application
FROM maven:3.9.5-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# JVM settings optimized for 512MB container with memory leak prevention
# - MaxRAMPercentage: Use 70% of container memory for heap (leave room for metaspace, native)
# - UseG1GC: Better for containers, lower pause times
# - G1HeapRegionSize: Smaller regions for better memory management
# - MaxGCPauseMillis: Target max GC pause time
# - UseStringDeduplication: Reduce memory for duplicate strings
# - +UseContainerSupport: Respect container memory limits
# - MaxMetaspaceSize: Limit metaspace to prevent unbounded growth
# - SoftRefLRUPolicyMSPerMB: Aggressive soft reference cleanup
ENV JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=70.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+UseG1GC \
    -XX:G1HeapRegionSize=1m \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UseStringDeduplication \
    -XX:+OptimizeStringConcat \
    -XX:MaxMetaspaceSize=128m \
    -XX:SoftRefLRUPolicyMSPerMB=50 \
    -Xss256k \
    -XX:+ExitOnOutOfMemoryError"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
