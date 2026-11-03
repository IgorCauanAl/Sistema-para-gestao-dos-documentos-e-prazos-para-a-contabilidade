package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.DirecaoDocumento;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.FormatoArquivo;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDocumento;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_cliente")
public class ClienteEntity {

    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long clienteId;

    private String tipoDocumento;

    private String competencia;

    private LocalDateTime dataDeVencimento;

    private DirecaoDocumento direcaoDocumento;

    private StatusDocumento statusDocumento;

    private FormatoArquivo formatoArquivo;

    private String nomeArquivo;

    private String urlArquivo;

    private LocalDateTime criadoEm;


}
