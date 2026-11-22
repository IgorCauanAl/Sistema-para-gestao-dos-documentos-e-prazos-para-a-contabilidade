package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Deadline;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.CurrentStage;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.DeadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.SendChannel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Deadline.DeadlineRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeadlineServiceTest {

    private static final Clock CLOCK = Clock.fixed(
            Instant.parse("2026-11-22T12:00:00Z"), ZoneOffset.UTC
    );
    private static final LocalDate HOJE = LocalDate.of(2026, 11, 22);

    @Mock
    private DeadlineRepositoryPort repository;

    private DeadlineService service;

    @BeforeEach
    void setUp() {
        service = new DeadlineService(repository, CLOCK);
    }

    @Test
    void shouldIgnoreDocumentWithoutDueDate() {
        Document document = document("Guia FGTS", null);

        Optional<Deadline> result = service.createFromDocument(document);

        assertTrue(result.isEmpty());
        verify(repository, never()).save(any());
    }

    @Test
    void shouldCreateDeadlineFromDocument() {
        Document document = document("Guia FGTS", HOJE.plusDays(3));
        when(repository.listByCustomer(1L)).thenReturn(List.of());
        when(repository.save(any(Deadline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Deadline> result = service.createFromDocument(document);

        assertTrue(result.isPresent());
        Deadline deadline = result.get();
        assertEquals("FGTS", deadline.getObligation());
        assertEquals("Trabalhista", deadline.getCategory());
        assertEquals("09/2026", deadline.getCompetence());
        assertEquals(HOJE.plusDays(3), deadline.getDueDate());
        assertEquals(DeadlinePriority.MEDIA, deadline.getPriority());
        assertEquals(StatusDeadline.PENDENTE, deadline.getStatus());
        assertEquals(CurrentStage.RECEBIDO, deadline.getCurrentStage());
        verify(repository).save(any(Deadline.class));
    }

    @Test
    void shouldMapDasDocumentToFiscalObligation() {
        Document document = document("Guia DAS", HOJE.plusDays(10));
        when(repository.listByCustomer(1L)).thenReturn(List.of());
        when(repository.save(any(Deadline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Deadline deadline = service.createFromDocument(document).orElseThrow();

        assertEquals("DAS", deadline.getObligation());
        assertEquals("Fiscal", deadline.getCategory());
        assertEquals(DeadlinePriority.BAIXA, deadline.getPriority());
    }

    @Test
    void shouldMapFolhaAndDreDocuments() {
        when(repository.listByCustomer(1L)).thenReturn(List.of());
        when(repository.save(any(Deadline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Deadline folha = service.createFromDocument(document("Folha de pagamento", HOJE)).orElseThrow();
        Deadline dre = service.createFromDocument(document("DRE", HOJE.plusDays(30))).orElseThrow();

        assertEquals("Folha de pagamento", folha.getObligation());
        assertEquals("Trabalhista", folha.getCategory());
        assertEquals(DeadlinePriority.ALTA, folha.getPriority());
        assertEquals("DRE", dre.getObligation());
        assertEquals("Contábil", dre.getCategory());
    }

    @Test
    void shouldKeepUnknownDocumentTypeAndUseOutrosCategory() {
        Document document = document("Contrato social", HOJE.plusDays(5));
        when(repository.listByCustomer(1L)).thenReturn(List.of());
        when(repository.save(any(Deadline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Deadline deadline = service.createFromDocument(document).orElseThrow();

        assertEquals("Contrato social", deadline.getObligation());
        assertEquals("Outros", deadline.getCategory());
    }

    @Test
    void shouldNotDuplicateOpenDeadlineForSameObligationAndCompetence() {
        Document document = document("Guia FGTS", HOJE.plusDays(3));
        Deadline existing = Deadline.create(
                1L, "FGTS", "Trabalhista", "09/2026", HOJE, DeadlinePriority.ALTA, CurrentStage.RECEBIDO
        );
        when(repository.listByCustomer(1L)).thenReturn(List.of(existing));

        Optional<Deadline> result = service.createFromDocument(document);

        assertFalse(result.isPresent());
        verify(repository, never()).save(any());
    }

    @Test
    void shouldCreateNewDeadlineWhenExistingOneIsClosed() {
        Document document = document("Guia FGTS", HOJE.plusDays(3));
        Deadline existing = Deadline.create(
                1L, "FGTS", "Trabalhista", "09/2026", HOJE, DeadlinePriority.ALTA, CurrentStage.RECEBIDO
        );
        existing.cancel();
        when(repository.listByCustomer(1L)).thenReturn(List.of(existing));
        when(repository.save(any(Deadline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Deadline> result = service.createFromDocument(document);

        assertTrue(result.isPresent());
        verify(repository).save(any(Deadline.class));
    }

    @Test
    void shouldRejectNullDocument() {
        assertThrows(IllegalArgumentException.class, () -> service.createFromDocument(null));
    }

    private Document document(String type, LocalDate dueDate) {
        return Document.create(
                1L,
                type,
                "09/2026",
                dueDate,
                SendChannel.WHATSAPP,
                DocumentDirection.ENVIADO_AO_CLIENTE,
                FileFormat.PDF,
                "documento.pdf",
                "storage/documento.pdf"
        );
    }
}
