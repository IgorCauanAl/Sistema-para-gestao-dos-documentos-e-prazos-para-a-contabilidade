package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Dashboard;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardSummaryReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.dashboard.DashboardQueryServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DashboardSummaryQueryPort;

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
