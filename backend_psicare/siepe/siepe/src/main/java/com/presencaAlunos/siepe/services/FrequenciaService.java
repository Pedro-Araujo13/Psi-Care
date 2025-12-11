package com.presencaAlunos.siepe.services;

import com.presencaAlunos.siepe.dtos.FrequenciaRecordDto;
import com.presencaAlunos.siepe.models.FrequenciaModel;
import com.presencaAlunos.siepe.models.SiepeModel;
import com.presencaAlunos.siepe.repositorys.FrequenciaRepository;
import com.presencaAlunos.siepe.repositorys.SiepeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FrequenciaService {

    @Autowired
    private SiepeRepository siepeRepository;

    @Autowired
    private FrequenciaRepository frequenciaRepository;

    @Transactional
    public FrequenciaModel marcarPresenca(FrequenciaRecordDto dto){
        SiepeModel siepeModel = siepeRepository.findById(dto.alunoId()).orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        FrequenciaModel frequenciaModel = new FrequenciaModel();
        frequenciaModel.setAluno(siepeModel);
        frequenciaModel.setDataAula(dto.dataAula());
        frequenciaModel.setPresenca(dto.presencaTipo());

        return frequenciaRepository.save(frequenciaModel);
    }
}
