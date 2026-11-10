package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.ChecklistItemEntity;

public class ChecklistItemMapper {

    private ChecklistItemMapper() {}

    public static ChecklistItemEntity toEntity(ChecklistItem item) {
        if (item == null) {
            return null;
        }

        ChecklistItemEntity entity = new ChecklistItemEntity();
        entity.setId(item.getId());
        entity.setDescription(item.getDescription());
        entity.setExpectedFileFormat(item.getFormatFileExpected());
        entity.setStatus(item.getStatus());
        entity.setUploadedFileName(item.getNameFileSent());
        entity.setSentAt(item.getSubmitedOn());
        entity.setReviewedAt(item.getRevisedOn());
        entity.setRejectionReason(item.getReasonRefusal());

        return entity;
    }

    public static ChecklistItem toDomain(ChecklistItemEntity entity) {
        if (entity == null) {
            return null;
        }

        return ChecklistItem.rebuild(
                entity.getId(),
                entity.getDescription(),
                entity.getExpectedFileFormat(),
                entity.getStatus(),
                entity.getUploadedFileName(),
                entity.getSentAt(),
                entity.getReviewedAt(),
                entity.getRejectionReason()
        );
    }
}


