package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.document.DocumentListItemReadModel;

import java.util.List;

public interface DocumentQueryPort {

    List<DocumentListItemReadModel> list(DocumentDirection direction);
}
