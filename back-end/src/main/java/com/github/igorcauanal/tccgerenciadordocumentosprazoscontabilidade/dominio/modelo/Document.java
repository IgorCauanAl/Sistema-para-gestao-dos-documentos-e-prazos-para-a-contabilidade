package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.CanalEnvio;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.DirecaoDocumento;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.FormatoArquivo;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDocumento;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Documento {

    private Long id;

    private Long clienteId;

    private String tipoDocumento;

    private String competencia;

    private LocalDate dataDeVencimento;

    private DirecaoDocumento direcaoDocumento;

    private CanalEnvio canalEnvio;

    private StatusDocumento statusDocumento;

    private FormatoArquivo formatoArquivo;

    private String nomeArquivo;

    private String urlArquivo;

    private LocalDateTime criadoEm;

    public Documento() {
    }


    public static Documento novo (Long clienteId, String nomeArquivo, String urlArquivo){
        if(clienteId == null || nomeArquivo == null || urlArquivo == null){
            throw new IllegalArgumentException("ClienteId, nomeArquivo e urlArquivo são obrigatórios");
        }

        Documento d = new Documento();
        d.clienteId = clienteId;
        d.nomeArquivo = nomeArquivo;
        d.urlArquivo = urlArquivo;
        d.statusDocumento = StatusDocumento.CRIADO;
        d.criadoEm = LocalDateTime.now();

        return d;
    }


    public Documento(Long id, Long clienteId, String tipoDocumento, String competencia,
                     LocalDate dataDeVencimento, DirecaoDocumento direcaoDocumento,
                     StatusDocumento statusDocumento, FormatoArquivo formatoArquivo,
                     String nomeArquivo, String urlArquivo, LocalDateTime criadoEm, CanalEnvio canalEnvio) {
        this.id = id;
        this.clienteId = clienteId;
        this.tipoDocumento = tipoDocumento;
        this.competencia = competencia;
        this.dataDeVencimento = dataDeVencimento;
        this.direcaoDocumento = direcaoDocumento;
        this.statusDocumento = statusDocumento;
        this.formatoArquivo = formatoArquivo;
        this.nomeArquivo = nomeArquivo;
        this.urlArquivo = urlArquivo;
        this.criadoEm = criadoEm;
        this.canalEnvio = canalEnvio;

    }

    public Long getId() {
        return id;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public String getCompetencia() {
        return competencia;
    }

    public LocalDate getDataVencimento() {
        return dataDeVencimento;
    }

    public DirecaoDocumento getDirecao() {
        return direcaoDocumento;
    }

    public StatusDocumento getStatus() {
        return statusDocumento;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public String getUrlArquivo() {
        return urlArquivo;
    }

    public CanalEnvio getCanalEnvio (){
        return canalEnvio;
    }

    public FormatoArquivo getFormatoArquivo() {
        return formatoArquivo;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void alterarStatus(StatusDocumento novoStatus) {
        this.statusDocumento = novoStatus;
    }
}