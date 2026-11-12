package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Request.ChecklistItemEntity;

public final class ChecklistItemMapper {

    private ChecklistItemMapper() {}

    public static ChecklistItemEntity toEntity(ChecklistItem item) {
        if (item == null) {
            return null;
        }

        ChecklistItemEntity entity = new ChecklistItemEntity();
        entity.setId(item.getId());
        entity.setDescription(item.getDescription());
        entity.setFormatFileExpected(item.getFormatFileExpected());
        entity.setStatus(item.getStatus());
        entity.setNameFileSent(item.getNameFileSent());
        entity.setUploadedDocumentId(item.getUploadedDocumentId());
        entity.setSubmitedOn(item.getSubmitedOn());
        entity.setRevisedOn(item.getRevisedOn());
        entity.setReasonRefusal(item.getReasonRefusal());
        return entity;
    }

    public static ChecklistItem toDomain(ChecklistItemEntity entity) {
        if (entity == null) {
            return null;
        }

        return ChecklistItem.rebuild(
                entity.getId(),
                entity.getDescription(),
                entity.getFormatFileExpected(),
                entity.getStatus(),
                entity.getNameFileSent(),
                entity.getUploadedDocumentId(),
                entity.getSubmitedOn(),
                entity.getRevisedOn(),
                entity.getReasonRefusal()
        );
    }
}