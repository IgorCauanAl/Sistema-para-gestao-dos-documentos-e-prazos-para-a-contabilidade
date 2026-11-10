package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.ChecklistItemEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.RequestEntity;
import java.util.List;

public final class RequestMapper {

    private RequestMapper() {}

    public static RequestEntity toEntity(Request request) {
        if (request == null) {
            return null;
        }

        RequestEntity entity = new RequestEntity();
        entity.setId(request.getId());
        entity.setCustomerId(request.getCustomerId());
        entity.setTitle(request.getTitle());
        entity.setCompetence(request.getCompetence());
        entity.setDeadline(request.getDeadline());
        entity.setStatus(request.getStatus());
        entity.setCreatedIn(request.getCreatedIn());
        entity.setCompletedIn(request.getCompletedIn());
        entity.setCancelledIn(request.getCancelledIn());

        // setar o back-reference (request)
        for (ChecklistItem item : request.getChecklist()) {
            ChecklistItemEntity itemEntity = ChecklistItemMapper.toEntity(item);
            entity.addChecklistItem(itemEntity);
        }

        return entity;
    }

    public static Request toDomain(RequestEntity entity) {
        if (entity == null) {
            return null;
        }

        List<ChecklistItem> items = entity.getChecklist() == null
                ? List.of()
                : entity.getChecklist().stream()
                .map(ChecklistItemMapper::toDomain)
                .toList();

        return Request.rebuild(
                entity.getId(),
                entity.getCustomerId(),
                entity.getTitle(),
                entity.getCompetence(),
                entity.getDeadline(),
                entity.getCancelledIn(),
                entity.getCompletedIn(),
                entity.getCreatedIn(),
                entity.getStatus(),
                items
        );
    }
}