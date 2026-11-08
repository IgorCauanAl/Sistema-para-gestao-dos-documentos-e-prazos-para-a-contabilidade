package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.Controller;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO.DeadlineResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.DeadlineService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/deadline")
@AllArgsConstructor
public class DeadlineController {

    private final DeadlineService deadlineService;

    @GetMapping("/customer/{clienteId}")
    public ResponseEntity<List<DeadlineResponseDTO>> findByCustomer(@PathVariable ("clienteId") Long customerId){

        if(customerId == null ){
            throw new IllegalArgumentException("Customer Id inválido");
        }

        LocalDate today = LocalDate.now();

        List<DeadlineResponseDTO> deadlines = deadlineService.findByCustomer(customerId)
                .stream()
                .map(deadline -> DeadlineResponseDTO.deDominio(deadline, today))
                .toList();

        return ResponseEntity.ok(deadlines);

    }

    @PatchMapping("/finish/{id}")
    public ResponseEntity<Void> finishDeadline(@PathVariable ("id") Long deadLineId){

        if(deadLineId == null){
            throw new IllegalArgumentException("Deadline Id é inválido");
        }

        deadlineService.finishDeadline(deadLineId);

    }

}
