#!/bin/bash
set -e

# Check if external MONGODB_URI is provided
if [ -z "$MONGODB_URI" ] || echo "$MONGODB_URI" | grep -q "localhost" || echo "$MONGODB_URI" | grep -q "127.0.0.1"; then
    echo "=========================================================="
    echo " No external MONGODB_URI provided."
    echo " Starting internal MongoDB engine on 127.0.0.1:27017..."
    echo "=========================================================="
    
    mkdir -p /data/db /var/log/mongodb
    
    # Start mongod with 100MB cache to stay comfortably under 512MB RAM
    mongod --dbpath /data/db --bind_ip 127.0.0.1 --wiredTigerCacheSizeGB 0.1 --logpath /var/log/mongodb/mongod.log --fork || {
        echo "Fork flag not supported, starting in background..."
        mongod --dbpath /data/db --bind_ip 127.0.0.1 --wiredTigerCacheSizeGB 0.1 --logpath /var/log/mongodb/mongod.log &
    }
    
    echo "Waiting for local MongoDB to start..."
    for i in $(seq 1 20); do
        if curl -s http://127.0.0.1:27017 >/dev/null 2>&1 || (exec 3<>/dev/tcp/127.0.0.1/27017) 2>/dev/null; then
            echo ">>> Internal MongoDB engine is READY on port 27017! <<<"
            break
        fi
        sleep 1
    done
    export MONGODB_URI="mongodb://127.0.0.1:27017/hospital_emergency_db"
else
    echo ">>> External MONGODB_URI configured. Connecting to cloud database... <<<"
fi

echo "=========================================================="
echo " Starting Hospital Emergency Priority System on port ${PORT:-10000}..."
echo "=========================================================="
exec java -Xmx256m -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-10000} -jar app.jar
