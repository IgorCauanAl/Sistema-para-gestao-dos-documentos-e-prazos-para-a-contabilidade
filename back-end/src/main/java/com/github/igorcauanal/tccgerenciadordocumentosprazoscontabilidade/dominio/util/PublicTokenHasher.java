package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Converte o token cru em hash SHA-256 (64 caracteres hexadecimais minúsculos).
 * Nenhum dado sensível é registrado em log.
 */
public final class PublicTokenHasher {

    public static final int HASH_LENGTH = 64;

    private PublicTokenHasher() {
    }

    public static String hash(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token público é obrigatório");
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Algoritmo SHA-256 indisponível", exception);
        }
    }
}
