package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() {
        super("Senha inválida");
    }
}
