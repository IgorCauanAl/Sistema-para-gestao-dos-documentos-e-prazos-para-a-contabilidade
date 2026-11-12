package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard;

public class DashboardSummaryResponseDTO {

    private long totalCustomers;
    private long pendingDocuments;
    private long overdueObligations;

    public DashboardSummaryResponseDTO() {
    }

    public DashboardSummaryResponseDTO(long totalCustomers, long pendingDocuments, long overdueObligations) {
        this.totalCustomers = totalCustomers;
        this.pendingDocuments = pendingDocuments;
        this.overdueObligations = overdueObligations;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getPendingDocuments() {
        return pendingDocuments;
    }

    public void setPendingDocuments(long pendingDocuments) {
        this.pendingDocuments = pendingDocuments;
    }

    public long getOverdueObligations() {
        return overdueObligations;
    }

    public void setOverdueObligations(long overdueObligations) {
        this.overdueObligations = overdueObligations;
    }
}
