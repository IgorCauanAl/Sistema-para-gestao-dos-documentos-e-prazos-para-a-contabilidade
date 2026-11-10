package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Document.DocumentUploadRequestDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DocumentEntity;


public final class DocumentMapper {

    private DocumentMapper(){}


    public static DocumentEntity toEntity(Document document){

        if(document == null){

            return null;
        }

        DocumentEntity entity = new DocumentEntity();

        entity.setId(document.getId());
        entity.setClienteId(document.getClienteId());
        entity.setTipoDocumento(document.getTipoDocumento());
        entity.setCompetencia(document.getCompetencia());
        entity.setDataDeVencimento(document.getDataVencimento());
        entity.setDocumentDirection(document.getDirecao());
        entity.setStatusDocument(document.getStatus());
        entity.setFileFormat(document.getFormatoArquivo());
        entity.setNomeArquivo(document.getNomeArquivo());
        entity.setUrlArquivo(document.getUrlArquivo());
        entity.setCriadoEm(document.getCriadoEm());
        entity.setSendChannel(document.getCanalEnvio());


        return entity;
    }


    public static Document toDomain(DocumentEntity entity){

        if(entity == null){
            return null;
        }

        return new Document(
                entity.getId(),
                entity.getClienteId(),
                entity.getTipoDocumento(),
                entity.getCompetencia(),
                entity.getDataDeVencimento(),
                entity.getDocumentDirection(),
                entity.getStatusDocument(),
                entity.getFileFormat(),
                entity.getNomeArquivo(),
                entity.getUrlArquivo(),
                entity.getCriadoEm(),
                entity.getSendChannel()
        );
    }


    public static DocumentUploadRequestDTO toResponseDTO(Document document) {

        if (document == null) {
            return null;
        }

        DocumentUploadRequestDTO dto = new DocumentUploadRequestDTO();

        dto.setId(document.getId());
        dto.setClienteId(document.getClienteId());
        dto.setTipoDocumento(document.getTipoDocumento());
        dto.setCompetencia(document.getCompetencia());
        dto.setDataVencimento(document.getDataVencimento());
        dto.setCanal(document.getCanalEnvio());
        dto.setDirecao(document.getDirecao());
        dto.setStatus(document.getStatus());
        dto.setNomeArquivo(document.getNomeArquivo());
        dto.setUrlArquivo(document.getUrlArquivo());
        dto.setFileFormat(document.getFormatoArquivo());
        dto.setCriadoEm(document.getCriadoEm());

        return dto;
    }




}
