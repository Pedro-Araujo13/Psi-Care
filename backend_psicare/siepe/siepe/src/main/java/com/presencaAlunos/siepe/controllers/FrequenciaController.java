package com.presencaAlunos.siepe.controllers;

import com.presencaAlunos.siepe.dtos.FrequenciaRecordDto;
import com.presencaAlunos.siepe.models.FrequenciaModel;
import com.presencaAlunos.siepe.repositorys.FrequenciaRepository;
import com.presencaAlunos.siepe.services.FrequenciaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/frequencias")
public class FrequenciaController {

    @Autowired
    private FrequenciaService frequenciaService;

    @Autowired
    private FrequenciaRepository frequenciaRepository;

    @PostMapping
    public ResponseEntity<FrequenciaModel> registrarPresenca(@RequestBody @Valid FrequenciaRecordDto dto){
        FrequenciaModel novaFrequencia = frequenciaService.marcarPresenca(dto);
        return new ResponseEntity<>(novaFrequencia, HttpStatus.CREATED);
    }

    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<FrequenciaModel>> listarPorAluno(@PathVariable Long alunoId){
        List<FrequenciaModel> frequencias;
        frequencias = frequenciaRepository.findById(alunoId); //corrigir o erro no repository
        return ResponseEntity.ok(frequencias);
    }
}
