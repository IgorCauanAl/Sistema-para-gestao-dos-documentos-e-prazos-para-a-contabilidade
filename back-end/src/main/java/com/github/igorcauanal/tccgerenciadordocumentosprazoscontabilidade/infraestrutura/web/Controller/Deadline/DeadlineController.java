package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller.Deadline;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.deadline.DeadlineListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query.DeadlineQueryPort;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/deadlines", "/deadline"})
@AllArgsConstructor
public class DeadlineController {

    private final DeadlineServicePort deadlineService;
    private final DeadlineQueryPort deadlineQueryPort;

    // Tabela principal de prazos (read model)
    @GetMapping
    public ResponseEntity<List<DeadlineListItemReadModel>> listAll() {
        return ResponseEntity.ok(deadlineQueryPort.listAll());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<DeadlineListItemReadModel>> listByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(deadlineQueryPort.listByCustomerId(customerId));
    }

    // Chamado APÓS a confirmação na UI ("Marcar como entregue" → tela de confirmação → PATCH)
    @PatchMapping("/{deadlineId}/deliver")
    public ResponseEntity<Void> markAsDelivered(@PathVariable Long deadlineId) {
        deadlineService.markAsDelivered(deadlineId);
        return ResponseEntity.noContent().build();
    }
}