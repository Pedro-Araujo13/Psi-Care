package com.psicare.psychology.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.boot.autoconfigure.web.WebProperties;

@Data
@Entity
@Table(name = "prontuarios")
public class ProntuarioModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String queixaPrincipal;

    @Column(columnDefinition = "TEXT")
    private String historicoFamiliar;

    @Column(columnDefinition = "TEXT")
    private String observacoesIniciais;

    @Column(columnDefinition = "TEXT")
    private String anotacoesGerais;

    @OneToOne
    @JoinColumn(name = "paciente_id")
    @JsonIgnore
    private PacienteModel paciente;
}
