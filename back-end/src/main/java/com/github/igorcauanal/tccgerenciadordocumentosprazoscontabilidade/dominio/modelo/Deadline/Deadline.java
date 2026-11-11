package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.deadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDeadline;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Deadline {

        private Long id;
        private Long customerId;
        private String obligation;
        private String category;
        private String competence;
        private LocalDate dueDate;
        private deadlinePriority deadlinePriority;
        private StatusDeadline statusDeadline;
        private LocalDateTime createIn;
        private LocalDateTime deliveredOn;
        private String currentStage; //Mudar parar ENUM depois de implementar o MVP

        public Deadline() {
        }


    public Deadline(Long id,
                    Long customerId,
                    String obligation,
                    String category,
                    String competence,
                    LocalDate dueDate,
                    deadlinePriority deadlinePriority,
                    StatusDeadline statusDeadline,
                    LocalDateTime createIn,
                    LocalDateTime deliveredOn,
                    String currentStage) {
        this.id = id;
        this.customerId = customerId;
        this.obligation = obligation;
        this.category = category;
        this.competence = competence;
        this.dueDate = dueDate;
        this.deadlinePriority = deadlinePriority;
        this.statusDeadline = StatusDeadline.PENDENTE;
        this.createIn = createIn;
        this.deliveredOn = deliveredOn;
        this.currentStage = currentStage;
    }


        public Long getId() {
            return id;
        }

        public Long getClienteId() {
            return customerId;
        }

        public String getObligation() {
            return obligation;
        }

        public String getCategory() {
            return category;
        }

        public String getCompetence() {
            return competence;
        }

        public LocalDate getDueDate() {
            return dueDate;
        }

        public String getCurrentStage(){return currentStage;}


        public deadlinePriority getPrioridade() {
            return deadlinePriority;
        }

        public StatusDeadline getStatus() {
            return statusDeadline;
        }

        public LocalDateTime getCreateIn() {
            return createIn;
        }

        public LocalDateTime getDeliveredOn() {
            return deliveredOn;
        }


        public void setId(Long id) {
            this.id = id;
        }

        public void setClienteId(Long clienteId) {
            this.customerId = clienteId;
        }

        public void setObligation(String obligation) {
            this.obligation = obligation;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public void setCompetence(String competence) {
            this.competence = competence;
        }

        public void setDueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
        }

        public void setDeadlinePriority(deadlinePriority deadlinePriority) {
            this.deadlinePriority = deadlinePriority;
        }


        protected void setStatusPrazo(StatusDeadline statusDeadline){
            this.statusDeadline = statusDeadline;
        }

        protected void setCreateIn(LocalDateTime createIn){
         this.createIn = createIn;
        }

        protected void setDeliveredOn(LocalDateTime deliveredOn){
            this.deliveredOn = deliveredOn;
        }


        protected void setCurrentStage(String currentStage){
            this.currentStage = currentStage;
        }

    private boolean isCompleted(){
        return this.statusDeadline == StatusDeadline.CONCLUIDO;
    }


    public void finishDeadline(LocalDateTime completionDate){

           if(completionDate == null){

               throw new IllegalArgumentException("Data de conclusão é obrigatória");

           }

           if(isCompleted()){

               throw new IllegalStateException("Prazo concluído não pode ser concluído novamente");

           }

           this.deliveredOn = completionDate;
           this.statusDeadline = StatusDeadline.CONCLUIDO;


    }

    public boolean isLate(LocalDate currentDate){

            if(currentDate == null){
                throw new IllegalArgumentException("Data atual não pode ser nula");
            }

            // Se a data do prazo já foi concluida não pode ser mais alterada
            if(isCompleted()){
                return false;
            }


            return currentDate.isAfter(this.dueDate);

    }

}
