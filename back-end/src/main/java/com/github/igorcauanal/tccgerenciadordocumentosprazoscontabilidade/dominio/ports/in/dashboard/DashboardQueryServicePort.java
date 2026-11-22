package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.dashboard;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardChartsReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardSummaryReadModel;

public interface DashboardQueryServicePort {

    DashboardSummaryReadModel getSummary();

    DashboardChartsReadModel getCharts();
}
