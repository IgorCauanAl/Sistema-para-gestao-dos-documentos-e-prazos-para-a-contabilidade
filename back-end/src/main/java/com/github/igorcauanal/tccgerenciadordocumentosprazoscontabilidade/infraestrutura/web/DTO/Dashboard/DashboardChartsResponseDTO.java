package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard;

import java.util.List;

public class DashboardChartsResponseDTO {

    private List<DashboardFlowPointResponseDTO> documentFlow;
    private List<DashboardChartItemResponseDTO> documentsByType;
    private List<DashboardChartItemResponseDTO> clientsByPendingStatus;
    private List<DashboardChartItemResponseDTO> obligationsByStatus;

    public DashboardChartsResponseDTO() {
    }

    public DashboardChartsResponseDTO(
            List<DashboardFlowPointResponseDTO> documentFlow,
            List<DashboardChartItemResponseDTO> documentsByType,
            List<DashboardChartItemResponseDTO> clientsByPendingStatus,
            List<DashboardChartItemResponseDTO> obligationsByStatus) {
        this.documentFlow = documentFlow;
        this.documentsByType = documentsByType;
        this.clientsByPendingStatus = clientsByPendingStatus;
        this.obligationsByStatus = obligationsByStatus;
    }

    public List<DashboardFlowPointResponseDTO> getDocumentFlow() {
        return documentFlow;
    }

    public void setDocumentFlow(List<DashboardFlowPointResponseDTO> documentFlow) {
        this.documentFlow = documentFlow;
    }

    public List<DashboardChartItemResponseDTO> getDocumentsByType() {
        return documentsByType;
    }

    public void setDocumentsByType(List<DashboardChartItemResponseDTO> documentsByType) {
        this.documentsByType = documentsByType;
    }

    public List<DashboardChartItemResponseDTO> getClientsByPendingStatus() {
        return clientsByPendingStatus;
    }

    public void setClientsByPendingStatus(List<DashboardChartItemResponseDTO> clientsByPendingStatus) {
        this.clientsByPendingStatus = clientsByPendingStatus;
    }

    public List<DashboardChartItemResponseDTO> getObligationsByStatus() {
        return obligationsByStatus;
    }

    public void setObligationsByStatus(List<DashboardChartItemResponseDTO> obligationsByStatus) {
        this.obligationsByStatus = obligationsByStatus;
    }
}
