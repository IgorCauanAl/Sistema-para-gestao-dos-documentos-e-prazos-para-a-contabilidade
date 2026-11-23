package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User;

/**
 * Resultado da validação de um token, usado para diferenciar sessão expirada
 * de token inválido e devolver uma resposta adequada ao cliente.
 */
public enum TokenValidationStatus {
    VALID,
    EXPIRED,
    INVALID
}
