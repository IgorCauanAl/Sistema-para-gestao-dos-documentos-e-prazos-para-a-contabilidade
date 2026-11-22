package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardChartsReadModel;

public interface DashboardChartsQueryPort {

    DashboardChartsReadModel getCharts();
}
