package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.PublicTokenGeneratorPort;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * 16 bytes (128 bits) de entropia, codificados em Base64 URL sem padding.
 * O token é entregue uma única vez na resposta de criação.
 */
public final class SecureRandomPublicTokenGenerator implements PublicTokenGeneratorPort {

    private static final int TOKEN_BYTES = 16;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    public String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
