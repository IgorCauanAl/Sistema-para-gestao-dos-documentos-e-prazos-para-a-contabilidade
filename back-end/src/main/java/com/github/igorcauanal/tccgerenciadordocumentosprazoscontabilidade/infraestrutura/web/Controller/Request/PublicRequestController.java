package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidUploadRequestException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicRequestDetails;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicTokenValidation;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicUploadResult;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Request.RequestServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Request.DTO.RequestDTOMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.PublicRequestResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.PublicTokenValidationResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.PublicUploadResponseDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping("/public/requests")
@AllArgsConstructor
public class PublicRequestController {

    private final RequestServicePort requestServicePort;

    /** Endpoint de validação do link público: 200 com metadados mínimos ou 404 se o token não existir. */
    @GetMapping("/{token}/validate")
    public ResponseEntity<PublicTokenValidationResponseDTO> validateToken(@PathVariable String token) {
        PublicTokenValidation validation = requestServicePort.validatePublicToken(token);
        return ResponseEntity.ok(new PublicTokenValidationResponseDTO(
                true,
                validation.requestId(),
                validation.status(),
                validation.deadline()
        ));
    }

    @GetMapping("/{token}")
    public ResponseEntity<PublicRequestResponseDTO> findByToken(@PathVariable String token) {
        PublicRequestDetails details = requestServicePort.findByPublicToken(token);
        return ResponseEntity.ok(RequestDTOMapper.toPublicResponseDTO(
                details.request(), details.customerName()));
    }

    @PostMapping(
            path = "/{token}/items/{itemId}/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<PublicUploadResponseDTO> uploadItemFile(
            @PathVariable String token,
            @PathVariable Long itemId,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new InvalidUploadRequestException("Arquivo é obrigatório");
        }

        try (InputStream content = file.getInputStream()) {
            PublicUploadResult result = requestServicePort.uploadPublicDocument(
                    token,
                    itemId,
                    content,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize()
            );

            return ResponseEntity.ok(new PublicUploadResponseDTO(
                    result.protocol(),
                    RequestDTOMapper.toResponseDTO(result.request()),
                    result.documentId()
            ));
        } catch (IOException exception) {
            throw new InvalidUploadRequestException("Falha ao ler o arquivo enviado");
        }
    }
}
