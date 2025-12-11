### JAVA COM SPRINGBOOT ###

Sistema de gerenciamento de cursos utilizando SpringBoot para inicializar o servidor

### Descrições/Requisitos para funcionalidades do código
- Java 21
- Postman
- Maeven
- MySQL na porta 3307
- Servidor na porta 8087

Passos seguidos para o desenvolvimento:

### 1. Configurando Servidor com Spring Initialzr 
       - Java 21
       - Versão 3.5.8
       - Project Maeven
       - Language Java
       - .application.yaml
       
### 2. Adicionando Dependências Essenciais no arquivo pom.xml

       - <dependencies>
		<!-- MVC completo --> Model View Controller
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<!-- Validações -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>

		<!-- JPA -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>

		<!-- MySQL -->
		<dependency>
			<groupId>com.mysql</groupId>
			<artifactId>mysql-connector-j</artifactId>
			<scope>runtime</scope>
		</dependency>

		<!-- Lombok -->
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>

		<!-- Testes padrão -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>

	</dependencies>


### 3. Configurar o application.yaml
        - Fazendo alterações devida para subir o servidor

### 4. Padrão de Organização dos projetos
        - Controllers
        - dtos
        - models
        - repositorys
        - services
        - documents
        
### 5. Criação do Model
       - nome
       - id
       - categoria
       - descricao
       - dataCriacao
       - dataAtualizacao
       
### 6. Criação do ENUM
       - DISPONÍVEL
       - INDISPONÍVEL
### 7. Criação do Repository     
       - Vai exportar o JPA
JPA é o Java Persistence API, que vai fazer os dados permanecerem no BD

### 8. Criação do DTO
       - transmitir dados para o BD sem que o model entre em contato direto (funcionando como uma secretária)

### 9. Criação da interface do Service
       - Regras de Negócio
       - função save

### 10. Implementação do Service
       - implementação da função save
       
### 11. Implementação do Controller    
       - @RestController
       - @RequestMapping

Observações para executar o código

### 1. Criar o Banco de Dados com o nome explícitado no código (banco de dados em questão: cursos")
### 2. Observar em qual porta da sua máquina o Banco de Dados está conectado
### 3. Testar no postman a entrada de dados

