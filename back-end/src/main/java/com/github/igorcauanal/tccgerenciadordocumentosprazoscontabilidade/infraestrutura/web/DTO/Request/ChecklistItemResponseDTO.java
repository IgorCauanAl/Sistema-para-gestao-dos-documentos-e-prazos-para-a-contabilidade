package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Request.StatusCheckList;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ChecklistItemResponseDTO {

    private Long id;
    private String description;
    private String expectedFileFormat;
    private StatusCheckList status;
    private String uploadedFileName;
    private Long uploadedDocumentId;
    private LocalDateTime sentAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
}