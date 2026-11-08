package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.Exceções;

public class SenhaInvalidaException extends RuntimeException {
    public SenhaInvalidaException() {
        super("Senha inválida");
    }
}
