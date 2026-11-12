package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Role;

import java.util.Objects;

public class Role {

    private Long id;
    private String nome;
    private String descricao;

    public Role() {}

    public Role(Long id, String nome, String descricao) {
        this.id = id;
        this.nome = Objects.requireNonNull(nome);
        this.descricao = descricao;
    }

    public Long getId(){
        return id; }

    public String getNome(){
        return nome; }

    public String getDescricao(){
        return descricao; }

    public void setId(Long id){
        this.id = id; }

    public void setNome(String nome) {
        this.nome = nome; }

    public void setDescricao(String descricao) {
        this.descricao = descricao; }

}
