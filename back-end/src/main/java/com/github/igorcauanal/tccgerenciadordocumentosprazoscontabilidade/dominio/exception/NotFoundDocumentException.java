package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.exception;

public class NotFoundDocumentException extends RuntimeException {
    public NotFoundDocumentException(Long documentoId) {
        super("Documento não encontrado: id= " + documentoId);
    }


}
