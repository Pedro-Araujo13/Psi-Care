package com.presencaAlunos.siepe.repositorys;

import com.presencaAlunos.siepe.models.FrequenciaModel;
import org.hibernate.mapping.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FrequenciaRepository extends JpaRepository<FrequenciaModel, Long> {

    //adicionar o método

}
