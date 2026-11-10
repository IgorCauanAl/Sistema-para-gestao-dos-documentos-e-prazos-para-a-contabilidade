package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Document.DocumentRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DocumentEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Document.DocumentMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataDocumentoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class DocumentPersistenceAdapter implements DocumentRepositoryPort {

    private final SpringDataDocumentoRepository documentoRepository;

    @Override
    public Document save(Document document) {

        DocumentEntity entity = DocumentMapper.toEntity(document);
        DocumentEntity entityDocumentoSalva = documentoRepository.save(entity);
        return DocumentMapper.toDomain(entityDocumentoSalva);


    }

    @Override
    public Optional<Document> findById(Long id) {
        return documentoRepository.findById(id)
                .map(DocumentMapper::toDomain);
    }

    @Override
    public List<Document> listAll() {

        return documentoRepository.findAll()
                .stream()
                .map(DocumentMapper::toDomain)
                .toList();
    }
}
