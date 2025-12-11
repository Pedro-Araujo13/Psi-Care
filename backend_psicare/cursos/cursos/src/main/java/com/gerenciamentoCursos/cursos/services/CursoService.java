package com.gerenciamentoCursos.cursos.services;

import com.gerenciamentoCursos.cursos.models.CursoModel;
import com.gerenciamentoCursos.cursos.dtos.CursoRecordDto;

public interface CursoService {

    CursoModel save(CursoRecordDto cursoRecordDto);
}
