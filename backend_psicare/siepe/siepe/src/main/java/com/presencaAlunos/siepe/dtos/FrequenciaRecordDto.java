package com.presencaAlunos.siepe.dtos;

import com.presencaAlunos.siepe.enums.PresencaTipo;

import java.time.LocalDate;

public record FrequenciaRecordDto (
        Long alunoId,
        LocalDate dataAula,
        PresencaTipo presencaTipo
) { }
