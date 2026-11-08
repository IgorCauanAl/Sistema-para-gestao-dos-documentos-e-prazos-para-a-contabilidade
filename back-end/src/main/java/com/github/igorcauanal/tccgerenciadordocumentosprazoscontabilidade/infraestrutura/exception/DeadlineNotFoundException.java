package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.Exceções;

public class DeadlineNotFoundException extends RuntimeException {
    public DeadlineNotFoundException(Long prazoId) {
        super("O seguinte prazo:" + prazoId + " não foi encontrado");
    }
}
