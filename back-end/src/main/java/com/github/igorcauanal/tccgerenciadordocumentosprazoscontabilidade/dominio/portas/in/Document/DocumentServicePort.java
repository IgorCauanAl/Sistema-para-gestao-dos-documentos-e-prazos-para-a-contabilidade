package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Document;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.SendChannel;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;

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

     DocumentFile viewDocument(Long documentId);

     DocumentFile downloadDocument(Long documentId);

     record DocumentFile(Document metadata, InputStream content) {}

}
