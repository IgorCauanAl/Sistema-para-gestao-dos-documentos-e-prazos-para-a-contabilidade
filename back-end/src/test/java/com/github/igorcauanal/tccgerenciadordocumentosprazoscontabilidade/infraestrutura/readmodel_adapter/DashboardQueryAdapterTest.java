package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.readmodel_adapter;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardChartsReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Document.DocumentEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Document.SpringDataDocumentRepository;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataCustomerRepository;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataDeadlineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.YearMonth;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardQueryAdapterTest {

    @Mock
    private SpringDataCustomerRepository customerRepository;

    @Mock
    private SpringDataDocumentRepository documentRepository;

    @Mock
    private SpringDataDeadlineRepository deadlineRepository;

    @InjectMocks
    private DashboardQueryAdapter adapter;

    @Test
    void chartsShouldAggregateRealDocumentDataAndIgnoreInvalidCompetence() {
        String competence = YearMonth.now().toString();
        DocumentEntity sent = DocumentEntity.builder()
                .competence(competence)
                .documentType("NF-e")
                .direction(DocumentDirection.ENVIADO_AO_CLIENTE)
                .build();
        DocumentEntity received = DocumentEntity.builder()
                .competence(competence)
                .documentType("Folha")
                .direction(DocumentDirection.RECEBIDO_DO_CLIENTE)
                .build();
        DocumentEntity invalid = DocumentEntity.builder()
                .competence("competencia-invalida")
                .documentType("NF-e")
                .direction(DocumentDirection.RECEBIDO_DO_CLIENTE)
                .build();

        when(documentRepository.findAll()).thenReturn(List.of(sent, received, invalid));
        when(customerRepository.findAll()).thenReturn(List.of());
        when(deadlineRepository.findAll()).thenReturn(List.of());

        DashboardChartsReadModel charts = adapter.getCharts();

        assertEquals(6, charts.getDocumentFlow().size());
        assertEquals(1, charts.getDocumentFlow().get(5).getSent());
        assertEquals(1, charts.getDocumentFlow().get(5).getReceived());
        assertEquals(2, charts.getDocumentsByType().size());
        assertEquals("NF-e", charts.getDocumentsByType().get(0).getLabel());
        assertEquals(2, charts.getDocumentsByType().get(0).getValue());
        assertEquals(List.of(), charts.getClientsByPendingStatus());
        assertEquals(List.of(), charts.getObligationsByStatus());
    }
}
