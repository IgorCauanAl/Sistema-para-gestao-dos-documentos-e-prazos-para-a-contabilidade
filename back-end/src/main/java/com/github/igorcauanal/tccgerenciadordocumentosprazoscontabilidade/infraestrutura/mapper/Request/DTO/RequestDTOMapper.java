package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Request.DTO;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.ChecklistItemResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.PublicRequestResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.RequestResponseDTO;

import java.util.List;

public final class RequestDTOMapper {

    private RequestDTOMapper() {}

    public static RequestResponseDTO toResponseDTO(Request request) {
        return toResponseDTO(request, null);
    }

    /** Sobrecarga exclusiva da criação: o token cru aparece apenas aqui. */
    public static RequestResponseDTO toResponseDTO(Request request, String publicToken) {
        if (request == null) {
            return null;
        }

        RequestResponseDTO dto = new RequestResponseDTO();
        copyRequestFields(request, dto);
        dto.setPublicToken(publicToken);
        return dto;
    }

    public static PublicRequestResponseDTO toPublicResponseDTO(Request request, String customerName) {
        if (request == null) {
            return null;
        }

        PublicRequestResponseDTO dto = new PublicRequestResponseDTO();
        copyRequestFields(request, dto);
        dto.setCustomerName(customerName);
        return dto;
    }

    private static void copyRequestFields(Request request, RequestResponseDTO dto) {
        dto.setId(request.getId());
        dto.setCustomerId(request.getCustomerId());
        dto.setTitle(request.getTitle());
        dto.setCompetence(request.getCompetence());
        dto.setDeadline(request.getDeadline());
        dto.setStatus(request.getStatus());
        dto.setCreatedIn(request.getCreatedIn());
        dto.setCompletedIn(request.getCompletedIn());
        dto.setCancelledIn(request.getCancelledIn());
        dto.setAcceptedItems(request.acceptedItems());
        dto.setTotalItems(request.totalItems());
        dto.setProgress(request.calculateProgress());
        dto.setChecklist(request.getChecklist().stream()
                .map(RequestDTOMapper::toResponseDTO)
                .toList());
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
