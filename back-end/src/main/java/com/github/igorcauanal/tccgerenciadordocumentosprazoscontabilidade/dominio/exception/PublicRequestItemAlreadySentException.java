package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

public class PublicRequestItemAlreadySentException extends RuntimeException {

    public PublicRequestItemAlreadySentException() {
        super("Item já enviado; aguarde a conferência do escritório");
    }
}
