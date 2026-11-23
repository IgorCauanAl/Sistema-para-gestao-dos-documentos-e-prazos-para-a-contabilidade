package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User;

/**
 * Resultado da validação de um token: o status da validação e, quando válido,
 * o identificador do usuário (subject).
 */
public record TokenValidation(TokenValidationStatus status, String subject) {

    public static TokenValidation valid(String subject) {
        return new TokenValidation(TokenValidationStatus.VALID, subject);
    }

    public static TokenValidation expired() {
        return new TokenValidation(TokenValidationStatus.EXPIRED, "");
    }

    public static TokenValidation invalid() {
        return new TokenValidation(TokenValidationStatus.INVALID, "");
    }

    public boolean isValid() {
        return status == TokenValidationStatus.VALID
                && subject != null
                && !subject.isBlank();
    }
}
