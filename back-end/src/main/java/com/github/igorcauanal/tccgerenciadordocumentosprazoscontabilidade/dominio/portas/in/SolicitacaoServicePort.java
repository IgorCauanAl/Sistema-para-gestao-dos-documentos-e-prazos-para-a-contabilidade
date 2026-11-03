package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Documento;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Solicitacao;

import java.io.InputStream;

public class SolicitacaoPort {

    Solicitacao criarSolicitacao(Solicitacao solicitacao)

    Documento responserSolicitacao(Long solicitacaoId, InputStream arquivoStream, String nomeOriginal)

}
