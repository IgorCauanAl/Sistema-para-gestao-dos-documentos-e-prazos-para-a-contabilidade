package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.exception.DocumentoNãoEncontradoException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.ArmazenadorArquivoPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.DocumentoServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.DocumentoRepositoryPort;

import java.io.InputStream;

public class DocumentoService implements DocumentoServicePort {

    private final DocumentoRepositoryPort documentoRepositoryPort;
    private final ArmazenadorArquivoPort armazenadorArquivoPort;

    public DocumentoService(DocumentoRepositoryPort documentoRepositoryPort, ArmazenadorArquivoPort armazenadorArquivoPort){
        this.documentoRepositoryPort = documentoRepositoryPort;
        this.armazenadorArquivoPort = armazenadorArquivoPort;
    }


    @Override
    public Document salvarDocumento(InputStream arquivoStream, String nomeArquivo, Long clienteId) {

        String caminhoArquivo = armazenadorArquivoPort.storage(arquivoStream, nomeArquivo,clienteId);

        Document document = Document.novo(clienteId, nomeArquivo, caminhoArquivo);


        return documentoRepositoryPort.save(document);


    }

    @Override
    public InputStream carregarArquivo(Long documentoId) {

        Document document = documentoRepositoryPort.findById(documentoId)
                .orElseThrow(() -> new DocumentoNãoEncontradoException(documentoId));

        return armazenadorArquivoPort.load(document.getUrlArquivo());
    }



}
