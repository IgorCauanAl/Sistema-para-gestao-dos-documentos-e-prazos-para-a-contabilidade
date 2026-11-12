package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Customer.PendingStatus;

import java.time.LocalDateTime;
import java.util.Objects;

public final class Customer {

        private Long id;
        private final String cnpj;                // CNPJ não muda após cadastro
        private String legalName;
        private String responsibleName;
        private String email;
        private String fullAddress;
        private PendingStatus pendingStatus;
        private LocalDateTime lastSubmissionAt;

        private Customer(Long id,
                         String cnpj,
                         String legalName,
                         String responsibleName,
                         String email,
                         String fullAddress,
                         PendingStatus pendingStatus,
                         LocalDateTime lastSubmissionAt) {

                this.id = id;
                this.cnpj = requireCnpj(cnpj);
                this.legalName = requireNonBlank(legalName, "Razão social é obrigatória");
                this.responsibleName = requireNonBlank(responsibleName, "Responsável é obrigatório");
                this.email = requireEmail(email);
                this.fullAddress = requireNonBlank(fullAddress, "Endereço completo é obrigatório");
                this.pendingStatus = requireNonNull(pendingStatus, "Status de pendência é obrigatório");
                this.lastSubmissionAt = lastSubmissionAt;
        }

        // Cadastro novo: sempre nasce sem id, com pendência inicial e sem envio registrado
        public static Customer create(String cnpj,
                                      String legalName,
                                      String responsibleName,
                                      String email,
                                      String fullAddress) {
                return new Customer(
                        null, cnpj, legalName, responsibleName, email, fullAddress,
                        PendingStatus.PENDENTE, null
                );
        }

        // Reconstituição a partir da persistência
        public static Customer reconstitute(Long id,
                                            String cnpj,
                                            String legalName,
                                            String responsibleName,
                                            String email,
                                            String fullAddress,
                                            PendingStatus pendingStatus,
                                            LocalDateTime lastSubmissionAt) {
                return new Customer(id, cnpj, legalName, responsibleName, email, fullAddress,
                        pendingStatus, lastSubmissionAt);
        }

        // Edição dos dados cadastrais. CNPJ permanece imutável.
        public void update(String legalName,
                           String responsibleName,
                           String email,
                           String fullAddress) {
                this.legalName = requireNonBlank(legalName, "Razão social é obrigatória");
                this.responsibleName = requireNonBlank(responsibleName, "Responsável é obrigatório");
                this.email = requireEmail(email);
                this.fullAddress = requireNonBlank(fullAddress, "Endereço completo é obrigatório");
        }

        public void updatePendingStatus(PendingStatus newStatus) {
                this.pendingStatus = requireNonNull(newStatus, "Novo status é obrigatório");
        }

        public void registerSubmission(LocalDateTime submittedAt) {
                if (submittedAt == null) {
                        throw new IllegalArgumentException("Data de envio é obrigatória");
                }
                this.lastSubmissionAt = submittedAt;
        }

        public void assignId(Long id) {
                if (this.id != null) {
                        throw new IllegalStateException("Id já foi atribuído");
                }
                if (id == null) {
                        throw new IllegalArgumentException("Id é obrigatório");
                }
                this.id = id;
        }

        public Long getId()                                { return id; }
        public String getCnpj()                            { return cnpj; }
        public String getLegalName()                       { return legalName; }
        public String getResponsibleName()                 { return responsibleName; }
        public String getEmail()                           { return email; }
        public String getFullAddress()                     { return fullAddress; }
        public PendingStatus getPendingStatus()            { return pendingStatus; }
        public LocalDateTime getLastSubmissionAt()         { return lastSubmissionAt; }




        private static String requireNonBlank(String value, String message) {
                if (value == null || value.isBlank()) throw new IllegalArgumentException(message);
                return value;
        }

        private static <T> T requireNonNull(T value, String message) {
                if (value == null) throw new IllegalArgumentException(message);
                return value;
        }

        private static String requireCnpj(String cnpj) {
                if (cnpj == null) throw new IllegalArgumentException("CNPJ é obrigatório");
                String digits = cnpj.replaceAll("\\D", "");
                if (digits.length() != 14) {
                        throw new IllegalArgumentException("CNPJ deve conter 14 dígitos");
                }
                return cnpj;
        }

        private static String requireEmail(String email) {
                if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException("E-mail é obrigatório");
                }
                // validação simples; trocar por regex mais rigoroso se necessário
                if (!email.contains("@")) {
                        throw new IllegalArgumentException("E-mail inválido");
                }
                return email;
        }


}