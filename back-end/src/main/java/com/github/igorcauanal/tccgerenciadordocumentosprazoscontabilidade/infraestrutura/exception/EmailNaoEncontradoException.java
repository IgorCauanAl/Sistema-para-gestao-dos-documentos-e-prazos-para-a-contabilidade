package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.Exceções;

public class EmailNaoEncontradoException extends RuntimeException {
    public EmailNaoEncontradoException(String email) {

        super("O email:  " + email + " não foi encontrado");
    }
}
