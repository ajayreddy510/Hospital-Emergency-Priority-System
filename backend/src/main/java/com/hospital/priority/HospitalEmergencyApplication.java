package com.hospital.priority;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class HospitalEmergencyApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalEmergencyApplication.class, args);
    }
}
