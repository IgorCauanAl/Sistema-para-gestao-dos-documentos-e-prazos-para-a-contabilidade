package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document;

import java.io.InputStream;

/**
 * Armazenamento local isolado por solicitação. O nome recebido já é o nome
 * final (UUID + extensão), gerado pela camada de domínio.
 */
public interface PublicDocumentStoragePort {

    String store(InputStream content, Long requestId, String storedFileName);
}
