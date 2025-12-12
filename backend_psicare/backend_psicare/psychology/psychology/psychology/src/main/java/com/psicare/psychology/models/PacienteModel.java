package com.psicare.psychology.models;

import com.psicare.psychology.enums.FrequenciaSessao;
import com.psicare.psychology.enums.StatusPaciente;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "pacientes")
public class PacienteModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String telefone;

    @Enumerated(EnumType.STRING)
    private StatusPaciente status;
    private FrequenciaSessao frequencia;

    private LocalDate dataNascimento;

    @CreationTimestamp
    private LocalDateTime dataCriacao;

    @CreationTimestamp
    private LocalDateTime dataAtualizacao;

    @OneToOne(mappedBy = "paciente", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private ProntuarioModel prontuario;

    @OneToMany(mappedBy = "paciente", fetch = FetchType.EAGER)
    private List<AgendamentoModel> agendamento;



}
