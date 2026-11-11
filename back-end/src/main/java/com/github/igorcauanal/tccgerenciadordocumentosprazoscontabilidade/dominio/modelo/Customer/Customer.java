package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusPendenciaCliente;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public class Customer {

        private Long id;
        private String cnpj;
        private String razaoSocial;
        private String responsavel;
        private String email;
        private String enderecoCompleto;
        private StatusPendenciaCliente statusPendencia;
        private LocalDateTime ultimoEnvioEm;

        public Customer() {
        }

        public Customer(Long id, String cnpj, String razaoSocial, String responsavel,
                        String email, String enderecoCompleto, StatusPendenciaCliente statusPendencia,
                        LocalDateTime ultimoEnvioEm) {
                this.id = id;
                this.cnpj = cnpj;
                this.razaoSocial = razaoSocial;
                this.responsavel = responsavel;
                this.email = email;
                this.enderecoCompleto = enderecoCompleto;
                this.statusPendencia = statusPendencia;
                this.ultimoEnvioEm = ultimoEnvioEm;
        }

        public Long getId() {
                return id;
        }

        public String getCnpj() {
                return cnpj;
        }

        public String getRazaoSocial() {
                return razaoSocial;
        }

        public String getResponsavel() {
                return responsavel;
        }

        public String getEmail() {
                return email;
        }

        public String getEnderecoCompleto() {
                return enderecoCompleto;
        }

        public StatusPendenciaCliente getStatusPendencia() {
                return statusPendencia;
        }

        public LocalDateTime getUltimoEnvioEm() {
                return ultimoEnvioEm;
        }

        public void atualizarPendencia(StatusPendenciaCliente novoStatus) {
                this.statusPendencia = novoStatus;
        }

        public void registrarEnvio(LocalDateTime dataEnvio) {
                this.ultimoEnvioEm = dataEnvio;
        }
}