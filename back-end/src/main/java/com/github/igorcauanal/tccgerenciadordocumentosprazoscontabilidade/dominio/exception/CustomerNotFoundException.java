package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception;

public class CustomerNotFoundException extends RuntimeException {
  public CustomerNotFoundException(String message) {
    super(message);
  }
}
