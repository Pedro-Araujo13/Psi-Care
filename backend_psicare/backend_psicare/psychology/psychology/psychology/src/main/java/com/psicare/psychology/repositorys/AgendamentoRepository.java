package com.psicare.psychology.repositorys;

import com.psicare.psychology.models.AgendamentoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<AgendamentoModel, Long> {

    //Modal Agendamento do dia
    List<AgendamentoModel> findByData(LocalDate data);

    //Sessões hoje
    long countByData(LocalDate data);

    // conflito de horário
    boolean existsByDataAndHora(LocalDate data, LocalTime hora);

    // histórico do paciente específico
    List<AgendamentoModel> findByPacienteId(Long id);

    // Sessões esta Semana ou intervalo de datas
    List<AgendamentoModel> findByDataBetween(LocalDate dataInicio, LocalDate dataFim);

}
