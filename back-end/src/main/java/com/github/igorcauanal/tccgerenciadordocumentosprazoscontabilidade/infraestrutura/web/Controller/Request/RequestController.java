package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request.RequestListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request.RequestReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Request.RequestServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.RequestQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Request.DTO.RequestDTOMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request.*;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.RequestNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/requests")
@AllArgsConstructor
public class RequestController {

    private final RequestServicePort requestServicePort;
    private final RequestQueryPort requestQueryPort;

    // cria a solicitação e monta o checklist
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RequestResponseDTO> createRequest(@RequestBody CreateRequestDTO dto) {

        // Monta o agregado via fábrica do domíniotfffffff
        Request request = Request.create(
                dto.getCustomerId(),
                dto.getTitle(),
                dto.getCompetence(),
                dto.getDeadline(),
                LocalDateTime.now()
        );

        // Adiciona os itens do checklist (somente enquanto OPEN)
        if (dto.getChecklist() != null) {
            for (ChecklistItemRequestDTO itemDto : dto.getChecklist()) {
                request.addChecklistItem(itemDto.getDescription(), itemDto.getExpectedFileFormat());
            }
        }

        Request saved = requestServicePort.createRequest(request);
        RequestResponseDTO response = RequestDTOMapper.toResponseDTO(saved);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }


    @GetMapping("/{requestId}")
    public ResponseEntity<RequestReadModel> findById(@PathVariable Long requestId) {
        RequestReadModel request = requestQueryPort.findById(requestId)
                .orElseThrow(() -> new RequestNotFoundException(requestId));
        return ResponseEntity.ok(request);
    }


    @GetMapping
    public ResponseEntity<List<RequestListItemReadModel>> findByCustomerId(
            @RequestParam(name = "customerId") Long customerId) {
        return ResponseEntity.ok(requestQueryPort.findByCustomerId(customerId));
    }


    @PostMapping(
            path = "/{requestId}/items/{itemId}/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ChecklistItemResponseDTO> uploadItemFile(
            @PathVariable Long requestId,
            @PathVariable Long itemId,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo é obrigatório");
        }

        InputStream fileStream;
        try {
            fileStream = file.getInputStream();
        } catch (IOException e) {
            throw new IllegalArgumentException(
                    "Falha ao ler o arquivo: " + file.getOriginalFilename(), e);
        }

        String originalFileName = file.getOriginalFilename();

        ChecklistItem item = requestServicePort.respondRequest(
                requestId, itemId, fileStream, originalFileName);

        return ResponseEntity.ok(RequestDTOMapper.toResponseDTO(item));
    }

    @PostMapping("/{requestId}/items/{itemId}/accept")
    public ResponseEntity<ChecklistItemResponseDTO> acceptItem(
            @PathVariable Long requestId,
            @PathVariable Long itemId) {

        ChecklistItem item = requestServicePort.acceptItem(requestId, itemId);
        return ResponseEntity.ok(RequestDTOMapper.toResponseDTO(item));
    }


    @PostMapping("/{requestId}/items/{itemId}/reject")
    public ResponseEntity<ChecklistItemResponseDTO> rejectItem(
            @PathVariable Long requestId,
            @PathVariable Long itemId,
            @RequestBody RejectItemRequestDTO body) {

        ChecklistItem item = requestServicePort.rejectItem(requestId, itemId, body.getReason());
        return ResponseEntity.ok(RequestDTOMapper.toResponseDTO(item));
    }



}