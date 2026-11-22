package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PublicTokenHasherTest {

    @Test
    void shouldHashDeterministicallyAsLowercaseSha256Hex() {
        String hash = PublicTokenHasher.hash("token-teste");

        assertThat(hash).isEqualTo("857c4f4acec38f54bf3e142e67569f0fc7533138d4377d4f22dd98b59bef5573");
        assertThat(hash).hasSize(PublicTokenHasher.HASH_LENGTH).matches("[0-9a-f]{64}");
        assertThat(PublicTokenHasher.hash("token-teste")).isEqualTo(hash);
    }

    @Test
    void shouldGenerateDifferentHashesForDifferentTokens() {
        assertThat(PublicTokenHasher.hash("token-a")).isNotEqualTo(PublicTokenHasher.hash("token-b"));
    }

    @Test
    void shouldRejectBlankToken() {
        assertThatThrownBy(() -> PublicTokenHasher.hash("  "))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
