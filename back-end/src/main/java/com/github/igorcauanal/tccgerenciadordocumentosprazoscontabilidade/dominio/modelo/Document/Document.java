package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.BusinessException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.SendChannel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.StatusDocument;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

public class Document {

    private Long id;
    private Long customerId;
    private String documentType;
    private String competence;
    private LocalDate dueDate;
    private DocumentDirection direction;
    private SendChannel sendChannel;
    private StatusDocument status;
    private FileFormat fileFormat;
    private String fileName;
    private String storagePath;
    private LocalDateTime createdIn;

    private Document() {
    }

    //Fábrica
    public static Document create(Long customerId,
                                  String documentType,
                                  String competence,
                                  LocalDate dueDate,
                                  SendChannel sendChannel,
                                  DocumentDirection direction,
                                  FileFormat fileFormat,
                                  String fileName,
                                  String storagePath) {

        if (customerId == null) {
            throw new BusinessException("Cliente é obrigatório");
        }
        if (documentType == null || documentType.isBlank()) {
            throw new BusinessException("Tipo do documento é obrigatório");
        }
        if (competence == null || competence.isBlank()) {
            throw new BusinessException("Competência é obrigatória");
        }
        if (sendChannel == null) {
            throw new BusinessException("Canal de envio é obrigatório");
        }
        if (direction == null) {
            throw new BusinessException("Direção é obrigatória");
        }
        if (fileFormat == null) {
            throw new BusinessException("Formato do arquivo é obrigatório");
        }
        if (fileName == null || fileName.isBlank()) {
            throw new BusinessException("Nome do arquivo é obrigatório");
        }
        if (storagePath == null || storagePath.isBlank()) {
            throw new BusinessException("Identificador de armazenamento é obrigatório");
        }
        if (!isAllowedFormat(fileName, fileFormat)) {
            throw new BusinessException(
                    "Formato não permitido. Aceitos: PDF, OFX, XML, XLSX, CSV, TXT");
        }

        Document d = new Document();
        d.customerId = customerId;
        d.documentType = documentType;
        d.competence = competence;
        d.dueDate = dueDate;
        d.sendChannel = sendChannel;
        d.direction = direction;
        d.fileFormat = fileFormat;
        d.fileName = fileName;
        d.storagePath = storagePath;
        d.status = StatusDocument.CRIADO;
        d.createdIn = LocalDateTime.now();
        return d;
    }

    //Rebuild para o mapper
    public static Document rebuild(Long id,
                                     Long customerId,
                                     String documentType,
                                     String competence,
                                     LocalDate dueDate,
                                     DocumentDirection direction,
                                     SendChannel sendChannel,
                                     StatusDocument status,
                                     FileFormat fileFormat,
                                     String fileName,
                                     String storagePath,
                                     LocalDateTime createdIn) {
        Document d = new Document();
        d.id = id;
        d.customerId = customerId;
        d.documentType = documentType;
        d.competence = competence;
        d.dueDate = dueDate;
        d.direction = direction;
        d.sendChannel = sendChannel;
        d.status = status;
        d.fileFormat = fileFormat;
        d.fileName = fileName;
        d.storagePath = storagePath;
        d.createdIn = createdIn;
        return d;
    }

    private static boolean isAllowedFormat(String fileName, FileFormat fileFormat) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0) {
            return false;
        }
        String extension = fileName.substring(dot + 1).toUpperCase(Locale.ROOT);
        return extension.equals(fileFormat.name());
    }

    // Métodos semânticos de transição de estado

    public void markAsSent() {
        if (status != StatusDocument.CRIADO) {
            throw new BusinessException(
                    "Só é possível enviar documento com status Criado. Atual: " + status);
        }
        this.status = StatusDocument.CRIADO.ENVIADO;
    }

    public void markAsViewed() {
        if (status == StatusDocument.CRIADO) {
            throw new BusinessException("Documento ainda não foi enviado");
        }
        if (status == StatusDocument.BAIXADO) {
            return;
        }
        this.status = StatusDocument.VISUALIZADO;
    }

    public void markAsDownloaded() {
        if (status == StatusDocument.CRIADO) {
            throw new BusinessException("Documento ainda não foi enviado");
        }
        this.status = StatusDocument.BAIXADO;
    }


    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public String getDocumentType() { return documentType; }
    public String getCompetence() { return competence; }
    public LocalDate getDueDate() { return dueDate; }
    public DocumentDirection getDirection() { return direction; }
    public SendChannel getSendChannel() { return sendChannel; }
    public StatusDocument getStatus() { return status; }
    public FileFormat getFileFormat() { return fileFormat; }
    public String getFileName() { return fileName; }
    public String getStoragePath() { return storagePath; }
    public LocalDateTime getCreatedIn() { return createdIn; }
}