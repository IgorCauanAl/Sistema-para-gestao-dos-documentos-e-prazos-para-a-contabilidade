package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

public class PublicRequestItemNotFoundException extends RuntimeException {

    public PublicRequestItemNotFoundException() {
        super("Item da solicitação inválido");
    }
}
