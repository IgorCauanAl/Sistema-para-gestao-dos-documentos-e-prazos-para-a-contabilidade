package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.TokenValidation;
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

    /**
     * Valida o token detalhando o motivo de uma eventual rejeição
     * (expirado ou inválido), para que a camada web responda adequadamente.
     */
    default TokenValidation validate(String token) {
        String subject = validateToken(token);

        if (subject == null || subject.isBlank()) {
            return TokenValidation.invalid();
        }

        return TokenValidation.valid(subject);
    }
}
