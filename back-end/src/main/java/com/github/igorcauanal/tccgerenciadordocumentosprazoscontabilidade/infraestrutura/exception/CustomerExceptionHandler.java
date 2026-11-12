package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.exception;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.AlreadyRegisteredCustomerException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.CustomerNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CustomerExceptionHandler {

    @ExceptionHandler(CustomerNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(CustomerNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage()));
    }

    @ExceptionHandler(AlreadyRegisteredCustomerException.class)
    public ResponseEntity<ProblemDetail> handleConflict(AlreadyRegisteredCustomerException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage()));
    }
}