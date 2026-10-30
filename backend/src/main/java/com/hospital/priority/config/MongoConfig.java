package com.hospital.priority.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import de.flapdoodle.embed.mongo.commands.ServerAddress;
import de.flapdoodle.embed.mongo.distribution.Version;
import de.flapdoodle.embed.mongo.transitions.Mongod;
import de.flapdoodle.embed.mongo.transitions.RunningMongodProcess;
import de.flapdoodle.reverse.TransitionWalker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.concurrent.TimeUnit;

@Slf4j
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri:}")
    private String mongoUri;

    private static TransitionWalker.ReachedState<RunningMongodProcess> runningMongod;

    @Override
    protected String getDatabaseName() {
        return "hospital_emergency_db";
    }

    @Override
    public MongoClient mongoClient() {
        // 1. If explicit external MongoDB Atlas URI is provided
        if (mongoUri != null && !mongoUri.isBlank() && !mongoUri.contains("localhost:27017") && !mongoUri.contains("127.0.0.1:27017")) {
            log.info("Connecting to external MongoDB Atlas instance...");
            return MongoClients.create(buildClientSettings(mongoUri));
        }

        // 2. Check if native mongod is active on 127.0.0.1:27017 (e.g. inside Docker container)
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress("127.0.0.1", 27017), 1000);
            log.info("Native local MongoDB detected running on 127.0.0.1:27017");
            return MongoClients.create(buildClientSettings("mongodb://127.0.0.1:27017/hospital_emergency_db"));
        } catch (Exception e) {
            log.info("No native local MongoDB on 127.0.0.1:27017, checking embedded fallback...");
        }

        // 3. Fallback to Flapdoodle embedded for local Windows development
        try {
            if (runningMongod == null) {
                log.info("Starting local embedded Flapdoodle MongoDB process...");
                runningMongod = Mongod.instance().start(Version.Main.V7_0);
            }
            ServerAddress addr = runningMongod.current().getServerAddress();
            int port = addr.getPort();
            String host = addr.getHost();
            log.info("Flapdoodle Embedded MongoDB active on {}:{}", host, port);
            return MongoClients.create(buildClientSettings("mongodb://" + host + ":" + port + "/hospital_emergency_db"));
        } catch (Exception e) {
            log.warn("Embedded Mongo initialization note: {}", e.getMessage());
        }

        return MongoClients.create(buildClientSettings("mongodb://localhost:27017/hospital_emergency_db"));
    }

    private MongoClientSettings buildClientSettings(String connectionUri) {
        return MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(connectionUri))
                .applyToClusterSettings(builder -> builder.serverSelectionTimeout(5000, TimeUnit.MILLISECONDS))
                .applyToSocketSettings(builder -> builder.connectTimeout(5000, TimeUnit.MILLISECONDS))
                .build();
    }
}
