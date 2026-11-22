package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

public class UploadFileTooLargeException extends RuntimeException {

    public UploadFileTooLargeException() {
        super("Arquivo excede o tamanho máximo de 25 MB");
    }
}
