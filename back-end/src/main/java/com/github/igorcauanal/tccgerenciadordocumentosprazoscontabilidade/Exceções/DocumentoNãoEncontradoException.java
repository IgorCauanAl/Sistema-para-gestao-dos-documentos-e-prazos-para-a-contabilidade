package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.Exceções;

public class DocumentoNãoEncontradoException extends RuntimeException {
  public DocumentoNãoEncontradoException(String message) {
    super(message);
  }
}
