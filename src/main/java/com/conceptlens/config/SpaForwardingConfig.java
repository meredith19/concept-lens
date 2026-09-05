package com.conceptlens.config;

import java.io.IOException;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Serves the React app's client-side routes.
 *
 * <p>The browser can request a route such as {@code /compare} directly, by refresh or by pasted
 * link, but no such file exists on the classpath. Any request that does not match a real static
 * resource is therefore answered with {@code index.html}, letting the router resolve the route.
 *
 * <p>Requests under {@code /api} are excluded, so an unmapped API path returns 404 rather than
 * the HTML shell.
 */
@Configuration
class SpaForwardingConfig implements WebMvcConfigurer {

    private static final String STATIC_LOCATION = "classpath:/static/";
    private static final Resource INDEX = new ClassPathResource("static/index.html");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations(STATIC_LOCATION)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location)
                            throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        return resourcePath.startsWith("api/") ? null : INDEX;
                    }
                });
    }
}
