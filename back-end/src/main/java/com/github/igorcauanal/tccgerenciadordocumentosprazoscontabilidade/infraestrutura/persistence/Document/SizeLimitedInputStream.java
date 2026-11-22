package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence.Document;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UploadFileTooLargeException;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;

/**
 * Garante o limite durante o streaming, mesmo quando o cliente declara um
 * tamanho menor no cabeçalho multipart.
 */
final class SizeLimitedInputStream extends FilterInputStream {

    private long remaining;

    SizeLimitedInputStream(InputStream in, long maxBytes) {
        super(Objects.requireNonNull(in, "InputStream é obrigatório"));
        this.remaining = maxBytes;
    }

    @Override
    public int read() throws IOException {
        int value = super.read();
        if (value != -1) {
            consume(1);
        }
        return value;
    }

    @Override
    public int read(byte[] buffer, int offset, int length) throws IOException {
        int read = super.read(buffer, offset, length);
        if (read > 0) {
            consume(read);
        }
        return read;
    }

    private void consume(int count) {
        if (count > remaining) {
            throw new UploadFileTooLargeException();
        }
        remaining -= count;
    }
}
