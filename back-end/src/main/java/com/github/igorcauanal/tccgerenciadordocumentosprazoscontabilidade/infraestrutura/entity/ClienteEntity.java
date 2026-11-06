package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.Entity;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusPendenciaCliente;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "cliente")
public class ClienteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cnpj", nullable = false, unique = true, length = 18)
    private String cnpj;

    @Column(name = "razao_social", nullable = false, length = 200)
    private String razaoSocial;

    @Column(name = "responsavel", length = 150)
    private String responsavel;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "endereco_completo", length = 500)
    private String enderecoCompleto;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_pendencia", nullable = false, length = 30)
    private StatusPendenciaCliente statusPendencia;

    @Column(name = "ultimo_envio_em")
    private LocalDateTime ultimoEnvioEm;

}

