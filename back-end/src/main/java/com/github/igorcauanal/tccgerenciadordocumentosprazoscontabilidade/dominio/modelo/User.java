package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class Usuario {

    private Long id;
    private String nome;
    private String email;
    private String senhaHash;
    private LocalDateTime criadoEm;

    private Set<Perfil> perfis = new HashSet<>();



    public Usuario() {
    }


    public Usuario(Long id, String nome, String email, String senhaHash, LocalDateTime criadoEm) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.criadoEm = criadoEm;
    }


    public Usuario(String nome, String email, String senhaHash) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getSenhaHash(){return senhaHash;}

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public Set<Perfil> getPerfis() { return Collections.unmodifiableSet(perfis); }



    public void setPerfis(Set<Perfil> perfis) { this.perfis = new HashSet<>(perfis); }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }




}