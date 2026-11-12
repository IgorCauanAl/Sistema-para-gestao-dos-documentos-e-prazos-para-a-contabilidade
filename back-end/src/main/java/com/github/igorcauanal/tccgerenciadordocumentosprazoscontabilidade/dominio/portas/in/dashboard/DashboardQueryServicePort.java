package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.dashboard;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.dashboard.DashboardSummaryReadModel;

public interface DashboardQueryServicePort {

    DashboardSummaryReadModel getSummary();
}
