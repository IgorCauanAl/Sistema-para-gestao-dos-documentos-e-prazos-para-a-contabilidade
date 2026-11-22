package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CnpjFormatterTest {

    @Test
    void shouldFormatDigitsAsBrazilianCnpj() {
        assertThat(CnpjFormatter.format("86489351000123")).isEqualTo("86.489.351/0001-23");
    }

    @Test
    void shouldKeepAlreadyFormattedCnpj() {
        assertThat(CnpjFormatter.format("86.489.351/0001-23")).isEqualTo("86.489.351/0001-23");
    }

    @Test
    void shouldIgnoreAnyPunctuation() {
        assertThat(CnpjFormatter.format("86 489 351 0001 23")).isEqualTo("86.489.351/0001-23");
    }

    @Test
    void shouldExposeOnlyDigits() {
        assertThat(CnpjFormatter.digits("86.489.351/0001-23")).isEqualTo("86489351000123");
    }

    @Test
    void shouldRejectInvalidLengthAndNull() {
        assertThatThrownBy(() -> CnpjFormatter.format("12345"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("14 dígitos");
        assertThatThrownBy(() -> CnpjFormatter.format(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("obrigatório");
    }
}
