package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document;
import java.io.InputStream;

public interface StorageDeviceArchivePort {

    String store(InputStream content, String fileName, Long customerId);

    InputStream load(String storagePath);
}