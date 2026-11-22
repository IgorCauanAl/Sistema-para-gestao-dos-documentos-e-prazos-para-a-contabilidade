package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

public class UnsupportedUploadFileException extends RuntimeException {

    public UnsupportedUploadFileException(String message) {
        super(message);
    }

    public UnsupportedUploadFileException() {
        super("Formato ou tipo MIME não permitido. Aceitos: PDF, OFX, XML, XLSX, CSV, TXT");
    }
}
