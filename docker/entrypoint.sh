#!/bin/sh
set -e

echo "=== [Aetheris] Initializing Minecraft Container Instance ==="

# Enforce EULA acceptance
if [ ! -f "/data/eula.txt" ]; then
    echo "eula=true" > /data/eula.txt
    echo "Accepted Minecraft EULA automatically."
fi

# Set default memory if not defined
MEM_MAX=${SERVER_RAM_MB:-2048}
MEM_MIN=$((MEM_MAX * 3 / 4))

echo "Allocated Memory: ${MEM_MIN}M minimum / ${MEM_MAX}M maximum"

# Check server.jar existence
if [ ! -f "/data/server.jar" ]; then
    echo "Error: /data/server.jar not found! Please select a software and version from the Aetheris dashboard."
    sleep 10
    exit 1
fi

exec java -Xms${MEM_MIN}M -Xmx${MEM_MAX}M \
    -XX:+UseG1GC \
    -XX:+ParallelRefProcEnabled \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+DisableExplicitGC \
    -XX:+AlwaysPreTouch \
    -jar /data/server.jar nogui
