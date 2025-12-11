package com.gerenciamentoCursos.cursos.dtos;

import com.gerenciamentoCursos.cursos.enums.StatusCurso;

public record CursoRecordDto(
                Long id,
                String nome,
                StatusCurso categoria,
                String descricao

) {
}
