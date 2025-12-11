package document;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDoc {

    /**
     * Configuração personalizada da documentação OpenAPI para a API do PsiCare.
     *
     * Nesta versão, não utilizamos quaisquer esquemas de segurança,
     * pois o projeto ainda não conta com autenticação via Spring Security.
     *
     * A configuração abaixo define apenas as informações institucionais da API,
     * tornando a documentação mais organizada, profissional e fácil de navegar.
     *
     * @return Instância configurada de {@link OpenAPI}.
     */
    @Bean
    public OpenAPI customOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("API PsiCare")
                        .description("""
                                A API oferece um conjunto abrangente de funcionalidades para o gerenciamento
                                de consultas de psicólgos. O sistema permite cadastro de pacientes, atualização 
                                dos registros a cada econtro, agendamento dinâmico e uma interface bem otimizada
                                para facilitar o uso.
                                """)
                        .contact(new Contact()
                                .name("Equipe de Desenvolvimento – Pedro Araujo e Lucas Anciolly")
                                .email("suporte@psicare.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://psicare.com/api/licenca"))
                )
                .components(new Components());
    }
}

