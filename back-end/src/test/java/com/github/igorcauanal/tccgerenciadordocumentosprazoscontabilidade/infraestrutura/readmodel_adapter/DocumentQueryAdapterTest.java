package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.readmodel_adapter;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.document.DocumentListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Document.SpringDataDocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentQueryAdapterTest {

    @Mock
    private SpringDataDocumentRepository repository;

    @InjectMocks
    private DocumentQueryAdapter adapter;

    @Test
    void listShouldUseAllReadModelsWhenDirectionIsNull() {
        when(repository.listAllReadModels()).thenReturn(List.of());

        assertEquals(List.of(), adapter.list(null));
        verify(repository).listAllReadModels();
    }

    @Test
    void listShouldFilterByDirectionWhenProvided() {
        DocumentListItemReadModel outgoing = new DocumentListItemReadModel(
                1L, 1L, "Guia FGTS", "09/2026", null, null,
                DocumentDirection.ENVIADO_AO_CLIENTE, null, null, "guia.pdf", null);
        when(repository.listReadModelsByDirection(DocumentDirection.ENVIADO_AO_CLIENTE))
                .thenReturn(List.of(outgoing));

        List<DocumentListItemReadModel> result = adapter.list(DocumentDirection.ENVIADO_AO_CLIENTE);

        assertEquals(1, result.size());
        assertEquals(DocumentDirection.ENVIADO_AO_CLIENTE, result.get(0).getDirection());
        verify(repository).listReadModelsByDirection(DocumentDirection.ENVIADO_AO_CLIENTE);
    }
}
