package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence.Document;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidUploadRequestException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UploadFileTooLargeException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.PublicDocumentStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

/**
 * Storage local fora do diretório público da aplicação. Cada solicitação tem
 * seu próprio diretório, identificado pelo ID interno (nunca pelo token).
 */
@Component
public class LocalPublicDocumentStorageAdapter implements PublicDocumentStoragePort {

    private static final String SAFE_FILE_NAME = "[A-Za-z0-9._-]+";

    private final Path root;
    private final long maxBytes;

    public LocalPublicDocumentStorageAdapter(
            @Value("${app.storage.public-documents-dir:./storage/public-requests}") String baseDirectory,
            @Value("${app.storage.public-upload-max-bytes:26214400}") long maxBytes) {
        this.root = Path.of(baseDirectory).toAbsolutePath().normalize();
        this.maxBytes = maxBytes;
    }

    @Override
    public String store(InputStream content, Long requestId, String storedFileName) {
        if (content == null || requestId == null) {
            throw new InvalidUploadRequestException("Arquivo e solicitação são obrigatórios");
        }
        if (storedFileName == null
                || !storedFileName.matches(SAFE_FILE_NAME)
                || storedFileName.contains("..")) {
            throw new InvalidUploadRequestException("Nome de arquivo inválido");
        }

        Path requestDirectory = root.resolve(requestId.toString()).normalize();
        if (!requestDirectory.startsWith(root)) {
            throw new IllegalStateException("Diretório de armazenamento inválido");
        }

        Path target = requestDirectory.resolve(storedFileName).normalize();
        if (!target.getParent().equals(requestDirectory)) {
            throw new InvalidUploadRequestException("Nome de arquivo inválido");
        }

        try {
            Files.createDirectories(requestDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Não foi possível preparar o armazenamento", exception);
        }

        try (InputStream limited = new SizeLimitedInputStream(content, maxBytes);
             OutputStream output = Files.newOutputStream(
                     target, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE)) {
            limited.transferTo(output);
        } catch (UploadFileTooLargeException exception) {
            deleteQuietly(target);
            throw exception;
        } catch (IOException exception) {
            deleteQuietly(target);
            throw new IllegalStateException("Falha ao armazenar arquivo", exception);
        }

        return target.toAbsolutePath().normalize().toString();
    }

    private static void deleteQuietly(Path target) {
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // Não sobrescreve a exceção original.
        }
    }
}
