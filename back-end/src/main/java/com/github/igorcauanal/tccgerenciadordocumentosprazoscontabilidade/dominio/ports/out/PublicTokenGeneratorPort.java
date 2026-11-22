package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out;

/**
 * Gerador de tokens de acesso público. O token retornado é CRU e deve seguir
 * apenas para a resposta de criação; nunca deve ser persistido.
 */
public interface PublicTokenGeneratorPort {

    String generateToken();
}
