package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Document.DocumentServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Document.DocumentResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Document.DocumentUploadRequestDTO;
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


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponseDTO> uploadDocument(@ModelAttribute DocumentUploadRequestDTO request) {

        if (request.getFile() == null || request.getFile().isEmpty()) {
            throw new IllegalArgumentException("Arquivo é obrigatório");
        }
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Cliente é obrigatório");
        }

        InputStream fileStream;
        try {
            fileStream = request.getFile().getInputStream();
        } catch (IOException e) {
            throw new IllegalArgumentException(
                    "Falha ao ler o arquivo: " + request.getFile().getOriginalFilename(), e);
        }

        String originalFileName = request.getFile().getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException("O nome do arquivo não pode ser vazio ou nulo");
        }

        Document document = documentServicePort.saveDocument(
                fileStream,
                originalFileName,
                request.getCustomerId(),
                request.getDocumentType(),
                request.getCompetence(),
                request.getDueDate(),
                request.getSendChannel(),
                request.getDirection(),
                request.getFileFormat()
        );

        DocumentResponseDTO dto = DocumentDtoMapper.toResponseDTO(document);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}/file/view")
                .buildAndExpand(dto.getId())
                .toUri();

        return ResponseEntity.created(uri).body(dto);
    }


    @GetMapping
    public ResponseEntity<List<DocumentResponseDTO>> listDocuments(
            @RequestParam(name = "direction", required = false) DocumentDirection direction) {

        List<Document> documents = documentServicePort.listDocuments(direction);
        return ResponseEntity.ok(DocumentDtoMapper.toResponseDTOList(documents));
    }

    // ---------------------------------------------------------------------
    // GET /documents/{id}/file/view — abre inline, marca VIEWED
    // ---------------------------------------------------------------------
    @GetMapping("/{documentId}/file/view")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long documentId) {

        InputStream stream = documentServicePort.viewDocument(documentId);
        DocumentResponseDTO document = findMetadata(documentId);

        Resource resource = new InputStreamResource(stream);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        resolveContentType(document.getFileFormat())))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + document.getFileName() + "\"")
                .body(resource);
    }

    // ---------------------------------------------------------------------
    // GET /documents/{id}/file/download — força download, marca DOWNLOADED
    // ---------------------------------------------------------------------
    @GetMapping("/{documentId}/file/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {

        InputStream stream = documentServicePort.downloadDocument(documentId);
        DocumentResponseDTO document = findMetadata(documentId);

        Resource resource = new InputStreamResource(stream);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getFileName() + "\"")
                .body(resource);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------
    private DocumentResponseDTO findMetadata(Long documentId) {
        return documentServicePort.listDocuments(null).stream()
                .filter(d -> d.getId().equals(documentId))
                .map(DocumentDtoMapper::toResponseDTO)
                .findFirst()
                .orElseThrow(() -> new NotFoundDocumentException(documentId));
    }

    private String resolveContentType(...dominio.modelo.enums.FileFormat format) {
        return switch (format) {
            case PDF  -> "application/pdf";
            case XML  -> "application/xml";
            case CSV  -> "text/csv";
            case TXT  -> "text/plain";
            case XLSX -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case OFX  -> "application/x-ofx";
        };
    }
}