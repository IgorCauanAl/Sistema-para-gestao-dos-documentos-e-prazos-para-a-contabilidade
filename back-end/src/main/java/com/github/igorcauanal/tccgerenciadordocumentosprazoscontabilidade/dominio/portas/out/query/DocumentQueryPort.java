package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.document.DocumentListItemReadModel;

import java.util.List;

public interface DocumentQueryPort {

    List<DocumentListItemReadModel> list(DocumentDirection direction);
}
