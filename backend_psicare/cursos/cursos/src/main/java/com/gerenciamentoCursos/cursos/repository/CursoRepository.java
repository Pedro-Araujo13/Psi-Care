package com.gerenciamentoCursos.cursos.repository;

import com.gerenciamentoCursos.cursos.models.CursoModel;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CursoRepository extends JpaRepository<CursoModel, Long> {
}
