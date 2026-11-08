package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusSolicitacao;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

public class Solicitacao {

    private Long id;
    private Long clienteId;
    private String titulo;
    private String competencia;
    private LocalDate prazo;
    private StatusSolicitacao status;
    private LocalDateTime criadoEm;

    public Solicitacao() {
    }


    public Solicitacao(Long id, Long clienteId, String titulo, String competencia, LocalDate prazo) {
        this.id = id;
        this.clienteId = clienteId;
        this.titulo = titulo;
        this.competencia = competencia;
        this.prazo = prazo;
        this.status = StatusSolicitacao.PENDENTE;
        this.criadoEm = LocalDateTime.now();
    }


    public Solicitacao(Long clienteId, String titulo, String competencia, LocalDate prazo) {
        this(null, clienteId, titulo, competencia, prazo);
    }


    public Long getId() {
        return id;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getCompetencia() {
        return competencia;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public StatusSolicitacao getStatus() {
        return status;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }


    public void setId(Long id) {
        this.id = id;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setCompetencia(String competencia) {
        this.competencia = competencia;
    }

    public void setPrazo(LocalDate prazo) {
        this.prazo = prazo;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }


    public void concluirSolicitacao() {

    }

    public void cancelarSolicitacao() {

    }


}