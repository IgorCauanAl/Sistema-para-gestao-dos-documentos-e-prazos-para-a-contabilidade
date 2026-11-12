package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Document.DTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Document.DocumentResponseDTO;
import java.util.List;

public class DocumentDTOMapper {

    private DocumentDtoMapper() {}

    public static DocumentResponseDTO toResponseDTO(Document document) {
        if (document == null) {
            return null;
        }

        DocumentResponseDTO dto = new DocumentResponseDTO();
        dto.setId(document.getId());
        dto.setCustomerId(document.getCustomerId());
        dto.setDocumentType(document.getDocumentType());
        dto.setCompetence(document.getCompetence());
        dto.setDueDate(document.getDueDate());
        dto.setSendChannel(document.getSendChannel());
        dto.setDirection(document.getDirection());
        dto.setStatus(document.getStatus());
        dto.setFileFormat(document.getFileFormat());
        dto.setFileName(document.getFileName());
        dto.setStoragePath(document.getStoragePath());
        dto.setCreatedIn(document.getCreatedIn());
        return dto;
    }

    public static List<DocumentResponseDTO> toResponseDTOList(List<Document> documents) {
        if (documents == null) {
            return List.of();
        }
        return documents.stream()
                .map(DocumentDTOMapper::toResponseDTO)
                .toList();
    }
}


}
