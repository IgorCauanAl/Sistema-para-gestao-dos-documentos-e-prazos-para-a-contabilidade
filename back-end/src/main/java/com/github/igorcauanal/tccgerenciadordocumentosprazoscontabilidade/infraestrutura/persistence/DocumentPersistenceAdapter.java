package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.DocumentoRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DocumentoEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.DocumentoMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataDocumentoRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class DocumentoPersistenceAdapter implements DocumentoRepositoryPort {

    private final SpringDataDocumentoRepository documentoRepository;

    @Override
    public Document save(Document document) {

        DocumentoEntity entity = DocumentoMapper.toEntity(document);
        DocumentoEntity entityDocumentoSalva = documentoRepository.save(entity);
        return DocumentoMapper.toDomain(entityDocumentoSalva);


    }

    @Override
    public Optional<Document> findById(Long id) {
        return documentoRepository.findById(id)
                .map(DocumentoMapper::toDomain);
    }

    @Override
    public List<Document> listAll() {

        return documentoRepository.findAll()
                .stream()
                .map(DocumentoMapper::toDomain)
                .toList();
    }
}
