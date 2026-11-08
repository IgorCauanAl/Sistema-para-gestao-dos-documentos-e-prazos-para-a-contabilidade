package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.PrioridadePrazo;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDeadline;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@NoArgsConstructor
@Getter
@EntityListeners(AuditingEntityListener.class)
@Table(name = "prazo")
public class PrazoEntity {


    //Factory
    public static PrazoEntity reconstituir(
            Long id,
            Long clienteId,
            String obrigacao,
            String categoria,
            String competencia,
            LocalDate dataVencimento,
            PrioridadePrazo prioridadePrazo,
            StatusDeadline statusDeadline,
            LocalDateTime criadoEm,
            LocalDateTime entregueEm,
            String etapaAtual,
            LocalDateTime atualizadoEm) {

        PrazoEntity entity = new PrazoEntity();
        entity.setId(id);
        entity.setCustomerId(clienteId);
        entity.setObligation(obrigacao);
        entity.setCategory(categoria);
        entity.setCompetence(competencia);
        entity.setExpiration(dataVencimento);
        entity.setPriorirityDeadline(prioridadePrazo);
        entity.setStatusDeadline(statusDeadline);
        entity.setCreateIn(criadoEm);
        entity.setDeliveryOn(entregueEm);
        entity.setCurrentStage(etapaAtual);
        entity.setUpdatedOn(atualizadoEm);
        return entity;
    }



        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "cliente_id", nullable = false)
        private Long customerId;

        @Column(name = "obrigacao", nullable = false, length = 255)
        private String obligation;

        @Column(name = "categoria", length = 100)
        private String category;

        @Column(name = "competencia", length = 7)
        private String competence;

        @Column(name = "data_vencimento", nullable = false)
        private LocalDate expiration;

        @Enumerated(EnumType.STRING)
        @Column(name = "prioridade", nullable = false, length = 20)
        private PrioridadePrazo priorirityDeadline;

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 20)
        private StatusDeadline statusDeadline;

        @CreatedDate
        @Column(name = "criado_em", nullable = false, updatable = false)
        private LocalDateTime createIn;

        @Column(name = "entregue_em")
        private LocalDateTime deliveryOn;

        @Column(name = "etapa_atual", length = 50)
        private String currentStage;

        @LastModifiedDate
        @Column(name = "atualizado_em", nullable = false)
        private LocalDateTime updatedOn;


    //Implementei os setter manualmente para proteger os atributos de modificação como atualizadoEm e o criadoem e o entregue em
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public void setObligation(String obligation) {
        this.obligation = obligation;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setCompetence(String competency) {
        this.competence = competency;
    }

    public void setExpiration(LocalDate dueDate) {
        this.expiration = dueDate;
    }

    public void setPriorirityDeadline(PrioridadePrazo priorityDeadline) {
        this.priorirityDeadline = priorityDeadline;
    }

    public void setCurrentStage(String currentStage) {
        this.currentStage = currentStage;
    }

    protected void setId(Long id) {
        this.id = id;
    }

    protected void setStatusDeadline(StatusDeadline statusDeadline) {
        this.statusDeadline = statusDeadline;
    }

    protected void setCreateIn(LocalDateTime createIn) {
        this.createIn = createIn;
    }

    protected void setDeliveryOn(LocalDateTime deliveryOn) {
        this.deliveryOn = deliveryOn;
    }

    protected void setUpdatedOn(LocalDateTime updatedOn) {
        this.updatedOn = updatedOn;
    }



}
