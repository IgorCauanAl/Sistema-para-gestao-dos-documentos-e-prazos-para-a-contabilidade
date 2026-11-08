package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Prazo;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.PrazoEntity;

public final class PrazoMapper {


    private  PrazoMapper(){}

    public static PrazoEntity toEntity (Prazo prazo){

        if(prazo == null ){
            return null;
        }

        return PrazoEntity.reconstituir(
                prazo.getId(),
                prazo.getClienteId(),
                prazo.getObrigacao(),
                prazo.getCategoria(),
                prazo.getCompetencia(),
                prazo.getDataVencimento(),
                prazo.getPrioridade(),
                prazo.getStatus(),
                prazo.getCriadoEm(),
                prazo.getEntregueEm(),
                prazo.getEtapaAtual(),
                null //@LastModifiedDate preencher
        );
    }




    public static Prazo toDomain (PrazoEntity entity){


        if(entity == null ){
            return null;
        }

        return new Prazo(
                entity.getId(),
                entity.getClienteId(),
                entity.getObrigacao(),
                entity.getCategoria(),
                entity.getCompetencia(),
                entity.getExpiration(),
                entity.getPrioridadePrazo(),
                entity.getStatusDeadline(),
                entity.getCriadoEm(),
                entity.getEntregueEm(),
                entity.getEtapaAtual()
        );

    }


}

