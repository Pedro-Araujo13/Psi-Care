package com.presencaAlunos.siepe.dtos;
import com.presencaAlunos.siepe.enums.AlunoStatus;

import java.time.LocalDate;
import java.util.UUID;

public record SiepeRecordDto (
        UUID id,
        String nome,
        String cpf,
        LocalDate dataNascimento,
        String turma,
        AlunoStatus alunoStatus
){ }
