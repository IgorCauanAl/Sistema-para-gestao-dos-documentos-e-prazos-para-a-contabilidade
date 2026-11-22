package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard;

public class DashboardFlowPointResponseDTO {

    private String label;
    private long sent;
    private long received;

    public DashboardFlowPointResponseDTO() {
    }

    public DashboardFlowPointResponseDTO(String label, long sent, long received) {
        this.label = label;
        this.sent = sent;
        this.received = received;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public long getSent() {
        return sent;
    }

    public void setSent(long sent) {
        this.sent = sent;
    }

    public long getReceived() {
        return received;
    }

    public void setReceived(long received) {
        this.received = received;
    }
}
