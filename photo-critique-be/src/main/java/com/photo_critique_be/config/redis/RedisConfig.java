package com.photo_critique_be.config.redis;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import java.time.Duration;

@Slf4j
@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPassword;

    @Value("${spring.data.redis.username}")
    private String redisUsername;

    @Value("${spring.data.redis.ssl.enabled:true}")
    private boolean useSsl;

    @Value("${spring.data.redis.database:0}")
    private int redisDatabase;

    @Value("${spring.data.redis.timeout:5000}")
    private long timeout;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        try {
            log.info("Attempting to connect to Redis - Host: {}, Port: {}, SSL: {}, DB: {}",
                    redisHost, redisPort, useSsl, redisDatabase);

            RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
            config.setHostName(redisHost);
            config.setPort(redisPort);
            config.setPassword(redisPassword);
            config.setUsername(redisUsername);
            config.setDatabase(redisDatabase);

            LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfigBuilder = LettuceClientConfiguration.builder();

            // Cấu hình SSL nếu được bật
            if (useSsl) {
                clientConfigBuilder.useSsl();
            }

            // Cấu hình timeout và client options
            clientConfigBuilder
                    .commandTimeout(Duration.ofMillis(timeout))
                    .shutdownTimeout(Duration.ofMillis(timeout))
                    .clientOptions(ClientOptions.builder()
                            .socketOptions(SocketOptions.builder()
                                    .connectTimeout(Duration.ofMillis(timeout))
                                    .build())
                            .autoReconnect(true)
                            .build());

            LettuceConnectionFactory factory = new LettuceConnectionFactory(config, clientConfigBuilder.build());
            factory.setValidateConnection(true);
            factory.afterPropertiesSet();

            // Test connection
            factory.getConnection().ping();
            log.info("Successfully connected to Redis at {}:{}", redisHost, redisPort);

            return factory;

        } catch (Exception e) {
            log.error("Failed to connect to Redis: {}:{} - {}", redisHost, redisPort, e.getMessage());
            throw new RuntimeException("Redis connection failed: " + e.getMessage(), e);
        }
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}