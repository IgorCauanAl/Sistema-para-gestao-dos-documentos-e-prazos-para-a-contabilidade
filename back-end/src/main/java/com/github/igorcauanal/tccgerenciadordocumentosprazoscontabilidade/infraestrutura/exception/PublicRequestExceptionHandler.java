package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.exception;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidUploadRequestException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestItemAlreadySentException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestItemNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UnsupportedUploadFileException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UploadFileTooLargeException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * Prioritário sobre o advice genérico de clientes, que possui um Handler para
 * RuntimeException e, sem esta ordem, transformaria os erros públicos em 500.
 */
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PublicRequestExceptionHandler {

    @ExceptionHandler(PublicRequestNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleInvalidToken(PublicRequestNotFoundException exception) {
        return problem(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(PublicRequestItemNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleInvalidItem(PublicRequestItemNotFoundException exception) {
        return problem(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(PublicRequestItemAlreadySentException.class)
    public ResponseEntity<ProblemDetail> handleAlreadySent(PublicRequestItemAlreadySentException exception) {
        return problem(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(UploadFileTooLargeException.class)
    public ResponseEntity<ProblemDetail> handleTooLarge(UploadFileTooLargeException exception) {
        return problem(HttpStatus.PAYLOAD_TOO_LARGE, exception.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ProblemDetail> handleMultipartTooLarge(MaxUploadSizeExceededException exception) {
        return problem(HttpStatus.PAYLOAD_TOO_LARGE, "Arquivo excede o tamanho máximo de 25 MB");
    }

    @ExceptionHandler(UnsupportedUploadFileException.class)
    public ResponseEntity<ProblemDetail> handleUnsupportedType(UnsupportedUploadFileException exception) {
        return problem(HttpStatus.UNSUPPORTED_MEDIA_TYPE, exception.getMessage());
    }

    @ExceptionHandler(InvalidUploadRequestException.class)
    public ResponseEntity<ProblemDetail> handleInvalidRequest(InvalidUploadRequestException exception) {
        return problem(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    private static ResponseEntity<ProblemDetail> problem(HttpStatus status, String detail) {
        return ResponseEntity.status(status)
                .body(ProblemDetail.forStatusAndDetail(status, detail));
    }
}
