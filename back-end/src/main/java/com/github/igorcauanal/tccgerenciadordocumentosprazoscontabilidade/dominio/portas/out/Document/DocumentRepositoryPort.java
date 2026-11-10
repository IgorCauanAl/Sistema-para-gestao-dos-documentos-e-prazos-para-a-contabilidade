package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;

import java.util.List;
import java.util.Optional;


public interface DocumentRepositoryPort {

    Document save(Document document);

    Optional<Document> findById(Long id);

    List<Document> listAll();

}
