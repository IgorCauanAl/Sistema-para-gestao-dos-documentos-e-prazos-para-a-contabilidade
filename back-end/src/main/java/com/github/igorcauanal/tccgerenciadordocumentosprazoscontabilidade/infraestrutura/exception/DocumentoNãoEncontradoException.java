package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.Exceções;

public class DocumentoNãoEncontradoException extends RuntimeException {
    public DocumentoNãoEncontradoException(Long documentoId) {
        super("Documento não encontrado: id= " + documentoId);
    }


}
