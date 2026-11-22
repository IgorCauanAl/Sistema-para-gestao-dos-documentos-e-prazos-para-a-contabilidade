package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Dashboard.DTO;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardChartItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardChartsReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardFlowPointReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardSummaryReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard.DashboardChartItemResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard.DashboardChartsResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard.DashboardFlowPointResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Dashboard.DashboardSummaryResponseDTO;

import java.util.List;

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

    public static DashboardChartsResponseDTO toResponseDTO(DashboardChartsReadModel readModel) {
        if (readModel == null) {
            return null;
        }
        return new DashboardChartsResponseDTO(
                toFlowResponseDTOs(readModel.getDocumentFlow()),
                toItemResponseDTOs(readModel.getDocumentsByType()),
                toItemResponseDTOs(readModel.getClientsByPendingStatus()),
                toItemResponseDTOs(readModel.getObligationsByStatus())
        );
    }

    private static List<DashboardFlowPointResponseDTO> toFlowResponseDTOs(
            List<DashboardFlowPointReadModel> points) {
        if (points == null) {
            return List.of();
        }
        return points.stream()
                .map(point -> new DashboardFlowPointResponseDTO(
                        point.getLabel(), point.getSent(), point.getReceived()))
                .toList();
    }

    private static List<DashboardChartItemResponseDTO> toItemResponseDTOs(
            List<DashboardChartItemReadModel> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream()
                .map(item -> new DashboardChartItemResponseDTO(item.getLabel(), item.getValue()))
                .toList();
    }
}
