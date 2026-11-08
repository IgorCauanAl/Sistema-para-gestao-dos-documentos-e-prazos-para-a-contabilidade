package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.Controller;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.Exceções.DocumentoNãoEncontradoException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.DocumentoServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO.Documento.DocumentoResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.DocumentoMapper;
import lombok.AllArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

@RestController
@RequestMapping("/documento")
@AllArgsConstructor
public class DocumentoController {

    private final DocumentoServicePort documentoServicePort;


    @PostMapping
    public ResponseEntity<DocumentoResponseDTO> enviarDocumento(@RequestParam("arquivo") MultipartFile arquivo, @RequestParam ("clienteId") Long clienteId) throws IOException{


        InputStream entradaDoArquivo;
        String nomeDoArquivo = "";

        try{

            entradaDoArquivo = arquivo.getInputStream();

            nomeDoArquivo = arquivo.getOriginalFilename();

            if(nomeDoArquivo == null || nomeDoArquivo.isBlank()){
                throw new IllegalArgumentException("O nome do arquivo não pode ser vazio ou nulo");
            }

           Document document =  documentoServicePort.salvarDocumento(entradaDoArquivo, nomeDoArquivo, clienteId);

            DocumentoResponseDTO dto = DocumentoMapper.toResponseDTO(document);

            URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}/arquivo")
                    .buildAndExpand(dto.getId())
                    .toUri();


            return ResponseEntity.created(uri).body(dto);

        } catch(IOException e ){
            throw new IOException("Falha ao ler o arquivo " + nomeDoArquivo + " '", e );
        }


    }


    @GetMapping("{/{documentoId}/arquivo")
    public  ResponseEntity<Resource>  baixarDocumento(@PathVariable Long documentoId){

        Document document = documentoServicePort.buscarDocumento(documentoId)
                .orElseThrow(() -> new DocumentoNãoEncontradoException(documentoId));
        String nomeDoArquivo = document.getNomeArquivo();

        InputStream carregar = documentoServicePort.carregarArquivo(documentoId);
        Resource resource = new InputStreamResource(carregar);




    }

}
