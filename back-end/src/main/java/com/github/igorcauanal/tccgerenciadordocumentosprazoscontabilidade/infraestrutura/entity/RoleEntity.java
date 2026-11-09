package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "perfis",
        uniqueConstraints = @UniqueConstraint(name = "uk_perfis_nome", columnNames = "nome"))
@Getter @Setter
public class PerfilEntity {                // <- sem GrantedAuthority

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, unique = true, length = 50)
    private String nome;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @ManyToMany(mappedBy = "perfis")
    private Set<UsuarioEntity> usuarios = new HashSet<>();

    public PerfilEntity() {}
    public PerfilEntity(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }
}
