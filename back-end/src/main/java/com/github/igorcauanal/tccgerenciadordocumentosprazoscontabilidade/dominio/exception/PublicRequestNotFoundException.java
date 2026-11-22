package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

/**
 * Token ausente, inválido ou associado a nenhuma solicitação. A mensagem nunca
 * revela o valor recebido.
 */
public class PublicRequestNotFoundException extends RuntimeException {

    public PublicRequestNotFoundException() {
        super("Link de solicitação inválido");
    }
}
