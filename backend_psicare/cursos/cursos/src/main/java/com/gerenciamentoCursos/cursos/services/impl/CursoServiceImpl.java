package com.gerenciamentoCursos.cursos.services.impl;

import com.gerenciamentoCursos.cursos.dtos.CursoRecordDto;
import com.gerenciamentoCursos.cursos.enums.StatusCurso;
import com.gerenciamentoCursos.cursos.models.CursoModel;
import com.gerenciamentoCursos.cursos.services.CursoService;
import com.gerenciamentoCursos.cursos.repository.CursoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

// Precisa criar o construtoor pra poder chamar o retorno!
// ATIVIDADE -> COMO CRIAR UM SERVICES E CONTROLLER USANDO SPRINGBOOT

public class CursoServiceImpl implements CursoService {

    @Transactional
    @Override
    public CursoModel save(CursoRecordDto cursoRecordDto) {
        var cursoModel = new CursoModel();
        BeanUtils.copyProperties(cursoRecordDto, cursoModel);

        // Define Status e formato padrão

        cursoModel.setCategoria(StatusCurso.DISPONIVEL);

        cursoModel.setDataCriacao(LocalDateTime.now(ZoneId.of("America/Recife")));
        cursoModel.setDataAtualizacao(LocalDateTime.now(ZoneId.of("America/Recife")));


        return
    }
}
