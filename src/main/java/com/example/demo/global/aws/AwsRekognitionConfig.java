package com.example.demo.global.aws;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.AmazonRekognitionClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AwsRekognitionConfig {

    @Value("${aws.rekognition.region:AP_NORTHEAST_2}")
    private String region;

    @Bean
    public AmazonRekognition amazonRekognition() {
        return AmazonRekognitionClientBuilder.standard()
                .withRegion(Regions.fromName(region))
                .withCredentials(DefaultAWSCredentialsProviderChain.getInstance())
                .build();
    }
}
