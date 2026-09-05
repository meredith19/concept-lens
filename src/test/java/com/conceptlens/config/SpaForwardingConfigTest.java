package com.conceptlens.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SpaForwardingConfigTest {

    private static final Pattern SCRIPT_SRC = Pattern.compile("src=\"(/assets/[^\"]+\\.js)\"");

    @Value("${local.server.port}")
    private int port;

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).build();
        return HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/", "/compare", "/mappings", "/mappings/rel_018"})
    void clientSideRoutesServeTheSpaShell(String path) throws Exception {
        HttpResponse<String> response = get(path);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("<div id=\"root\"></div>");
    }

    @Test
    void unmappedApiPathsReturnNotFound() throws Exception {
        assertThat(get("/api/does-not-exist").statusCode()).isEqualTo(404);
    }

    @Test
    void builtAssetsAreServedInsteadOfTheShell() throws Exception {
        Matcher matcher = SCRIPT_SRC.matcher(get("/").body());
        assertThat(matcher.find()).as("index.html should reference a built script").isTrue();

        HttpResponse<String> asset = get(matcher.group(1));

        assertThat(asset.statusCode()).isEqualTo(200);
        assertThat(asset.body()).doesNotContain("<div id=\"root\"></div>");
    }
}
