package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Documento;



public interface DcumentoRepositoryPort {

    Documento salvar(Documento documento);

    

}
