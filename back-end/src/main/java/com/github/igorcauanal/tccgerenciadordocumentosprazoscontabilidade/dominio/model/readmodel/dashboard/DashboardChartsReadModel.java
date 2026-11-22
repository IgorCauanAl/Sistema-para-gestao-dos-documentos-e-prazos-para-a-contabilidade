package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard;

import java.util.List;

public class DashboardChartsReadModel {

    private final List<DashboardFlowPointReadModel> documentFlow;
    private final List<DashboardChartItemReadModel> documentsByType;
    private final List<DashboardChartItemReadModel> clientsByPendingStatus;
    private final List<DashboardChartItemReadModel> obligationsByStatus;

    public DashboardChartsReadModel(
            List<DashboardFlowPointReadModel> documentFlow,
            List<DashboardChartItemReadModel> documentsByType,
            List<DashboardChartItemReadModel> clientsByPendingStatus,
            List<DashboardChartItemReadModel> obligationsByStatus) {
        this.documentFlow = documentFlow;
        this.documentsByType = documentsByType;
        this.clientsByPendingStatus = clientsByPendingStatus;
        this.obligationsByStatus = obligationsByStatus;
    }

    public List<DashboardFlowPointReadModel> getDocumentFlow() {
        return documentFlow;
    }

    public List<DashboardChartItemReadModel> getDocumentsByType() {
        return documentsByType;
    }

    public List<DashboardChartItemReadModel> getClientsByPendingStatus() {
        return clientsByPendingStatus;
    }

    public List<DashboardChartItemReadModel> getObligationsByStatus() {
        return obligationsByStatus;
    }
}
