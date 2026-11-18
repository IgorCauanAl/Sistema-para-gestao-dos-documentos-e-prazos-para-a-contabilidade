package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;

/**
 * Porta de saída para tokens. O domínio não conhece a implementação (JWT,
 * biblioteca ou segredo), que fica na infraestrutura.
 */
public interface TokenServicePort {

    String generateToken(User user);

    /**
     * Valida o token e devolve o identificador do usuário (subject).
     * Retorna uma string vazia quando o token é inválido ou expirado.
     */
    String validateToken(String token);
}
