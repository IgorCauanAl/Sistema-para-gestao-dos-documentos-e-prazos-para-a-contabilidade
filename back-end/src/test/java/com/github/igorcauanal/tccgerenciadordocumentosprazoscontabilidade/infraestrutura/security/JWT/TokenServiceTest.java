package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security.JWT;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class TokenServiceTest {

    private TokenService tokenService;
    private User user;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService();
        ReflectionTestUtils.setField(
                tokenService,
                "secret",
                "chave-secreta-para-testes-com-mais-de-256-bits-de-tamanho"
        );
        ReflectionTestUtils.setField(tokenService, "expirationMillis", 3_600_000L);

        user = new User(1L, "Marina", "contador@contadash.com.br", "hash", null);
    }

    @Test
    void shouldGenerateTokenWithEmailAsSubject() {
        String token = tokenService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(tokenService.validateToken(token)).isEqualTo(user.getEmail());
    }

    @Test
    void shouldReturnEmptySubjectWhenTokenIsInvalid() {
        assertThat(tokenService.validateToken("token-invalido")).isEmpty();
    }
}
