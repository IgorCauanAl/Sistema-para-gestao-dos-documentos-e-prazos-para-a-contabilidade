package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.Exceções;

public class ClienteJaCadastradoException extends RuntimeException {

    public ClienteJaCadastradoException(String cnpj) {
        super("Já existe um cliente cadastrado com este CNPJ: " + cnpj);
    }


}
