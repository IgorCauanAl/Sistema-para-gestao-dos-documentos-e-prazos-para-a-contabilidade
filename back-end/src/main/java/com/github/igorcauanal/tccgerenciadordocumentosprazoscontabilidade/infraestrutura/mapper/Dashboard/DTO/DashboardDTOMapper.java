package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Dashboard.DTO;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.dashboard.DashboardSummaryReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard.DashboardSummaryResponseDTO;

public final class DashboardDTOMapper {

    private DashboardDTOMapper() {
    }

    public static DashboardSummaryResponseDTO toResponseDTO(DashboardSummaryReadModel readModel) {
        if (readModel == null) {
            return null;
        }
        return new DashboardSummaryResponseDTO(
                readModel.getTotalCustomers(),
                readModel.getPendingDocuments(),
                readModel.getOverdueObligations()
        );
    }
}
