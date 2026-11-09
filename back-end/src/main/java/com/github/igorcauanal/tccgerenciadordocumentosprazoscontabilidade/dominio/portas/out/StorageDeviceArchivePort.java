package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out;

import java.io.InputStream;

public interface ArmazenadorArquivoPort {

    String storage(InputStream conteudo, String nomeArquivo, Long clienteId);

    InputStream load(String identificador);

}
