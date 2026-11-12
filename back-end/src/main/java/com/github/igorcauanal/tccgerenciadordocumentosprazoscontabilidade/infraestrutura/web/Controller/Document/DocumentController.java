package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.document.DocumentListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Document.DocumentServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query.DocumentQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Document.DTO.DocumentDTOMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Document.DocumentResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Document.DocumentUploadRequestDTO;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/documents")
@AllArgsConstructor
public class DocumentController {

    private final DocumentServicePort documentServicePort;
    private final DocumentQueryPort documentQueryPort;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponseDTO> uploadDocument(
            @Valid @ModelAttribute DocumentUploadRequestDTO request) {

        if (request.getFile() == null || request.getFile().isEmpty()) {
            throw new IllegalArgumentException("Arquivo é obrigatório");
        }

        InputStream fileStream;
        try {
            fileStream = request.getFile().getInputStream();
        } catch (IOException e) {
            throw new IllegalArgumentException(
                    "Falha ao ler o arquivo: " + request.getFile().getOriginalFilename(), e);
        }

        Document document = documentServicePort.saveDocument(
                fileStream,
                request.getFile().getOriginalFilename(),
                request.getCustomerId(),
                request.getDocumentType(),
                request.getCompetence(),
                request.getDueDate(),
                request.getSendChannel(),
                request.getDirection(),
                request.getFileFormat()
        );

        DocumentResponseDTO dto = DocumentDTOMapper.toResponseDTO(document);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}/file/view")
                .buildAndExpand(dto.getId())
                .toUri();

        return ResponseEntity.created(uri).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<DocumentListItemReadModel>> listDocuments(
            @RequestParam(name = "direction", required = false) DocumentDirection direction) {
        return ResponseEntity.ok(documentQueryPort.list(direction));
    }

    @GetMapping("/{documentId}/file/view")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long documentId) {
        DocumentServicePort.DocumentFile file = documentServicePort.viewDocument(documentId);
        return buildFileResponse(file, "inline");
    }

    @GetMapping("/{documentId}/file/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        DocumentServicePort.DocumentFile file = documentServicePort.downloadDocument(documentId);
        return buildFileResponse(file, "attachment");
    }

    //apresentação HTTP

    private ResponseEntity<Resource> buildFileResponse(DocumentServicePort.DocumentFile file, String disposition) {
        Document metadata = file.metadata();
        return ResponseEntity.ok()
                .contentType(resolveContentType(metadata.getFileFormat(), disposition))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition + "; filename=\"" + metadata.getFileName() + "\"")
                .body(new InputStreamResource(file.content()));
    }

    private MediaType resolveContentType(FileFormat format, String disposition) {
        if ("attachment".equals(disposition)) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        return MediaType.parseMediaType(switch (format) {
            case PDF  -> "application/pdf";
            case XML  -> "application/xml";
            case CSV  -> "text/csv";
            case TXT  -> "text/plain";
            case XLSX -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case OFX  -> "application/x-ofx";
        });
    }
}