package com.presencaAlunos.siepe.models;

import com.presencaAlunos.siepe.enums.PresencaTipo;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "frequencias")
@Data
public class FrequenciaModel {


    @Column(name = "dataAula", nullable = false)
    private LocalDate dataAula;

    @Enumerated(EnumType.STRING)
    @Column(name = "presenca", nullable = false)
    private PresencaTipo presenca;

    @ManyToOne
    @JoinColumn(name = "aluno_id", nullable = false)

    private SiepeModel aluno;
}
