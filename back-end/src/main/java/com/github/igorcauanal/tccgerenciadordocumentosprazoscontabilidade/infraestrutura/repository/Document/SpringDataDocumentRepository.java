package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.StatusDocument;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpringDataDocumentoRepository extends JpaRepository<DocumentEntity,Long> {

    Optional<DocumentEntity> findById(Long id);

    DocumentEntity save (DocumentEntity documento);

    List<DocumentEntity> findAll();

    List<DocumentEntity> findByClient (Long clienteId);

    List<DocumentEntity> findByDirectionStatus (DocumentDirection documentDirection, StatusDocument statusDocument);






}
