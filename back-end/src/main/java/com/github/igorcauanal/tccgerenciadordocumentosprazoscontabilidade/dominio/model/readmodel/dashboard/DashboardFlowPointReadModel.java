package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard;

public class DashboardFlowPointReadModel {

    private final String label;
    private final long sent;
    private final long received;

    public DashboardFlowPointReadModel(String label, long sent, long received) {
        this.label = label;
        this.sent = sent;
        this.received = received;
    }

    public String getLabel() {
        return label;
    }

    public long getSent() {
        return sent;
    }

    public long getReceived() {
        return received;
    }
}
