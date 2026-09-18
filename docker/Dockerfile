# Eclipse Temurin OpenJDK 21 Alpine image (Full ARM64 and x86_64 architecture support)
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Aetheris Cloud Platform"
LABEL description="High-performance lightweight Minecraft container for Oracle Cloud ARM VM"

RUN apk add --no-cache curl bash jq libc6-compat

WORKDIR /data

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 25565 25575

VOLUME ["/data"]

ENTRYPOINT ["/entrypoint.sh"]
