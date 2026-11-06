package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;

@Entity
@Table(name = "perfis", uniqueConstraints = @UniqueConstraint(name = "uk_perfis_nome", columnNames = "nome"))
@Getter
@Setter
public class Perfil implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, unique = true, length = 50)
    private String nome;

    @Column(name = "descricao", length = 255)
    private String descricao;


    public Perfil() {
    }

    public Perfil(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }


    @Override
    public @Nullable String getAuthority() {
        return this.nome;
    }


}
