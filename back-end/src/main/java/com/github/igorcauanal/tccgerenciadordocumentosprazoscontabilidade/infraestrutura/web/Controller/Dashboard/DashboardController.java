package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller.Dashboard;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.dashboard.DashboardQueryServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Dashboard.DTO.DashboardDTOMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard.DashboardSummaryResponseDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@AllArgsConstructor
public class DashboardController {

    private final DashboardQueryServicePort dashboardQueryServicePort;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponseDTO> getSummary() {
        // Retorna o resumo da visão geral para o dashboard.
        return ResponseEntity.ok(DashboardDTOMapper.toResponseDTO(dashboardQueryServicePort.getSummary()));
    }
}
