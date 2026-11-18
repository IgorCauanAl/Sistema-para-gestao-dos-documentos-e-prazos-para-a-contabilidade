package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Customer.PendingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "cliente")
public class CustomerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cnpj", nullable = false, unique = true, length = 18)
    private String cnpj;

    @Column(name = "corporate_name", nullable = false, length = 200)
    private String  corporateName;

    @Column(name = "responsible", length = 150)
    private String responsible;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "full_address", length = 500)
    private String fullAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "pending_status", nullable = false, length = 30)
    private PendingStatus pendingStatus;

    @Column(name = "last_posted_on")
    private LocalDateTime lastPostedOn;

}

