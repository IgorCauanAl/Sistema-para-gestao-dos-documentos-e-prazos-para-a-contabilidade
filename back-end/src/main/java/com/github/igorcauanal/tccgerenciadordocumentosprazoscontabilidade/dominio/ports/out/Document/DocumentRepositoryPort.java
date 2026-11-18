package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;

import java.util.List;
import java.util.Optional;


public interface DocumentRepositoryPort {

    Document save(Document document);

    Optional<Document> findById(Long id);

    List<Document> findAll();

    List<Document> findByDirection(DocumentDirection direction);

}
