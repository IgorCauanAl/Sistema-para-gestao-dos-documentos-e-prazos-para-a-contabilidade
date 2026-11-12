package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

public class AlreadyRegisteredCustomerException extends RuntimeException {

    public AlreadyRegisteredCustomerException(String cnpj) {
        super("Já existe um cliente cadastrado com este CNPJ: " + cnpj);
    }


}
