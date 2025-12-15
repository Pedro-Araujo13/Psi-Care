PsiCare

PsiCare é um sistema de gerenciamento de consultas e pacientes de profissionais da psicologia.

Este sistema visa otimizar a rotina de psicólogos, centralizando informações de prontuários, agendamentos e dados cadastrais em uma interface acessível e segura.
Funcionalidades Principais

O sistema oferece as seguintes funcionalidades:

    Gestão de Pacientes: Cadastro completo de pacientes, permitindo manter o registro de informações pessoais e status do tratamento.

    Prontuário Eletrônico: Registro detalhado das descrições de cada sessão ou encontro entre o profissional e o paciente.

    Agendamento de Sessões: Controle de horários e agendamentos.

    Painel do Profissional: Dashboard inicial para visão geral do dia ou da semana.

    Controle de Acesso: Sistema de Login, Registro de novos profissionais e Recuperação de Senha.


Tecnologias Utilizadas
Backend (API)

O servidor é construído em Java utilizando o framework Spring Boot.

    Java: Linguagem principal.

    Spring Boot: Framework para criação da API REST.

    Maven: Gerenciamento de dependências e build.

    Banco de Dados: Configurado via JPA/Hibernate (detalhes no application.yaml).

Frontend (Interface Web)

A interface é construída com tecnologias web padrão, focada na usabilidade.

    HTML5 & CSS3: Estrutura e estilização das páginas (Login, Perfil, Agenda).

    JavaScript: Lógica de interação no cliente e comunicação com a API.

Estrutura do Repositório

O projeto está organizado em dois diretórios principais:

    PsiCare - PROJETO/MVP-PROJETO: Contém todo o código do Frontend (telas HTML, estilos CSS e scripts JS).

    backend_psicare: Contém os serviços do Backend (código Java/Spring Boot), incluindo o módulo principal psychology.

Como Executar o Projeto
Pré-requisitos

    Java JDK 17 ou superior.

    Maven instalado (ou utilize o wrapper mvnw incluído no projeto).

    Navegador Web.

Passo 1: Executar o Backend

O serviço principal de psicologia deve ser iniciado para que o sistema funcione.

    No terminal, navegue até a pasta do módulo principal: cd backend_psicare/backend_psicare/psychology/psychology/psychology

    Execute a aplicação:

        Windows: .\mvnw.cmd spring-boot:run

        Linux/Mac: ./mvnw spring-boot:run

Passo 2: Acessar o Frontend

Como o frontend é desacoplado (arquivos estáticos), você pode abri-lo diretamente ou usar um servidor simples.

    Navegue até a pasta PsiCare - PROJETO/MVP-PROJETO.

    Abra o arquivo index-login.html no seu navegador para iniciar o fluxo de uso.


