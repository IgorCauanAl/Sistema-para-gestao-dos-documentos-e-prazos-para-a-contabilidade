package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.Entity.ClienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpringDataClienteRepository extends JpaRepository<ClienteEntity, Long> {


    Optional<ClienteEntity> buscarPorCnpj (String cnpj);

}
