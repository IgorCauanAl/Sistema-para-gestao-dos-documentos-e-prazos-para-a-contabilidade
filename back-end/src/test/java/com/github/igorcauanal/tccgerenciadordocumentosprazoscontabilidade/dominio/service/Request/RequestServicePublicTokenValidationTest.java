package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicTokenValidation;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.RequestStatus;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Customer.CustomerRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.DocumentRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.PublicDocumentStoragePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.StorageDeviceArchivePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.PublicTokenGeneratorPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Request.RequestRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util.PublicTokenHasher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RequestServicePublicTokenValidationTest {

    @Mock
    private RequestRepositoryPort requestRepositoryPort;

    @Mock
    private StorageDeviceArchivePort storageDeviceArchivePort;

    @Mock
    private DocumentRepositoryPort documentRepositoryPort;

    @Mock
    private PublicTokenGeneratorPort publicTokenGeneratorPort;

    @Mock
    private PublicDocumentStoragePort publicDocumentStoragePort;

    @Mock
    private CustomerRepositoryPort customerRepositoryPort;

    @Mock
    private DeadlineServicePort deadlineServicePort;

    @InjectMocks
    private RequestService requestService;

    @Test
    void shouldValidateTokenUsingOnlyItsHash() {
        String rawToken = "token-seguro";
        String hash = PublicTokenHasher.hash(rawToken);
        Request request = Request.rebuild(
                42L,
                1L,
                "Documentos de 09/2026",
                "09/2026",
                LocalDate.of(2026, 10, 15),
                null,
                null,
                LocalDateTime.of(2026, 9, 30, 10, 0),
                RequestStatus.ABERTA,
                List.of(),
                hash
        );
        when(requestRepositoryPort.findByPublicTokenHash(hash)).thenReturn(Optional.of(request));

        PublicTokenValidation result = requestService.validatePublicToken(rawToken);

        assertEquals(42L, result.requestId());
        assertEquals(RequestStatus.ABERTA, result.status());
        assertEquals(LocalDate.of(2026, 10, 15), result.deadline());
        verify(requestRepositoryPort).findByPublicTokenHash(hash);
        verify(requestRepositoryPort, never()).findById(42L);
    }

    @Test
    void shouldRejectUnknownToken() {
        String hash = PublicTokenHasher.hash("token-inexistente");
        when(requestRepositoryPort.findByPublicTokenHash(hash)).thenReturn(Optional.empty());

        assertThrows(
                PublicRequestNotFoundException.class,
                () -> requestService.validatePublicToken("token-inexistente")
        );
    }
}
