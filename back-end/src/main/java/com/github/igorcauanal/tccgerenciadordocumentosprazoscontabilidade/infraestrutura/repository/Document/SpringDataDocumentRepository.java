package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.StatusDocument;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.document.DocumentListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Document.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataDocumentRepository extends JpaRepository<DocumentEntity, Long> {

    List<DocumentEntity> findByDirection(DocumentDirection direction);
    List<DocumentEntity> findByCustomerId(Long customerId);
    List<DocumentEntity> findByDirectionAndStatus(DocumentDirection direction, StatusDocument status);

    @Query("SELECT COUNT(d) FROM DocumentEntity d WHERE d.direction = :direction AND d.status IN :statuses")
    long countByDirectionAndStatusIn(@Param("direction") DocumentDirection direction,
                                     @Param("statuses") List<StatusDocument> statuses);

    @Query("SELECT new com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.document.DocumentListItemReadModel(" +
            "d.id, d.customerId, d.documentType, d.competence, d.dueDate, d.sendChannel, d.direction, d.status, d.fileFormat, d.fileName, d.createdIn) " +
            "FROM DocumentEntity d ORDER BY d.createdIn DESC")
    List<DocumentListItemReadModel> listAllReadModels();

    @Query("SELECT new com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.document.DocumentListItemReadModel(" +
            "d.id, d.customerId, d.documentType, d.competence, d.dueDate, d.sendChannel, d.direction, d.status, d.fileFormat, d.fileName, d.createdIn) " +
            "FROM DocumentEntity d WHERE d.direction = :direction ORDER BY d.createdIn DESC")
    List<DocumentListItemReadModel> listReadModelsByDirection(@Param("direction") DocumentDirection direction);
}