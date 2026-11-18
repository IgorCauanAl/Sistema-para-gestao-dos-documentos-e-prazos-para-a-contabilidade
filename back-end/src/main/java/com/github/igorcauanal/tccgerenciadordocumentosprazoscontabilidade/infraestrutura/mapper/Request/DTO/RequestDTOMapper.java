package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Request.DTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.ChecklistItemResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.RequestResponseDTO;

import java.util.List;

public final class RequestDTOMapper {

    private RequestDTOMapper() {}

    public static RequestResponseDTO toResponseDTO(Request request) {
        if (request == null) {
            return null;
        }

        RequestResponseDTO dto = new RequestResponseDTO();
        dto.setId(request.getId());
        dto.setCustomerId(request.getCustomerId());
        dto.setTitle(request.getTitle());
        dto.setCompetence(request.getCompetence());
        dto.setDeadline(request.getDeadline());
        dto.setStatus(request.getStatus());
        dto.setCreatedIn(request.getCreatedIn());
        dto.setCompletedIn(request.getCompletedIn());
        dto.setCancelledIn(request.getCancelledIn());
        dto.setProgress(request.calculateProgress());
        dto.setChecklist(request.getChecklist().stream()
                .map(RequestDTOMapper::toResponseDTO)
                .toList());
        return dto;
    }

    public static ChecklistItemResponseDTO toResponseDTO(ChecklistItem item) {
        if (item == null) {
            return null;
        }

        ChecklistItemResponseDTO dto = new ChecklistItemResponseDTO();
        dto.setId(item.getId());
        dto.setDescription(item.getDescription());
        dto.setExpectedFileFormat(item.getFormatFileExpected());
        dto.setStatus(item.getStatus());
        dto.setUploadedFileName(item.getNameFileSent());
        dto.setUploadedDocumentId(item.getUploadedDocumentId());
        dto.setSentAt(item.getSubmitedOn());
        dto.setReviewedAt(item.getRevisedOn());
        dto.setRejectionReason(item.getReasonRefusal());
        return dto;
    }

    public static List<RequestResponseDTO> toResponseDTOList(List<Request> requests) {
        if (requests == null) {
            return List.of();
        }
        return requests.stream()
                .map(RequestDTOMapper::toResponseDTO)
                .toList();
    }
}