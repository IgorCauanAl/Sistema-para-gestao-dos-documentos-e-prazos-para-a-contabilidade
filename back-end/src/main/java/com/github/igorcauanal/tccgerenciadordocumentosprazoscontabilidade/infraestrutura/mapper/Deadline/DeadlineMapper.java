package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DeadlineEntity;

public final class DeadlineMapper {


    private DeadlineMapper(){}

    public static DeadlineEntity toEntity (Deadline deadline){

        if(deadline == null ){
            return null;
        }

        return DeadlineEntity.reconstituir(
                deadline.getId(),
                deadline.getClienteId(),
                deadline.getObligation(),
                deadline.getCategory(),
                deadline.getCompetence(),
                deadline.getDueDate(),
                deadline.getPrioridade(),
                deadline.getStatus(),
                deadline.getCreateIn(),
                deadline.getDeliveredOn(),
                deadline.getCurrentStage(),
                null //@LastModifiedDate preencher
        );
    }




    public static Deadline toDomain (DeadlineEntity entity){


        if(entity == null ){
            return null;
        }

        return new Deadline(
                entity.getId(),
                entity.getCustomerId(),
                entity.getObligation(),
                entity.getCategory(),
                entity.getCompetence(),
                entity.getExpiration(),
                entity.getPriorirityDeadline(),
                entity.getStatusDeadline(),
                entity.getCreateIn(),
                entity.getDeliveryOn(),
                entity.getCurrentStage()
        );

    }


}

