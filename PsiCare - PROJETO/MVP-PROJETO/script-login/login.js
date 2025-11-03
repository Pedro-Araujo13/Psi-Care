document.addEventListener("DOMContentLoaded", function () {
  // 1. Obter referências aos elementos do formulário de LOGIN
  const formularioLogin = document.querySelector(".login-area form");
  const emailInput = formularioLogin.querySelector('input[type="email"]');
  const senhaInput = formularioLogin.querySelector('input[type="password"]');

  // URL de sucesso (sua área de membros)
  const urlAreaMembros = "index-inicio.html";

  // 2. Adicionar ouvinte para a submissão do Login
  formularioLogin.addEventListener("submit", function (event) {
    event.preventDefault();

    // 3. Obter dados salvos no cadastro
    const savedEmail = localStorage.getItem("userEmail");
    const savedPassword = localStorage.getItem("userPassword");

    // 4. Obter dados digitados no login
    const enteredEmail = emailInput.value;
    const enteredPassword = senhaInput.value;

    // 5. Comparar os dados para simular o login
    if (enteredEmail === savedEmail && enteredPassword === savedPassword) {
      // LOGIN BEM-SUCEDIDO (Simulação)
      alert("Acesso liberado! Redirecionando para a área de membros.");
      window.location.href = urlAreaMembros;
    } else {
      // LOGIN FALHOU
      alert("Erro: E-mail ou senha incorretos. Verifique seus dados.");
    }
  });
});

// Mostrar senha
const senha = document.getElementById("password");
const mostrar = document.getElementById("mostrar");
mostrar.addEventListener("change", () => {
  senha.type = mostrar.checked ? "text" : "password";
});
