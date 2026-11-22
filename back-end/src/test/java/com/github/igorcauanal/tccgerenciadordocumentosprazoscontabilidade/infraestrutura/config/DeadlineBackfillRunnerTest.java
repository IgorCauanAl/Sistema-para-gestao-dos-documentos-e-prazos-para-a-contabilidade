package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.config;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.CurrentStage;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.DeadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.SendChannel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.DocumentRepositoryPort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeadlineBackfillRunnerTest {

    @Mock
    private DocumentRepositoryPort documentRepositoryPort;

    @Mock
    private DeadlineServicePort deadlineServicePort;

    @Test
    void shouldCreateOnlyForDocumentsWithDueDate() {
        Document withDueDate = document(LocalDate.of(2026, 12, 1));
        Document withoutDueDate = document(null);
        Deadline created = Deadline.create(
                1L, "FGTS", "Trabalhista", "09/2026", LocalDate.of(2026, 12, 1),
                DeadlinePriority.BAIXA, CurrentStage.RECEBIDO
        );

        when(documentRepositoryPort.findAll()).thenReturn(List.of(withDueDate, withoutDueDate));
        when(deadlineServicePort.createFromDocument(withDueDate)).thenReturn(Optional.of(created));

        new DeadlineBackfillRunner(documentRepositoryPort, deadlineServicePort)
                .run(mock(ApplicationArguments.class));

        verify(deadlineServicePort).createFromDocument(withDueDate);
        verify(deadlineServicePort, never()).createFromDocument(withoutDueDate);
    }

    @Test
    void shouldContinueWhenOneDocumentFails() {
        Document first = document(LocalDate.of(2026, 12, 1));
        Document second = document(LocalDate.of(2026, 12, 2));

        when(documentRepositoryPort.findAll()).thenReturn(List.of(first, second));
        when(deadlineServicePort.createFromDocument(first)).thenThrow(new RuntimeException("erro"));
        when(deadlineServicePort.createFromDocument(second)).thenReturn(Optional.empty());

        new DeadlineBackfillRunner(documentRepositoryPort, deadlineServicePort)
                .run(mock(ApplicationArguments.class));

        verify(deadlineServicePort).createFromDocument(first);
        verify(deadlineServicePort).createFromDocument(second);
    }

    private Document document(LocalDate dueDate) {
        return Document.create(
                1L,
                "Guia FGTS",
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
