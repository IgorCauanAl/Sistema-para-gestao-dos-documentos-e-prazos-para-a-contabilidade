package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request;

/**
 * Resultado da criação: o token cru existe apenas aqui e na resposta HTTP.
 */
public record CreatedRequest(Request request, String publicToken) {
}
