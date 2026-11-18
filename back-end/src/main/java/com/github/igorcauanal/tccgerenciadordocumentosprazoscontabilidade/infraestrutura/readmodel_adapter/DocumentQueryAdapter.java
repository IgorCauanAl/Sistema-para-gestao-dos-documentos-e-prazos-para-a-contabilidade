package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.readmodel_adapter;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.document.DocumentListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DocumentQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Document.SpringDataDocumentRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DocumentQueryAdapter implements DocumentQueryPort {

    private final SpringDataDocumentRepository repository;

    public DocumentQueryAdapter(SpringDataDocumentRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<DocumentListItemReadModel> list(DocumentDirection direction) {
        if (direction == null) {
            return repository.listAllReadModels();
        }
        return repository.listReadModelsByDirection(direction);
    }
}
