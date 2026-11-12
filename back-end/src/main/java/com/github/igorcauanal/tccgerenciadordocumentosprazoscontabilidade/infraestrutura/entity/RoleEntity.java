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
public class RoleEntity {                // <- sem GrantedAuthority

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @ManyToMany(mappedBy = "profiles")
    private Set<UserEntity> profiles = new HashSet<>();

    public RoleEntity() {}
    public RoleEntity(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
