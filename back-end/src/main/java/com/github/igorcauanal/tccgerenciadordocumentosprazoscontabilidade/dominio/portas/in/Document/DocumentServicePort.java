package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.DocumentDirection;
import java.util.List;
import java.util.Optional;

public interface DocumentRepositoryPort {

     Document save(Document document);

     Optional<Document> findById(Long id);

     List<Document> findAll();

     List<Document> findByDirection(DocumentDirection direction);
}
