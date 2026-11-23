package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Error;

import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Map;

/**
 * Contrato único de erro enviado ao front-end por controllers e pela cadeia de
 * segurança. O Angular normaliza este JSON no ErrorHandler global.
 *
 * @param status      código HTTP
 * @param error       descrição legível do status (ex.: "Bad Request")
 * @param code        código estável para o front-end (ex.: "EMAIL_NOT_FOUND")
 * @param message     mensagem segura para exibição ao usuário
 * @param detail      detalhe adicional, quando houver
 * @param fieldErrors erros de validação por campo
 * @param path        URI da requisição que falhou
 * @param timestamp   instante da falha em ISO-8601
 */
public record ApiErrorResponseDTO(
        int status,
        String error,
        String code,
        String message,
        String detail,
        Map<String, String> fieldErrors,
        String path,
        Instant timestamp
) {

    public static ApiErrorResponseDTO of(
            HttpStatus status,
            String code,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
        return of(status, code, message, path, fieldErrors, Instant.now());
    }

    public static ApiErrorResponseDTO of(
            HttpStatus status,
            String code,
            String message,
            String path,
            Map<String, String> fieldErrors,
            Instant timestamp
    ) {
        return new ApiErrorResponseDTO(
                status.value(),
                reasonPhrase(status),
                code,
                message,
                message,
                fieldErrors == null ? Map.of() : Map.copyOf(fieldErrors),
                path == null ? "" : path,
                timestamp == null ? Instant.now() : timestamp
        );
    }

    public static ApiErrorResponseDTO of(HttpStatus status, String code, String message, String path) {
        return of(status, code, message, path, Map.of());
    }

    private static String reasonPhrase(HttpStatus status) {
        String[] partes = status.name().split("_");
        StringBuilder reason = new StringBuilder();
        for (String parte : partes) {
            if (reason.length() > 0) reason.append(' ');
            reason.append(parte.charAt(0));
            reason.append(parte.substring(1).toLowerCase());
        }
        return reason.toString();
    }
}
