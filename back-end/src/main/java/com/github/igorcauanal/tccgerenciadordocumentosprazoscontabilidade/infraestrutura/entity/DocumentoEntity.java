package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.Entity;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.CanalEnvio;
import jakarta.persistence.Entity;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.DirecaoDocumento;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.FormatoArquivo;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDocumento;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "documento")
public class DocumentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @Column(name = "tipo_documento")
    private String tipoDocumento;

    private String competencia;

    @Column(name = "data_de_vencimento")
    private LocalDate dataDeVencimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "direcao_documento")
    private DirecaoDocumento direcaoDocumento;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_envio")
    private CanalEnvio canalEnvio;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_documento")
    private StatusDocumento statusDocumento;

    @Enumerated(EnumType.STRING)
    @Column(name = "formato_arquivo")
    private FormatoArquivo formatoArquivo;

    @Column(name = "nome_arquivo")
    private String nomeArquivo;

    @Column(name = "url_arquivo")
    private String urlArquivo;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

}