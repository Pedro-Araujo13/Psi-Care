package com.psicare.psychology.repositorys;

import com.psicare.psychology.enums.StatusPaciente;
import com.psicare.psychology.models.PacienteModel;
import jdk.jshell.Snippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PacienteRepository extends JpaRepository<PacienteModel, Long> {
    // Busca na barra de pesquisa
    List<PacienteModel> findByNome(String nome);

    // Filtro de Status
    List<PacienteModel> findByStatus(StatusPaciente status);

    //buscar  por nome e filtro
    List<PacienteModel> findByNomeAndStatus(String nome, StatusPaciente status);

    //contagem para o Dashboard
    long countByStatus(StatusPaciente status);

}
