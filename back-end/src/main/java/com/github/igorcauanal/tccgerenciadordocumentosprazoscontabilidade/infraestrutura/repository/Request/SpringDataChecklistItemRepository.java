package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Request.StatusCheckList;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Request.ChecklistItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataChecklistItemRepository extends JpaRepository<ChecklistItemEntity, Long> {
    List<ChecklistItemEntity> findByRequestId(Long requestId);
    List<ChecklistItemEntity> findByStatus(StatusCheckList status);
}