package com.presencaAlunos.siepe.services.impl;

import com.presencaAlunos.siepe.dtos.SiepeRecordDto;
import com.presencaAlunos.siepe.enums.AlunoStatus;
import com.presencaAlunos.siepe.models.SiepeModel;
import com.presencaAlunos.siepe.repositorys.SiepeRepository;
import com.presencaAlunos.siepe.services.SiepeService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;


@Service
public class SiepeServiceImpl implements SiepeService {

    Logger logger = LogManager.getLogger(SiepeServiceImpl.class);

    final SiepeRepository siepeRepository;

    public SiepeServiceImpl(SiepeRepository siepeRepository){
        this.siepeRepository = siepeRepository;
    }

    @Transactional
    @Override
    public SiepeModel save (SiepeRecordDto siepeRecordDto){
        var siepeModel = new SiepeModel();
        BeanUtils.copyProperties(siepeRecordDto, siepeModel);

        siepeModel.setAlunoStatus(AlunoStatus.FREQUENTE);
        siepeModel.setDataCriacao(LocalDateTime.now(ZoneId.of("America/Recife")));
        siepeModel.setDataAtualizacao(LocalDateTime.now(ZoneId.of("America/Recife")));

        return siepeRepository.save(siepeModel);
    }
}
