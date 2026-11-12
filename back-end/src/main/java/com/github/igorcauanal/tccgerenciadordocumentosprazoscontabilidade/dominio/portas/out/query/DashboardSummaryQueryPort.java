package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.dashboard.DashboardSummaryReadModel;

public interface DashboardSummaryQueryPort {

    DashboardSummaryReadModel getSummary();
}
