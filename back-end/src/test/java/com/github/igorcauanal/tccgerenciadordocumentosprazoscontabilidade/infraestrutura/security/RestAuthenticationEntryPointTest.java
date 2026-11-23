package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.TokenValidationStatus;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class RestAuthenticationEntryPointTest {

    private final ObjectMapper objectMapper = JsonMapper.builder().build();
    private final RestAuthenticationEntryPoint entryPoint = new RestAuthenticationEntryPoint(objectMapper);

    @Test
    void shouldReturnExpiredCodeWhenTokenIsExpired() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute(
                RestAuthenticationEntryPoint.AUTH_FAILURE_ATTRIBUTE,
                TokenValidationStatus.EXPIRED
        );
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(request, response, new InsufficientAuthenticationException("expirado"));

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentType()).contains(MediaType.APPLICATION_JSON_VALUE);
        String body = response.getContentAsString(StandardCharsets.UTF_8);
        assertThat(body).contains("TOKEN_EXPIRED");
        assertThat(body).contains("Sua sessão expirou. Faça login novamente.");
    }

    @Test
    void shouldReturnInvalidCodeWhenTokenIsInvalid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute(
                RestAuthenticationEntryPoint.AUTH_FAILURE_ATTRIBUTE,
                TokenValidationStatus.INVALID
        );
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(request, response, new InsufficientAuthenticationException("inválido"));

        String body = response.getContentAsString(StandardCharsets.UTF_8);
        assertThat(body).contains("TOKEN_INVALID");
        assertThat(body).contains("Token inválido. Faça login novamente.");
    }

    @Test
    void shouldReturnNotAuthenticatedWhenThereIsNoFailureReason() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(
                new MockHttpServletRequest(),
                response,
                new InsufficientAuthenticationException("sem autenticação")
        );

        String body = response.getContentAsString(StandardCharsets.UTF_8);
        assertThat(body).contains("NOT_AUTHENTICATED");
        assertThat(body).contains("Autenticação necessária. Faça login para continuar.");
    }
}
