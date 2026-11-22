package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Dashboard;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardChartsReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardSummaryReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.dashboard.DashboardQueryServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DashboardChartsQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DashboardSummaryQueryPort;

public class DashboardService implements DashboardQueryServicePort {

    private final DashboardSummaryQueryPort dashboardSummaryQueryPort;
    private final DashboardChartsQueryPort dashboardChartsQueryPort;

    public DashboardService(DashboardSummaryQueryPort dashboardSummaryQueryPort,
                            DashboardChartsQueryPort dashboardChartsQueryPort) {
        this.dashboardSummaryQueryPort = dashboardSummaryQueryPort;
        this.dashboardChartsQueryPort = dashboardChartsQueryPort;
    }

    @Override
    public DashboardSummaryReadModel getSummary() {
        return dashboardSummaryQueryPort.getSummary();
    }

    @Override
    public DashboardChartsReadModel getCharts() {
        return dashboardChartsQueryPort.getCharts();
    }
}
