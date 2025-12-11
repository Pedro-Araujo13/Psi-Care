package com.psicare.psychology.controllers;

import com.psicare.psychology.dtos.CadastroRecordDto;
import com.psicare.psychology.models.PacienteModel;
import com.psicare.psychology.services.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/paciente")
public class PacienteController {

    @Autowired private PacienteService service;
    //1. Criar
    @PostMapping
    public ResponseEntity<PacienteModel> criar(@RequestBody CadastroRecordDto dto) {
        PacienteModel novoPaciente = service.cadastrarCompleto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoPaciente);
    }
    //2. Listar todos
    @GetMapping
    public ResponseEntity<List<PacienteModel>> listarTodos(){
        List<PacienteModel> lista = service.listarTodos(); // Criar no Service
        return ResponseEntity.status(HttpStatus.OK).body(lista);
    }
    //3. Buscar apenas um (por ID)/(GET com parâmetro)
    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable(value = "id") Long id){
        Optional<PacienteModel> pacienteModel0 = service.buscarPorId(id); //Criar no service
        if (pacienteModel0.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Paciente não encontrado.");
        }
        return ResponseEntity.status(HttpStatus.OK).body(pacienteModel0.get());

    }
    //4. Deletar
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable(value = "id") Long id){
        Optional<PacienteModel> pacienteModel0 = service.buscarPorId(id);
        if (pacienteModel0.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Paciente não encontrado.");
        }
        service.deletar(pacienteModel0.get()); //criar no Service
        return ResponseEntity.status(HttpStatus.OK).body("Paciente deletado com sucesso.");
    }
    //5. (PUT)/Atualizar cadastro completo
    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(@PathVariable(value = "id") Long id,
                                            @RequestBody CadastroRecordDto dto){
        Optional<PacienteModel>pacienteModel0 = service.buscarPorId(id);
        if(pacienteModel0.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Paciente não encontrado.");
        }
        var pacienteEditado  = service.atualizar(pacienteModel0.get(), dto);
        return ResponseEntity.status(HttpStatus.OK).body(pacienteEditado);
    }

    //6. Atualizar parcial (patch)
    @PatchMapping("/{id}")
    public ResponseEntity<Object> atualizarParcial(@PathVariable(value = "id") Long id,
                                                   @RequestBody CadastroRecordDto dto){
        try{
            PacienteModel pacienteAtualizado = service.atualizarParcial(id, dto);
            return ResponseEntity.status(HttpStatus.OK).body(pacienteAtualizado);
        } catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
