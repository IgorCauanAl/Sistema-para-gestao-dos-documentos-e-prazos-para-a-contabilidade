package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard;

public class DashboardSummaryReadModel {

    private long totalCustomers;
    private long pendingDocuments;
    private long overdueObligations;

    public DashboardSummaryReadModel(long totalCustomers, long pendingDocuments, long overdueObligations) {
        this.totalCustomers = totalCustomers;
        this.pendingDocuments = pendingDocuments;
        this.overdueObligations = overdueObligations;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public long getPendingDocuments() {
        return pendingDocuments;
    }

    public long getOverdueObligations() {
        return overdueObligations;
    }
}
