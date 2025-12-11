package com.presencaAlunos.siepe.services;

import com.presencaAlunos.siepe.dtos.SiepeRecordDto;
import com.presencaAlunos.siepe.models.SiepeModel;

public interface SiepeService {
    SiepeModel save(SiepeRecordDto siepeRecordDto);
}
