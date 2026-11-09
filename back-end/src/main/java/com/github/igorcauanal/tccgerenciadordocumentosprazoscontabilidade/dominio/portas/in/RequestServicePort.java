package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request;

import java.io.InputStream;

public interface SolicitationServicePort {

    Request criarSolicitacao(Request request);

    Document responserSolicitacao(Long solicitacaoId, InputStream arquivoStream, String nomeOriginal);

}
