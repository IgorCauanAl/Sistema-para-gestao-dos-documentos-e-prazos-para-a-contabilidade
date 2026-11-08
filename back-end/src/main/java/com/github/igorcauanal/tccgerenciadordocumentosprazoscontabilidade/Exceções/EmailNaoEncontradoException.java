package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.Exceções;

public class EmailNaoEncontrado extends RuntimeException {
    public EmailNaoEncontrado(String email) {

        super("O email:  " + email + " não foi encontrado");
    }
}
