package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

public class EmailNotFoundException extends RuntimeException {
    public EmailNotFoundException(String email) {

        super("O email:  " + email + " não foi encontrado");
    }
}
