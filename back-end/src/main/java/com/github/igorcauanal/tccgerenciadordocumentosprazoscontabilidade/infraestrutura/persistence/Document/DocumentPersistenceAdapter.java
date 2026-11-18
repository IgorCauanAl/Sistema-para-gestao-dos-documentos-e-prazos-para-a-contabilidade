package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.DocumentRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Document.DocumentEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Document.DocumentMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Document.SpringDataDocumentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class DocumentPersistenceAdapter implements DocumentRepositoryPort {

    private final SpringDataDocumentRepository documentRepository;

    @Override
    @Transactional
    public Document save(Document document) {
        DocumentEntity entity = DocumentMapper.toEntity(document);
        DocumentEntity saved = documentRepository.save(entity);
        return DocumentMapper.toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Document> findById(Long id) {
        return documentRepository.findById(id)
                .map(DocumentMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Document> findAll() {
        return documentRepository.findAll()
                .stream()
                .map(DocumentMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Document> findByDirection(DocumentDirection direction) {
        return documentRepository.findByDirection(direction)
                .stream()
                .map(DocumentMapper::toDomain)
                .toList();
    }
}