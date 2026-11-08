package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.PrioridadePrazo;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDeadline;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Prazo {

        private Long id;
        private Long clienteId;
        private String obrigacao;
        private String categoria;
        private String competencia;
        private LocalDate dataVencimento;
        private PrioridadePrazo prioridadePrazo;
        private StatusDeadline statusDeadline;
        private LocalDateTime criadoEm;
        private LocalDateTime entregueEm;
        private String etapaAtual; //Mudar parar ENUM depois de implementar o MVP

        public Prazo() {
        }


    public Prazo(Long id,
                 Long clienteId,
                 String obrigacao,
                 String categoria,
                 String competencia,
                 LocalDate dataVencimento,
                 PrioridadePrazo prioridadePrazo,
                 StatusDeadline statusDeadline,
                 LocalDateTime criadoEm,
                 LocalDateTime entregueEm,
                 String etapaAtual) {
        this.id = id;
        this.clienteId = clienteId;
        this.obrigacao = obrigacao;
        this.categoria = categoria;
        this.competencia = competencia;
        this.dataVencimento = dataVencimento;
        this.prioridadePrazo = prioridadePrazo;
        this.statusDeadline = StatusDeadline.PENDENTE;
        this.criadoEm = criadoEm;
        this.entregueEm = entregueEm;
        this.etapaAtual = etapaAtual;
    }


        public Long getId() {
            return id;
        }

        public Long getClienteId() {
            return clienteId;
        }

        public String getObrigacao() {
            return obrigacao;
        }

        public String getCategoria() {
            return categoria;
        }

        public String getCompetencia() {
            return competencia;
        }

        public LocalDate getDataVencimento() {
            return dataVencimento;
        }

        public String getEtapaAtual(){return etapaAtual;}


        public PrioridadePrazo getPrioridade() {
            return prioridadePrazo;
        }

        public StatusDeadline getStatus() {
            return statusDeadline;
        }

        public LocalDateTime getCriadoEm() {
            return criadoEm;
        }

        public LocalDateTime getEntregueEm() {
            return entregueEm;
        }


        public void setId(Long id) {
            this.id = id;
        }

        public void setClienteId(Long clienteId) {
            this.clienteId = clienteId;
        }

        public void setObrigacao(String obrigacao) {
            this.obrigacao = obrigacao;
        }

        public void setCategoria(String categoria) {
            this.categoria = categoria;
        }

        public void setCompetencia(String competencia) {
            this.competencia = competencia;
        }

        public void setDataVencimento(LocalDate dataVencimento) {
            this.dataVencimento = dataVencimento;
        }

        public void setPrioridade(PrioridadePrazo prioridadePrazo) {
            this.prioridadePrazo = prioridadePrazo;
        }


        protected void setStatusPrazo(StatusDeadline statusDeadline){
            this.statusDeadline = statusDeadline;
        }

        protected void setCriadoEm(LocalDateTime criadoEm){
         this.criadoEm = criadoEm;
        }

        protected void setEntregueEm(LocalDateTime entregueEm){
            this.entregueEm = entregueEm;
        }


        protected void setEtapaAtual(String etapaAtual){
            this.etapaAtual = etapaAtual;
        }

    private boolean isConcluido(){
        return this.statusDeadline == StatusDeadline.CONCLUIDO;
    }


    public void concluirPrazo(LocalDateTime dataConclusao){

           if(dataConclusao == null){

               throw new IllegalArgumentException("Data de conclusão é obrigatória");

           }

           if(isConcluido()){

               throw new IllegalStateException("Prazo concluído não pode ser concluído novamente");

           }

           this.entregueEm = dataConclusao;
           this.statusDeadline = StatusDeadline.CONCLUIDO;


    }

    public boolean isAtrasado(LocalDate dataAtual){

            if(dataAtual == null){
                throw new IllegalArgumentException("Data atual não pode ser nula");
            }

            if(isConcluido()){
                return false;
            }
            return dataAtual.isAfter(this.dataVencimento);

    }

}
