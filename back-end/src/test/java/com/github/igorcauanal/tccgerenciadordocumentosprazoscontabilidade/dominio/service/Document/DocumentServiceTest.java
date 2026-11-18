package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Document;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.SendChannel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.DocumentRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.StorageDeviceArchivePort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepositoryPort documentRepositoryPort;

    @Mock
    private StorageDeviceArchivePort storageDeviceArchivePort;

    @InjectMocks
    private DocumentService documentService;

    @Test
    void saveDocumentShouldThrowWhenFileIsNull() {
        assertThrows(IllegalArgumentException.class, () -> documentService.saveDocument(
                null, "arquivo.pdf", 1L, "Guia", "09/2026", null,
                SendChannel.WHATSAPP, DocumentDirection.ENVIADO_AO_CLIENTE, FileFormat.PDF
        ));
        verifyNoInteractions(storageDeviceArchivePort, documentRepositoryPort);
    }

    @Test
    void saveDocumentShouldThrowWhenFileNameIsBlank() {
        InputStream stream = new ByteArrayInputStream("conteudo".getBytes());

        assertThrows(IllegalArgumentException.class, () -> documentService.saveDocument(
                stream, "   ", 1L, "Guia", "09/2026", null,
                SendChannel.WHATSAPP, DocumentDirection.ENVIADO_AO_CLIENTE, FileFormat.PDF
        ));
        verifyNoInteractions(storageDeviceArchivePort, documentRepositoryPort);
    }

    @Test
    void saveDocumentShouldStoreAndSave() {
        InputStream stream = new ByteArrayInputStream("conteudo".getBytes());
        when(storageDeviceArchivePort.store(any(InputStream.class), anyString(), any())).thenReturn("storage/path.pdf");
        when(documentRepositoryPort.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Document result = documentService.saveDocument(
                stream, "guia.pdf", 1L, "Guia", "09/2026", LocalDate.of(2026, 10, 15),
                SendChannel.WHATSAPP, DocumentDirection.ENVIADO_AO_CLIENTE, FileFormat.PDF
        );

        assertNotNull(result);
        assertEquals("guia.pdf", result.getFileName());
        assertEquals("storage/path.pdf", result.getStoragePath());
        verify(storageDeviceArchivePort).store(any(InputStream.class), eq("guia.pdf"), eq(1L));
        verify(documentRepositoryPort).save(any(Document.class));
    }

    @Test
    void viewDocumentShouldThrowWhenNotFound() {
        when(documentRepositoryPort.findById(99L)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> documentService.viewDocument(99L));
    }

    @Test
    void viewDocumentShouldMarkAsViewedAndLoadContent() throws Exception {
        Document document = Document.create(
                1L, "Guia", "09/2026", null, SendChannel.WHATSAPP, DocumentDirection.ENVIADO_AO_CLIENTE,
                FileFormat.PDF, "guia.pdf", "storage/path.pdf"
        );
        document.markAsSent();
        when(documentRepositoryPort.findById(1L)).thenReturn(Optional.of(document));
        when(documentRepositoryPort.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageDeviceArchivePort.load("storage/path.pdf")).thenReturn(new ByteArrayInputStream("conteudo".getBytes()));

        DocumentService.DocumentFile result = documentService.viewDocument(1L);

        assertNotNull(result);
        assertEquals(document, result.metadata());
        verify(documentRepositoryPort).save(document);
        verify(storageDeviceArchivePort).load("storage/path.pdf");
    }

    @Test
    void downloadDocumentShouldMarkAsDownloadedAndLoadContent() throws Exception {
        Document document = Document.create(
                1L, "Guia", "09/2026", null, SendChannel.WHATSAPP, DocumentDirection.ENVIADO_AO_CLIENTE,
                FileFormat.PDF, "guia.pdf", "storage/path.pdf"
        );
        document.markAsSent();
        when(documentRepositoryPort.findById(1L)).thenReturn(Optional.of(document));
        when(documentRepositoryPort.save(any(Document.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageDeviceArchivePort.load("storage/path.pdf")).thenReturn(new ByteArrayInputStream("conteudo".getBytes()));

        DocumentService.DocumentFile result = documentService.downloadDocument(1L);

        assertNotNull(result);
        assertEquals(document, result.metadata());
        verify(documentRepositoryPort).save(document);
        verify(storageDeviceArchivePort).load("storage/path.pdf");
    }

    @Test
    void listDocumentsShouldReturnAllWhenDirectionIsNull() {
        when(documentRepositoryPort.findAll()).thenReturn(List.of());

        assertTrue(documentService.listDocuments(null).isEmpty());
        verify(documentRepositoryPort).findAll();
        verify(documentRepositoryPort, never()).findByDirection(any());
    }

    @Test
    void listDocumentsShouldFilterByDirection() {
        when(documentRepositoryPort.findByDirection(DocumentDirection.ENVIADO_AO_CLIENTE)).thenReturn(List.of());

        assertTrue(documentService.listDocuments(DocumentDirection.ENVIADO_AO_CLIENTE).isEmpty());
        verify(documentRepositoryPort).findByDirection(DocumentDirection.ENVIADO_AO_CLIENTE);
        verify(documentRepositoryPort, never()).findAll();
    }
}
