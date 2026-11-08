package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.CanalEnvio;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.DirecaoDocumento;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.FormatoArquivo;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDocumento;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DocumentoResponseDTO {

    private Long id;

    private Long clienteId;

    private String tipoDocumento;

    private String competencia;

    private LocalDate dataVencimento;

    private CanalEnvio canal;

    private DirecaoDocumento direcao;

    private StatusDocumento status;

    private String nomeArquivo;

    private String urlArquivo;

    private FormatoArquivo formatoArquivo;

    private LocalDateTime criadoEm;

}
