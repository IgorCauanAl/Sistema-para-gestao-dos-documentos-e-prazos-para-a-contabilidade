package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDeadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.PrazoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataPrazoRepository extends JpaRepository<PrazoEntity, Long> {

    List<PrazoEntity> findByCustomer(Long clienteId);

    List<PrazoEntity> findByStatusAndExpiration(StatusDeadline statusDeadline, LocalDate dataVencimento);

}
