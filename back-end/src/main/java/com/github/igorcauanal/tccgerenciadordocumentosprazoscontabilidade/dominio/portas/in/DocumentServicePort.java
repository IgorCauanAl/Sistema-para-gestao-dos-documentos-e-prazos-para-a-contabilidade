package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;

import java.io.InputStream;

public interface DocumentoServicePort {

     Document salvarDocumento(InputStream arquivoStream, String nomeOriginal, Long clienteId);

     InputStream carregarArquivo(Long documentoId);


}
