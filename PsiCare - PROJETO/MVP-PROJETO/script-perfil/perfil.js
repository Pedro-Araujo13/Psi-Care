class GerenciadorUsuario {
    constructor() {
        this.usuario = this.carregarUsuario() || this.criarUsuarioPadrao();
        this.atualizarAvatares();
    }

    criarUsuarioPadrao() {
        const usuarioPadrao = {
            id: 1,
            nome: "Psicólogo Silva",
            dataNascimento: "15/05/1985",
            email: "psicologo.silva@psicare.com",
            telefone: "(11) 99999-9999",
            iniciais: "PS"
        };
        this.salvarUsuario(usuarioPadrao);
        return usuarioPadrao;
    }

    gerarIniciais(nomeCompleto) {
        if (!nomeCompleto || nomeCompleto.trim() === '') return 'US';
        return nomeCompleto
            .trim()
            .split(' ')
            .map(nome => nome[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    atualizarUsuario(dados) {
        this.usuario = {
            ...this.usuario,
            ...dados,
            iniciais: this.gerarIniciais(dados.nome || this.usuario.nome)
        };
        this.salvarUsuario(this.usuario);
        this.atualizarAvatares();
        return this.usuario;
    }

    atualizarAvatares() {
        const avatarHeader = document.querySelector('.avatar_usuario');
        if (avatarHeader) {
            avatarHeader.textContent = this.usuario.iniciais;
            avatarHeader.setAttribute('title', this.usuario.nome);
        }
        
        const avatarGrande = document.querySelector('.iniciais');
        if (avatarGrande) {
            avatarGrande.textContent = this.usuario.iniciais;
        }
    }

    salvarUsuario(usuario) {
        localStorage.setItem('psicare_usuario', JSON.stringify(usuario));
    }

    carregarUsuario() {
        const usuarioSalvo = localStorage.getItem('psicare_usuario');
        return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    }

    getUsuario() {
        return this.usuario;
    }
}

const gerenciadorUsuario = new GerenciadorUsuario();

const formPerfil = document.getElementById('form-perfil');
const formSenha = document.getElementById('form-senha');
const modal = document.getElementById('modal-confirmacao');
const fecharModal = document.getElementById('fechar-modal');
const alterarFotoBtn = document.getElementById('alterar-foto');
const cancelarBtn = document.getElementById('cancelar');
const avatarUsuario = document.querySelector('.avatar_usuario');
const menuUsuario = document.querySelector('.menu_usuario');

function navegarPara(pagina) {
    window.location.href = pagina;
}

function fazerLogout() {
    localStorage.removeItem('psicare_usuario');
    localStorage.removeItem('psicare_logado');
    alert('Você foi desconectado com sucesso!');
    navegarPara('index-login.html');
}

function inicializarFormulario() {
    const usuario = gerenciadorUsuario.getUsuario();
    document.getElementById('nome-completo').value = usuario.nome;
    document.getElementById('data-nascimento').value = usuario.dataNascimento;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefone').value = usuario.telefone;
}

function validarData(data) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(data)) return false;
    const [, dia, mes, ano] = data.match(regex);
    const dataObj = new Date(ano, mes - 1, dia);
    return dataObj.getDate() == dia && dataObj.getMonth() == mes - 1 && dataObj.getFullYear() == ano;
}

document.getElementById('data-nascimento').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
    if (value.length >= 5) value = value.substring(0, 5) + '/' + value.substring(5, 9);
    e.target.value = value;
});

formPerfil.addEventListener('submit', function(e) {
    e.preventDefault();
    const dados = {
        nome: document.getElementById('nome-completo').value.trim(),
        dataNascimento: document.getElementById('data-nascimento').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.trim()
    };
    
    if (!dados.nome) {
        alert('Por favor, preencha o nome completo.');
        return;
    }
    if (!validarData(dados.dataNascimento)) {
        alert('Por favor, insira uma data válida no formato dd/mm/aaaa.');
        return;
    }
    if (!dados.email) {
        alert('Por favor, preencha o e-mail.');
        return;
    }
    
    gerenciadorUsuario.atualizarUsuario(dados);
    modal.style.display = 'flex';
});

formSenha.addEventListener('submit', function(e) {
    e.preventDefault();
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    
    if (!senhaAtual) {
        alert('Por favor, digite sua senha atual.');
        return;
    }
    if (!novaSenha) {
        alert('Por favor, digite a nova senha.');
        return;
    }
    if (novaSenha.length < 6) {
        alert('A nova senha deve ter pelo menos 6 caracteres.');
        return;
    }
    if (novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem. Por favor, digite novamente.');
        return;
    }
    
    formSenha.reset();
    modal.style.display = 'flex';
});

alterarFotoBtn.addEventListener('click', function() {
    alert('Funcionalidade de alteração de foto será implementada em breve!');
});

cancelarBtn.addEventListener('click', function() {
    if (confirm('Descartar alterações não salvas?')) {
        inicializarFormulario();
    }
});

fecharModal.addEventListener('click', function() {
    modal.style.display = 'none';
});

if (avatarUsuario) {
    avatarUsuario.addEventListener('click', function() {
        if (menuUsuario) {
            menuUsuario.style.display = menuUsuario.style.display === 'flex' ? 'none' : 'flex';
        }
    });
}

document.addEventListener('click', function(e) {
    if (avatarUsuario && menuUsuario) {
        if (!avatarUsuario.contains(e.target) && !menuUsuario.contains(e.target)) {
            menuUsuario.style.display = 'none';
        }
    }
});

if (menuUsuario) {
    document.querySelectorAll('.menu_usuario p').forEach(item => {
        item.addEventListener('click', function() {
            const acao = this.textContent.trim();
            if (acao === 'Meu Perfil') {
                console.log('Já está na página de perfil');
            } else if (acao === 'Sair') {
                if (confirm('Tem certeza que deseja sair?')) {
                    fazerLogout();
                }
            }
            if (menuUsuario) menuUsuario.style.display = 'none';
        });
    });
}

document.querySelectorAll('.barralateral li').forEach(item => {
    item.addEventListener('click', function() {
        const pagina = this.textContent.trim();
        if (pagina.includes('Início')) {
            navegarPara('index-inicio.html');
        } else if (pagina.includes('Agenda')) {
            navegarPara('index-agenda.html');
        } else if (pagina.includes('Meu Perfil')) {
            console.log('Já está no Meu Perfil');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    setTimeout(() => gerenciadorUsuario.atualizarAvatares(), 100);
});