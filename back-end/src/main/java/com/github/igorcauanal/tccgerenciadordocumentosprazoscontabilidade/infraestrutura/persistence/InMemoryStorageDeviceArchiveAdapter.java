package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.StorageDeviceArchivePort;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class InMemoryStorageDeviceArchiveAdapter implements StorageDeviceArchivePort {

    private final Map<String, byte[]> storage = new ConcurrentHashMap<>();
    private final AtomicLong counter = new AtomicLong(0);

    @Override
    public String store(InputStream content, String fileName, Long customerId) {
        try {
            byte[] bytes = content.readAllBytes();
            String path = "memory://" + customerId + "/" + counter.incrementAndGet() + "/" + fileName;
            storage.put(path, bytes);
            return path;
        } catch (Exception e) {
            throw new RuntimeException("Falha ao armazenar arquivo", e);
        }
    }

    @Override
    public InputStream load(String storagePath) {
        byte[] bytes = storage.get(storagePath);
        if (bytes == null) {
            throw new IllegalArgumentException("Arquivo não encontrado: " + storagePath);
        }
        return new ByteArrayInputStream(bytes);
    }
}
