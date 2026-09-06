package com.conceptlens.api;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Drives the API over real HTTP against a running server.
 *
 * <p>Exercising the servlet stack rather than a mocked one is what makes the status codes and the
 * error body in these tests meaningful, and it needs no test-only web module.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class ApiTestSupport {

    @Value("${local.server.port}")
    private int port;

    @Autowired
    protected ObjectMapper objectMapper;

    private final HttpClient client = HttpClient.newHttpClient();

    /** An HTTP response whose body has been parsed as JSON. */
    protected record Response(int status, JsonNode body, HttpResponse<String> raw) {}

    private Response send(HttpRequest request) {
        try {
            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode body = response.body() == null || response.body().isBlank()
                    ? null
                    : objectMapper.readTree(response.body());
            return new Response(response.statusCode(), body, response);
        } catch (Exception e) {
            throw new IllegalStateException("Request failed: " + request.uri(), e);
        }
    }

    private HttpRequest.Builder request(String path) {
        return HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
    }

    protected Response get(String path) {
        return send(request(path).GET().build());
    }

    protected Response post(String path, Object body) {
        return send(request(path)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build());
    }

    protected Response postRaw(String path, String body) {
        return send(request(path)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build());
    }

    protected Response delete(String path) {
        return send(request(path).DELETE().build());
    }
}
