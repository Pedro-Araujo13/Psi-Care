package com.psicare.psychology.repositorys;

import com.psicare.psychology.models.ProntuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProntuarioRepository extends JpaRepository<ProntuarioModel, Long> {

    Optional<ProntuarioModel> findByPacienteId(Long pacienteId);
}
