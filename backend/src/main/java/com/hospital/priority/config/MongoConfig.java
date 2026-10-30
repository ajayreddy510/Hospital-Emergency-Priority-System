package com.hospital.priority.config;

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
        if (mongoUri != null && !mongoUri.isBlank() && !mongoUri.contains("localhost:27017")) {
            log.info("Connecting to external MongoDB Atlas instance...");
            return MongoClients.create(mongoUri);
        }

        try {
            if (runningMongod == null) {
                log.info("Starting local embedded MongoDB process...");
                runningMongod = Mongod.instance().start(Version.Main.V7_0);
            }
            ServerAddress addr = runningMongod.current().getServerAddress();
            int port = addr.getPort();
            String host = addr.getHost();
            log.info("Embedded MongoDB active on {}:{}", host, port);
            return MongoClients.create("mongodb://" + host + ":" + port + "/hospital_emergency_db");
        } catch (Exception e) {
            log.warn("Embedded Mongo initialization note: {}", e.getMessage());
        }

        return MongoClients.create("mongodb://localhost:27017/hospital_emergency_db");
    }
}
