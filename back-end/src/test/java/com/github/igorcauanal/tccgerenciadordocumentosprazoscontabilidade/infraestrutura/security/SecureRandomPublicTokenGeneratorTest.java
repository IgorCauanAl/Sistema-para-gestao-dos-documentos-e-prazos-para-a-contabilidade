package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.PublicTokenGeneratorPort;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class SecureRandomPublicTokenGeneratorTest {

    private final PublicTokenGeneratorPort generator = new SecureRandomPublicTokenGenerator();

    @Test
    void shouldGenerate128BitUrlSafeTokenWithoutPadding() {
        String token = generator.generateToken();

        assertThat(token).matches("[A-Za-z0-9_-]{22}");
        assertThat(token).doesNotContain("=", "+", "/");
        assertThat(Base64.getUrlDecoder().decode(token)).hasSize(16);
    }

    @Test
    void shouldGenerateUniqueTokens() {
        Set<String> tokens = IntStream.range(0, 1_000)
                .mapToObj(index -> generator.generateToken())
                .collect(Collectors.toSet());

        assertThat(tokens).hasSize(1_000);
    }
}
