package com.presencaAlunos.siepe.repositorys;

import com.presencaAlunos.siepe.models.SiepeModel;
import org.springframework.data.jpa.repository.JpaRepository;



public interface SiepeRepository extends JpaRepository<SiepeModel, Long> {
}
