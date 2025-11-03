document.addEventListener("DOMContentLoaded", function () {
  // 1. Obter referências aos elementos do formulário de CADASTRO
  const formulario = document.querySelector(".formulair");

  // Referências aos campos de Senha
  const senhaUm = document.getElementById("password-one");
  const senhaDois = document.getElementById("password-two");
  const mensagemErroSenha = document.getElementById("password-error-message");

  // Referências aos campos de E-mail
  const emailInput = document.getElementById("email-input");
  const mensagemErroEmail = document.getElementById("email-error-message");

  // Referências aos Controles (Checkbox e Botão de Envio)
  const termosCheckbox = document.querySelector(".checkbox");
  const botaoCriarConta = document.querySelector(".button-create");

  // Variável para a página de destino (LOGIN)
  const urlPaginaLogin = "index-login.html"; // Redireciona para a página de login

  // --------------------------------------------------------
  // A. FUNÇÃO DE VALIDAÇÃO DE E-MAIL
  // --------------------------------------------------------
  function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }

  function verificarEmail() {
    const email = emailInput.value;
    if (email.length > 0 && !validarEmail(email)) {
      mensagemErroEmail.style.display = "block";
      return false;
    } else {
      mensagemErroEmail.style.display = "none";
      return true;
    }
  }

  // --------------------------------------------------------
  // B. FUNÇÃO DE VALIDAÇÃO DE SENHAS
  // --------------------------------------------------------
  function verificarSenhas() {
    if (senhaUm.value && senhaDois.value && senhaUm.value !== senhaDois.value) {
      mensagemErroSenha.style.display = "block";
      return false;
    } else {
      mensagemErroSenha.style.display = "none";
      return true;
    }
  }

  // --------------------------------------------------------
  // C. FUNÇÃO PARA CONTROLAR O BOTÃO (UNIFICA TODAS AS VALIDAÇÕES)
  // --------------------------------------------------------
  function controlarBotao() {
    const todosPreenchidos = formulario.checkValidity();
    const validacoesAprovadas = verificarEmail() && verificarSenhas();
    const termosAceitos = termosCheckbox.checked;

    if (todosPreenchidos && validacoesAprovadas && termosAceitos) {
      botaoCriarConta.disabled = false;
    } else {
      botaoCriarConta.disabled = true;
    }
  }

  // --------------------------------------------------------
  // D. ADICIONANDO OS OUVINTES (LISTENERS)
  // --------------------------------------------------------

  emailInput.addEventListener("input", controlarBotao);
  senhaDois.addEventListener("input", controlarBotao);
  termosCheckbox.addEventListener("change", controlarBotao);

  const todosInputs = formulario.querySelectorAll(
    'input:not([type="checkbox"]):not([type="submit"])'
  );
  todosInputs.forEach((input) =>
    input.addEventListener("input", controlarBotao)
  );

  // --------------------------------------------------------
  // E. AÇÃO DE SUBMISSÃO (SUCESSO, SALVAMENTO E REDIRECIONAMENTO)
  // ESTE BLOCO AGORA INCLUI O SALVAMENTO NO LOCALSTORAGE
  // --------------------------------------------------------

  formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    // Revalidações finais
    const validacoesFinaisOK = !botaoCriarConta.disabled;

    if (validacoesFinaisOK) {
      // **1. SALVA OS DADOS NO NAVEGADOR**
      localStorage.setItem("userEmail", emailInput.value);
      localStorage.setItem("userPassword", senhaUm.value); // **ATENÇÃO: Não use isto em produção real!**

      // **2. SIMULA O SUCESSO E REDIRECIONA**
      alert(
        "Conta criada com sucesso! Você será redirecionado para a página de login."
      );

      setTimeout(function () {
        window.location.href = urlPaginaLogin;
      }, 1000);
    } else {
      alert("Por favor, preencha e corrija todos os campos obrigatórios.");
    }
  });

  // Configuração inicial
  controlarBotao();
});
