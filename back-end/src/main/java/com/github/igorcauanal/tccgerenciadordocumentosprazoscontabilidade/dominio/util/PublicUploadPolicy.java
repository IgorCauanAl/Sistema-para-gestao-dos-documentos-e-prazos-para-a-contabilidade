package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.FileFormat;

import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Regras puras de validação do upload feito pelo portal público.
 */
public final class PublicUploadPolicy {

    public static final long MAX_FILE_SIZE_BYTES = 25L * 1024 * 1024;

    private static final Map<FileFormat, Set<String>> ALLOWED_MIME_TYPES = Map.of(
            FileFormat.PDF, Set.of("application/pdf"),
            FileFormat.OFX, Set.of("application/x-ofx", "application/ofx", "application/vnd.ofx"),
            FileFormat.XML, Set.of("application/xml", "text/xml", "application/x-xml"),
            FileFormat.XLSX, Set.of(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel"),
            FileFormat.CSV, Set.of("text/csv", "application/csv", "text/plain"),
            FileFormat.TXT, Set.of("text/plain")
    );

    private PublicUploadPolicy() {
    }

    public static boolean isAllowedExtension(String extension) {
        return extension != null && fromExtension(extension) != null;
    }

    public static FileFormat fromExtension(String extension) {
        if (extension == null || extension.isBlank()) {
            return null;
        }
        try {
            return FileFormat.valueOf(extension.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    public static boolean isMimeTypeAllowed(FileFormat format, String contentType) {
        if (format == null || contentType == null || contentType.isBlank()) {
            return false;
        }
        String normalized = contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
        Set<String> allowed = ALLOWED_MIME_TYPES.get(format);
        return allowed != null && allowed.contains(normalized);
    }

    public static String extractExtension(String fileName) {
        if (fileName == null) {
            return null;
        }
        int lastDot = fileName.lastIndexOf('.');
        int lastSlash = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
        if (lastDot < 0 || lastDot <= lastSlash || lastDot == fileName.length() - 1) {
            return null;
        }
        return fileName.substring(lastDot + 1).toLowerCase(Locale.ROOT);
    }
}
