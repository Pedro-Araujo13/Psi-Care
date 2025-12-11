package com.psicare.psychology.dtos;
import com.psicare.psychology.enums.Agendamento;
import com.psicare.psychology.enums.FrequenciaSessao;
import com.psicare.psychology.enums.StatusPaciente;

import java.time.LocalDate;
import java.time.LocalTime;


public record CadastroRecordDto (
        //Dados pessoais
        String nome,
        String telefone,
        String email,
        LocalDate dataNascimento,
        StatusPaciente status,

        // Dados Clínicos (Prontuário)
        String queixaPrincipal,
        String historicoFamiliar,
        String observacoesIniciais,
        String anotacoesGerais,

        //Dados de Agendamento
        LocalDate dataSessao,
        LocalTime horarioSessao,
        FrequenciaSessao frequencia
){}
