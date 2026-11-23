package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.TokenValidationStatus;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Error.ApiErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Responde requisições não autenticadas com 401 e um corpo que diferencia
 * sessão expirada, token inválido e ausência de autenticação. O front-end usa
 * essa informação para limpar o estado local e redirecionar para o login.
 */
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    /**
     * Atributo preenchido pelo {@link SecurityFilter} quando o token é rejeitado.
     */
    public static final String AUTH_FAILURE_ATTRIBUTE = "auth.failure";

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        TokenValidationStatus failure = resolveFailure(request);

        String code;
        String message;
        if (failure == TokenValidationStatus.EXPIRED) {
            code = "TOKEN_EXPIRED";
            message = "Sua sessão expirou. Faça login novamente.";
        } else if (failure == TokenValidationStatus.INVALID) {
            code = "TOKEN_INVALID";
            message = "Token inválido. Faça login novamente.";
        } else {
            code = "NOT_AUTHENTICATED";
            message = "Autenticação necessária. Faça login para continuar.";
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        ApiErrorResponseDTO body = ApiErrorResponseDTO.of(
                HttpStatus.UNAUTHORIZED,
                code,
                message,
                request.getRequestURI()
        );

        objectMapper.writeValue(response.getWriter(), body);
    }

    private static TokenValidationStatus resolveFailure(HttpServletRequest request) {
        Object failure = request.getAttribute(AUTH_FAILURE_ATTRIBUTE);
        if (failure instanceof TokenValidationStatus status) {
            return status;
        }
        return null;
    }
}
