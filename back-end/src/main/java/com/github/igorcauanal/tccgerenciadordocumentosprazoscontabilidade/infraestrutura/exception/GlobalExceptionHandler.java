package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.exception;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.AlreadyRegisteredCustomerException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.BusinessException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.CustomerNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.DeadlineNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.EmailNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidPasswordException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidUploadRequestException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.NotFoundDocumentException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestItemAlreadySentException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestItemNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.RequestNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UnsupportedUploadFileException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UploadFileTooLargeException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Error.ApiErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Ponto único de tradução de exceções para o contrato {@link ApiErrorResponseDTO}.
 * Substitui os advices específicos por um handler global, mantendo um JSON
 * previsível para o ErrorHandler global do Angular.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final String CODE_NOT_FOUND = "RESOURCE_NOT_FOUND";
    private static final String CODE_CONFLICT = "CONFLICT";
    private static final String CODE_VALIDATION = "VALIDATION_ERROR";
    private static final String CODE_BAD_REQUEST = "BAD_REQUEST";
    private static final String CODE_UNAUTHORIZED = "UNAUTHORIZED";
    private static final String CODE_ACCESS_DENIED = "ACCESS_DENIED";
    private static final String CODE_FILE_TOO_LARGE = "FILE_TOO_LARGE";
    private static final String CODE_UNSUPPORTED_MEDIA_TYPE = "UNSUPPORTED_MEDIA_TYPE";
    private static final String CODE_METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED";
    private static final String CODE_INTERNAL_ERROR = "INTERNAL_SERVER_ERROR";

    private static final String MENSAGEM_GENERICA =
            "Não foi possível concluir a operação. Tente novamente em instantes.";

    private final Clock clock;

    public GlobalExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    @ExceptionHandler({
            CustomerNotFoundException.class,
            DeadlineNotFoundException.class,
            NotFoundDocumentException.class,
            RequestNotFoundException.class,
            EmailNotFoundException.class,
            PublicRequestNotFoundException.class,
            PublicRequestItemNotFoundException.class
    })
    public ResponseEntity<ApiErrorResponseDTO> handleNotFound(RuntimeException ex, HttpServletRequest request) {
        return resposta(HttpStatus.NOT_FOUND, CODE_NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler({AlreadyRegisteredCustomerException.class, PublicRequestItemAlreadySentException.class})
    public ResponseEntity<ApiErrorResponseDTO> handleConflict(RuntimeException ex, HttpServletRequest request) {
        return resposta(HttpStatus.CONFLICT, CODE_CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler({BusinessException.class, IllegalArgumentException.class, InvalidUploadRequestException.class})
    public ResponseEntity<ApiErrorResponseDTO> handleBadRequest(RuntimeException ex, HttpServletRequest request) {
        return resposta(HttpStatus.BAD_REQUEST, CODE_BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleInvalidPassword(InvalidPasswordException ex, HttpServletRequest request) {
        return resposta(HttpStatus.UNAUTHORIZED, CODE_UNAUTHORIZED, "Senha inválida", request);
    }

    @ExceptionHandler({UploadFileTooLargeException.class, MaxUploadSizeExceededException.class})
    public ResponseEntity<ApiErrorResponseDTO> handleFileTooLarge(Exception ex, HttpServletRequest request) {
        return resposta(
                HttpStatus.PAYLOAD_TOO_LARGE,
                CODE_FILE_TOO_LARGE,
                "Arquivo excede o tamanho máximo de 25 MB",
                request
        );
    }

    @ExceptionHandler(UnsupportedUploadFileException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleUnsupportedFile(UnsupportedUploadFileException ex, HttpServletRequest request) {
        return resposta(HttpStatus.UNSUPPORTED_MEDIA_TYPE, CODE_UNSUPPORTED_MEDIA_TYPE, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(error.getField(), mensagemSegura(error))
        );

        return resposta(
                HttpStatus.BAD_REQUEST,
                CODE_VALIDATION,
                "Dados inválidos. Confira os campos destacados.",
                request,
                fieldErrors
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String campo = violation.getPropertyPath() == null
                    ? "valor"
                    : violation.getPropertyPath().toString();
            fieldErrors.putIfAbsent(campo, violation.getMessage());
        }

        String mensagem = fieldErrors.isEmpty() ? "Dados inválidos." : "Dados inválidos. Confira os campos destacados.";
        return resposta(HttpStatus.BAD_REQUEST, CODE_VALIDATION, mensagem, request, fieldErrors);
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class
    })
    public ResponseEntity<ApiErrorResponseDTO> handleBadRequestBody(Exception ex, HttpServletRequest request) {
        return resposta(
                HttpStatus.BAD_REQUEST,
                CODE_BAD_REQUEST,
                "Corpo ou parâmetros da requisição inválidos.",
                request
        );
    }

    /**
     * Importante: trata ResponseStatusException antes do catch-all para que o
     * 401/403 do login não seja convertido em 500 (bug do advice antigo).
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleResponseStatus(ResponseStatusException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String code = switch (status) {
            case UNAUTHORIZED -> CODE_UNAUTHORIZED;
            case FORBIDDEN -> CODE_ACCESS_DENIED;
            case NOT_FOUND -> CODE_NOT_FOUND;
            case CONFLICT -> CODE_CONFLICT;
            case BAD_REQUEST -> CODE_BAD_REQUEST;
            default -> "HTTP_" + status.value();
        };

        String mensagem = ex.getReason() == null || ex.getReason().isBlank()
                ? status.getReasonPhrase()
                : ex.getReason();

        return resposta(status, code, mensagem, request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        return resposta(HttpStatus.METHOD_NOT_ALLOWED, CODE_METHOD_NOT_ALLOWED, "Método não permitido para este recurso.", request);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        return resposta(HttpStatus.UNSUPPORTED_MEDIA_TYPE, CODE_UNSUPPORTED_MEDIA_TYPE, "Formato de arquivo não aceito.", request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponseDTO> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return resposta(
                HttpStatus.FORBIDDEN,
                CODE_ACCESS_DENIED,
                "Você não tem permissão para realizar esta ação.",
                request
        );
    }

    /** Nunca expõe mensagem ou stack trace de exceções inesperadas. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponseDTO> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Erro não tratado em {} {}", request.getMethod(), request.getRequestURI(), ex);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, CODE_INTERNAL_ERROR, MENSAGEM_GENERICA, request);
    }

    private ResponseEntity<ApiErrorResponseDTO> resposta(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request
    ) {
        return resposta(status, code, message, request, Map.of());
    }

    private ResponseEntity<ApiErrorResponseDTO> resposta(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors
    ) {
        Instant timestamp = clock.instant();
        ApiErrorResponseDTO body = ApiErrorResponseDTO.of(
                status,
                code,
                message == null || message.isBlank() ? status.getReasonPhrase() : message,
                request.getRequestURI(),
                fieldErrors,
                timestamp
        );
        return ResponseEntity.status(status).body(body);
    }

    private static String mensagemSegura(org.springframework.validation.FieldError error) {
        String message = error.getDefaultMessage();
        return message == null || message.isBlank() ? "Valor inválido" : message;
    }
}
