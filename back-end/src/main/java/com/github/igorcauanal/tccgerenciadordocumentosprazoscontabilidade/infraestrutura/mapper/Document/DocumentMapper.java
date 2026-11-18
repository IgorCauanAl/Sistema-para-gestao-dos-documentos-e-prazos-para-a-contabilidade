package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Document.DocumentEntity;

public final class DocumentMapper {

    private DocumentMapper() {}


    public static DocumentEntity toEntity(Document document) {
        if (document == null) {
            return null;
        }

        DocumentEntity entity = new DocumentEntity();
        entity.setId(document.getId());
        entity.setCustomerId(document.getCustomerId());
        entity.setDocumentType(document.getDocumentType());
        entity.setCompetence(document.getCompetence());
        entity.setDueDate(document.getDueDate());
        entity.setDirection(document.getDirection());
        entity.setSendChannel(document.getSendChannel());
        entity.setStatus(document.getStatus());
        entity.setFileFormat(document.getFileFormat());
        entity.setFileName(document.getFileName());
        entity.setStoragePath(document.getStoragePath());
        entity.setCreatedIn(document.getCreatedIn());
        return entity;
    }


    public static Document toDomain(DocumentEntity entity) {
        if (entity == null) {
            return null;
        }

        return Document.rebuild(
                entity.getId(),
                entity.getCustomerId(),
                entity.getDocumentType(),
                entity.getCompetence(),
                entity.getDueDate(),
                entity.getDirection(),
                entity.getSendChannel(),
                entity.getStatus(),
                entity.getFileFormat(),
                entity.getFileName(),
                entity.getStoragePath(),
                entity.getCreatedIn()
        );
    }
}