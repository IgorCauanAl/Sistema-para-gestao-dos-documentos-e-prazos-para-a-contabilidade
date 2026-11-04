package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import java.io.InputStream;

public interface ArmazenadorArquivoPort {

    String armazenar(InputStream conteudo, String nomeArquivo, Long clienteId);

    InputStream carregar(String identificador);

}
