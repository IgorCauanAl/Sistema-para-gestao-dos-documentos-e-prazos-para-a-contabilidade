package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Document;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.SendChannel;

import java.io.InputStream;
import java.time.LocalDate;

public interface DocumentServicePort {

     Document saveDocument(InputStream fileStream,
                           String originalFileName,
                           Long customerId,
                           String documentType,
                           String competence,
                           LocalDate dueDate,
                           SendChannel sendChannel,
                           DocumentDirection direction,
                           FileFormat fileFormat);

     /** Envia (ou reenvia) o documento, transitando para ENVIADO. */
     Document sendDocument(Long documentId);

     DocumentFile viewDocument(Long documentId);

     DocumentFile downloadDocument(Long documentId);

     record DocumentFile(Document metadata, InputStream content) {}

}
