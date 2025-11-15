package com.photo_critique_be.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer"
)
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        try {
            OpenAPI openAPI = new OpenAPI()
                    .info(new Info()
                            .title("Photo Critique API")
                            .version("1.0")
                            .description("API for Photo Critique Application"))
                    .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));

            log.info("OpenAPI configuration initialized successfully");
            return openAPI;

        } catch (Exception e) {
            log.error("Failed to initialize OpenAPI configuration: {}", e.getMessage());
            throw new RuntimeException("OpenAPI configuration failed", e);
        }
    }
}