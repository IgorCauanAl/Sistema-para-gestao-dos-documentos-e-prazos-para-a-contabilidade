package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Deadline;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DeadlineEntity;

public final class DeadlineMapper {

    private DeadlineMapper() {}

    public static DeadlineEntity toEntity(Deadline deadline) {
        if (deadline == null) {
            return null;
        }

        return DeadlineEntity.reconstitute(
                deadline.getId(),
                deadline.getCustomerId(),
                deadline.getObligation(),
                deadline.getCategory(),
                deadline.getCompetence(),
                deadline.getDueDate(),
                deadline.getPriority(),
                deadline.getCreatedAt(),
                deadline.getCurrentStage(),
                deadline.getStatus(),
                deadline.getDeliveredOn(),
                null
        );
    }

    public static Deadline toDomain(DeadlineEntity entity) {
        if (entity == null) {
            return null;
        }

        return Deadline.reconstitute(
                entity.getId(),
                entity.getCustomerId(),
                entity.getObligation(),
                entity.getCategory(),
                entity.getCompetence(),
                entity.getDueDate(),
                entity.getPriority(),
                entity.getCreatedAt(),
                entity.getCurrentStage(),
                entity.getStatus(),
                entity.getDeliveredOn()
        );
    }
}