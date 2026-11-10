package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusCheckList;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.ChecklistItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataChecklistItemRepository extends JpaRepository<ChecklistItemEntity, Long> {
    List<ChecklistItemEntity> findByRequestId(Long requestId);
    List<ChecklistItemEntity> findByStatus(StatusCheckList status);
}