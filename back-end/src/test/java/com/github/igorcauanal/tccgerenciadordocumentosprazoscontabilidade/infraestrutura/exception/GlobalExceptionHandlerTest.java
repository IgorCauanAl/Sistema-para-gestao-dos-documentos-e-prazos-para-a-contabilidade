package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.exception;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.AlreadyRegisteredCustomerException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.CustomerNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidPasswordException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UnsupportedUploadFileException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Error.ApiErrorResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private static final Instant AGORA = Instant.parse("2026-11-23T12:34:56Z");

    private GlobalExceptionHandler handler;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler(Clock.fixed(AGORA, ZoneOffset.UTC));
        request = new MockHttpServletRequest("POST", "/customers");
    }

    @Test
    void shouldMapDomainNotFoundToStandardBody() {
        ResponseEntity<ApiErrorResponseDTO> response =
                handler.handleNotFound(new CustomerNotFoundException(42L), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        ApiErrorResponseDTO body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.status()).isEqualTo(404);
        assertThat(body.code()).isEqualTo("RESOURCE_NOT_FOUND");
        assertThat(body.message()).contains("42");
        assertThat(body.path()).isEqualTo("/customers");
        assertThat(body.timestamp()).isEqualTo(AGORA);
        assertThat(body.fieldErrors()).isEmpty();
    }

    @Test
    void shouldMapConflictToStandardBody() {
        ResponseEntity<ApiErrorResponseDTO> response =
                handler.handleConflict(new AlreadyRegisteredCustomerException("86.489.351/0001-23"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("CONFLICT");
        assertThat(response.getBody().message()).contains("86.489.351/0001-23");
    }

    @Test
    void shouldIncludeFieldErrorsOnValidation() throws Exception {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(new FieldError("request", "email", "E-mail é obrigatório"));
        MethodParameter parameter = new MethodParameter(
                DummyController.class.getDeclaredMethod("dummy", String.class), 0
        );
        MethodArgumentNotValidException exception =
                new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<ApiErrorResponseDTO> response = handler.handleValidation(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getBody().fieldErrors())
                .containsEntry("email", "E-mail é obrigatório");
    }

    @Test
    void shouldPreserveUnauthorizedFromLogin() {
        ResponseStatusException exception =
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos");

        ResponseEntity<ApiErrorResponseDTO> response = handler.handleResponseStatus(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("UNAUTHORIZED");
        assertThat(response.getBody().message()).isEqualTo("E-mail ou senha incorretos");
    }

    @Test
    void shouldPreserveForbiddenFromLogin() {
        ResponseStatusException exception =
                new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito ao contador");

        ResponseEntity<ApiErrorResponseDTO> response = handler.handleResponseStatus(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("ACCESS_DENIED");
        assertThat(response.getBody().message()).isEqualTo("Acesso restrito ao contador");
    }

    @Test
    void shouldMapInvalidPasswordToUnauthorized() {
        ResponseEntity<ApiErrorResponseDTO> response =
                handler.handleInvalidPassword(new InvalidPasswordException(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Senha inválida");
    }

    @Test
    void shouldMapUnsupportedFileTo415() {
        ResponseEntity<ApiErrorResponseDTO> response =
                handler.handleUnsupportedFile(new UnsupportedUploadFileException("pdf"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("UNSUPPORTED_MEDIA_TYPE");
    }

    @Test
    void shouldNotLeakInternalMessageOnUnexpectedError() {
        ResponseEntity<ApiErrorResponseDTO> response =
                handler.handleUnexpected(new IllegalStateException("database unavailable"), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).doesNotContain("database unavailable");
        assertThat(response.getBody().code()).isEqualTo("INTERNAL_SERVER_ERROR");
    }

    private static class DummyController {
        void dummy(String value) {
        }
    }
}
