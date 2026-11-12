package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Dashboard;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.dashboard.DashboardSummaryReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.dashboard.DashboardQueryServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query.DashboardSummaryQueryPort;
import org.springframework.stereotype.Service;

@Service
public class DashboardService implements DashboardQueryServicePort {

    private final DashboardSummaryQueryPort dashboardSummaryQueryPort;

    public DashboardService(DashboardSummaryQueryPort dashboardSummaryQueryPort) {
        this.dashboardSummaryQueryPort = dashboardSummaryQueryPort;
    }

    @Override
    public DashboardSummaryReadModel getSummary() {
        // Retorna os indicadores consolidados da visão geral do dashboard.
        return dashboardSummaryQueryPort.getSummary();
    }
}
