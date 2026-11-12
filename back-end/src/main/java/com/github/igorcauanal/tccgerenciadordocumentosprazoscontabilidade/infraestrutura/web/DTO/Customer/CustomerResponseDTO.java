package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Customer.PendingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDTO {

    private Long id;
    private String cnpj;
    private String legalName;
    private String responsibleName;
    private String email;
    private String fullAddress;
    private PendingStatus pendingStatus;
    private LocalDateTime lastSubmissionAt;

    public static CustomerResponseDTO from(Customer customer) {
        return CustomerResponseDTO.builder()
                .id(customer.getId())
                .cnpj(customer.getCnpj())
                .legalName(customer.getLegalName())
                .responsibleName(customer.getResponsibleName())
                .email(customer.getEmail())
                .fullAddress(customer.getFullAddress())
                .pendingStatus(customer.getPendingStatus())
                .lastSubmissionAt(customer.getLastSubmissionAt())
                .build();
    }
}