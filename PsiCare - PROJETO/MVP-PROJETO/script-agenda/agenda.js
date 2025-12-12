class GerenciadorUsuario {
    constructor() {
        this.usuario = this.carregarUsuario() || this.criarUsuarioPadrao();
        this.atualizarAvatarCabecalho();
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
        return nomeCompleto.trim().split(' ').map(nome => nome[0]).join('').substring(0, 2).toUpperCase();
    }

    atualizarUsuario(dados) {
        this.usuario = {...this.usuario, ...dados, iniciais: this.gerarIniciais(dados.nome || this.usuario.nome)};
        this.salvarUsuario(this.usuario);
        this.atualizarAvatarCabecalho();
        return this.usuario;
    }

    atualizarAvatarCabecalho() {
        const avatarCabecalho = document.querySelector('.avatar_usuario');
        if (avatarCabecalho) {
            avatarCabecalho.textContent = this.usuario.iniciais;
            avatarCabecalho.setAttribute('title', this.usuario.nome);
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

// --- CONFIGURAÇÃO DA API ---
const API_URL = "http://localhost:8087/psicare/paciente";

const gerenciadorUsuario = new GerenciadorUsuario();

const modalAgendamento = document.getElementById('modal-agendamento');
const modalAgendamentosDia = document.getElementById('modal-agendamentos-dia');
const botaoAbrirModal = document.getElementById('abrir-modal');
const mesAnoElemento = document.getElementById('mes-ano');
const diasMesElemento = document.getElementById('dias-mes');
const botaoAnterior = document.getElementById('botao-anterior');
const botaoProximo = document.getElementById('botao-proximo');
const inputBuscarPaciente = document.getElementById('buscar-paciente');
const listaPacientesModal = document.getElementById('lista-pacientes-modal');
const listaAgendamentosDia = document.getElementById('lista-agendamentos-dia');
const tituloAgendamentosDia = document.getElementById('titulo-agendamentos-dia');

let agendamentos = [];
let pacientes = [];
let pacienteSelecionado = null;
let dataAtual = new Date();
let mesAtual = dataAtual.getMonth();
let anoAtual = dataAtual.getFullYear();
let dataSelecionada = null;

const nomeMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const coresAvatar = [
    'linear-gradient(135deg, #91eac7, #2ca77a)',
    'linear-gradient(135deg, #a8c0ff, #6a93cb)',
    'linear-gradient(135deg, #ff9a9e, #fad0c4)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
    'linear-gradient(135deg, #d4fc79, #96e6a1)',
    'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    'linear-gradient(135deg, #fdcbf1, #e6dee9)',
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #ffd1ff, #fad0c4)'
];

function navegarPara(pagina) {
    window.location.href = pagina;
}

function navegarParaPerfil() {
    navegarPara('index-perfil.html');
}

function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('psicare_usuario');
        navegarPara('index-login.html');
    }
}

function inicializarNavegacao() {
    document.querySelectorAll('.barralateral li').forEach(item => {
        item.addEventListener('click', function() {
            const texto = this.textContent.trim();
            
            if (texto.includes('Início')) {
                navegarPara('index-inicio.html');
            } else if (texto.includes('Agenda')) {
                console.log('Já está na Agenda');
            }
        });
    });

    const avatarUsuario = document.querySelector('.avatar_usuario');
    const menuUsuario = document.querySelector('.menu_usuario');
    
    if (avatarUsuario && menuUsuario) {
        avatarUsuario.addEventListener('click', function(e) {
            e.stopPropagation();
            menuUsuario.style.display = menuUsuario.style.display === 'flex' ? 'none' : 'flex';
        });
        
        document.addEventListener('click', function(e) {
            if (!avatarUsuario.contains(e.target) && !menuUsuario.contains(e.target)) {
                menuUsuario.style.display = 'none';
            }
        });
        
        document.querySelectorAll('.menu_usuario p').forEach(item => {
            item.addEventListener('click', function() {
                const acao = this.textContent.trim();
                if (acao === 'Meu Perfil') {
                    navegarParaPerfil();
                } else if (acao === 'Sair') {
                    fazerLogout();
                }
                menuUsuario.style.display = 'none';
            });
        });
    }
}

// --- CORREÇÃO AQUI: Carrega pacientes da API Java ---
function carregarPacientes() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            pacientes = data; // Atualiza lista local
            if (modalAgendamento.style.display === "block") {
                renderizarListaPacientes(inputBuscarPaciente.value);
            }
        })
        .catch(err => console.error("Erro ao carregar pacientes:", err));
}

// --- CORREÇÃO AQUI: Carrega agendamentos da API Java ---
function carregarAgendamentos() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            agendamentos = []; // Limpa lista local

            // Percorre cada paciente vindo do banco
            data.forEach(paciente => {
                // Se o paciente tiver agendamentos
                if (paciente.agendamento && paciente.agendamento.length > 0) {
                    paciente.agendamento.forEach(ag => {
                        // Adiciona ao array global da agenda
                        agendamentos.push({
                            id: ag.id,
                            pacienteId: paciente.id,
                            nome: paciente.nome,
                            telefone: paciente.telefone || '',
                            data: ag.data, // Já vem no formato yyyy-mm-dd do Java
                            hora: ag.hora
                        });
                    });
                }
            });

            renderizarCalendario(); // Atualiza o calendário
        })
        .catch(erro => console.error("Erro ao carregar agenda:", erro));
}

function salvarAgendamentos() {
    // Agora salvamos via API na criação/edição, não mais no LocalStorage geral.
    // Mantemos vazio ou implementamos lógica de PUT se necessário futuramente.
    // Por enquanto, apenas atualizamos a visualização.
}

// Funções auxiliares mantidas, mas sem salvar no localStorage do paciente
function atualizarPacienteComAgendamento(pacienteId, data, hora) {
    // Apenas visual, pois o dado real já está no banco via API
}

function removerAgendamentoDoPaciente(pacienteId, data, hora) {
    // Apenas visual
}

function gerarIniciais(nome) {
   if (!nome || nome.trim() === '') return 'US';
   return nome.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function gerarCorAvatar(iniciais) {
    const indice = (iniciais.charCodeAt(0) + (iniciais.charCodeAt(1) || 0)) % coresAvatar.length;
    return coresAvatar[indice];
}

function renderizarListaPacientes(termoBusca = '') {
    listaPacientesModal.innerHTML = '';
    
    // Tratamento para garantir que pacientes existam e tenham nome
    if(!pacientes) return;

    const pacientesFiltrados = pacientes.filter(paciente => {
        const nome = paciente.nome || '';
        const status = paciente.status ? paciente.status.toLowerCase() : 'ativo';
        return nome.toLowerCase().includes(termoBusca.toLowerCase()) && status === 'ativo';
    });
    
    if (pacientesFiltrados.length === 0) {
        listaPacientesModal.innerHTML = '<div class="item-paciente-modal" style="justify-content: center; color: #666;">Nenhum paciente encontrado</div>';
        return;
    }
    
    pacientesFiltrados.forEach(paciente => {
        const iniciais = gerarIniciais(paciente.nome); // Garante iniciais
        const pacienteElemento = document.createElement('div');
        pacienteElemento.className = `item-paciente-modal ${pacienteSelecionado?.id === paciente.id ? 'selecionado' : ''}`;
        pacienteElemento.innerHTML = `
            <div class="avatar-paciente" style="background: ${gerarCorAvatar(iniciais)}">
                ${iniciais}
            </div>
            <div class="info-paciente">
                <div class="nome-paciente">${paciente.nome}</div>
                <div class="telefone-paciente">${paciente.telefone || '-'}</div>
            </div>
        `;
        
        pacienteElemento.addEventListener('click', () => {
            selecionarPaciente(paciente);
        });
        
        listaPacientesModal.appendChild(pacienteElemento);
    });
}

function selecionarPaciente(paciente) {
    pacienteSelecionado = paciente;
    renderizarListaPacientes(inputBuscarPaciente.value);
}

function limparSelecaoPaciente() {
    pacienteSelecionado = null;
    renderizarListaPacientes(inputBuscarPaciente.value);
}

function limparBusca() {
    inputBuscarPaciente.value = '';
    renderizarListaPacientes();
}

function cadastrarNovoPaciente() {
    const dadosRedirecionamento = {
        redirecionarCadastro: true,
        origem: 'agendamento',
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value,
        nome: pacienteSelecionado?.nome || '',
        telefone: pacienteSelecionado?.telefone || ''
    };
    localStorage.setItem('psicare_novo_agendamento', JSON.stringify(dadosRedirecionamento));
    
    fecharModalAgendamento();
    setTimeout(() => {
        navegarPara('index-inicio.html');
    }, 300);
}

botaoAbrirModal.onclick = function(){
    limparCamposAgendamento();
    carregarPacientes();
    renderizarListaPacientes();
    modalAgendamento.style.display = "block";
}

function fecharModalAgendamento(){
    modalAgendamento.style.display = "none";
    limparSelecaoPaciente();
}

function fecharModalAgendamentosDia(){
    modalAgendamentosDia.style.display = "none";
    dataSelecionada = null;
}

function formatarDataParaExibicao(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    const data = new Date(ano, mes - 1, dia);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return data.toLocaleDateString('pt-BR', options);
}

function mostrarAgendamentosDoDia(data) {
    dataSelecionada = data;
    const agendamentosDoDia = agendamentos.filter(agendamento => agendamento.data === data);
    
    tituloAgendamentosDia.textContent = `Agendamentos - ${formatarDataParaExibicao(data)}`;
    listaAgendamentosDia.innerHTML = '';
    
    if (agendamentosDoDia.length === 0) {
        listaAgendamentosDia.innerHTML = `
            <div class="sem-agendamentos">
                <p>Nenhum agendamento para este dia</p>
            </div>
        `;
    } else {
        agendamentosDoDia.sort((a, b) => a.hora.localeCompare(b.hora)).forEach(agendamento => {
            const agendamentoElemento = document.createElement('div');
            agendamentoElemento.className = 'item-agendamento-dia';
            agendamentoElemento.innerHTML = `
                <div class="cabecalho-agendamento">
                    <div class="horario-agendamento">${agendamento.hora}</div>
                    <button class="botao-remover-agendamento" onclick="removerAgendamentoDoModal(${agendamento.id}, event)">×</button>
                </div>
                <div class="detalhes-agendamento">
                    <div class="nome-paciente-agendamento">${agendamento.nome}</div>
                    <div class="telefone-paciente-agendamento">${agendamento.telefone}</div>
                </div>
            `;
            listaAgendamentosDia.appendChild(agendamentoElemento);
        });
    }
    
    modalAgendamentosDia.style.display = "block";
}

function removerAgendamentoDoModal(idAgendamento, evento) {
    evento.stopPropagation();
    if (confirm("Tem certeza que deseja remover este agendamento?")) {
        // Como o agendamento no Java é filho do Paciente, a lógica ideal seria atualizar o Paciente removendo o agendamento.
        // Por simplificação, aqui removemos apenas visualmente.
        // Para remover do banco, seria necessário um DELETE endpoint específico para agendamentos ou um PUT no paciente.
        
        agendamentos = agendamentos.filter(agendamento => agendamento.id !== idAgendamento);
        renderizarCalendario();
        mostrarAgendamentosDoDia(dataSelecionada);
    }
}

function novoAgendamentoParaData() {
    if (dataSelecionada) {
        document.getElementById('data').value = dataSelecionada;
        modalAgendamentosDia.style.display = "none";
        modalAgendamento.style.display = "block";
    }
}

window.onclick = function(event){
    if(event.target == modalAgendamento){
        modalAgendamento.style.display = "none";
        limparSelecaoPaciente();
    }
    if(event.target == modalAgendamentosDia){
        modalAgendamentosDia.style.display = "none";
        dataSelecionada = null;
    }
}

function renderizarCalendario(){
    mesAnoElemento.textContent = `${nomeMeses[mesAtual]} ${anoAtual}`;
    diasMesElemento.innerHTML = '';

    const primeiroDiaMes = new Date(anoAtual, mesAtual, 1).getDay();
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaMes; i++){
        const diaVazio = document.createElement('div');
        diasMesElemento.appendChild(diaVazio);
    }

    for(let dia = 1; dia <= ultimoDia; dia++){
        const diaElemento = document.createElement('div');
        diaElemento.classList.add('dia');

        const dataFormatada = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const agendamentosDoDia = agendamentos.filter(agendamento => agendamento.data === dataFormatada);

        if (agendamentosDoDia.length > 0) {
            diaElemento.classList.add('dia-com-agendamentos');
        }

        diaElemento.setAttribute('data-dia', dataFormatada);

        diaElemento.addEventListener('click', () => {
            mostrarAgendamentosDoDia(dataFormatada);
        });

        diaElemento.innerHTML = `
            <div class="numero-dia">${dia}</div>
            ${agendamentosDoDia.slice(0, 2).map(agendamento => 
                `<div class="evento">${agendamento.hora} - ${agendamento.nome.split(' ')[0]}</div>`
            ).join('')}
            ${agendamentosDoDia.length > 2 ? `<div class="contador-eventos">+${agendamentosDoDia.length - 2}</div>` : ''}
        `;
    
        if (dia === dataAtual.getDate() && mesAtual === new Date().getMonth() && anoAtual === new Date().getFullYear()){
            diaElemento.classList.add('dia-atual');
        }

        diasMesElemento.appendChild(diaElemento);
    }
}

botaoAnterior.addEventListener('click', () => {
    mesAtual--;
    if (mesAtual < 0){
        mesAtual = 11;
        anoAtual--;
    }
    renderizarCalendario();
});

botaoProximo.addEventListener('click', () => {
    mesAtual++;
    if (mesAtual > 11){
        mesAtual = 0;
        anoAtual++;
    }
    renderizarCalendario();
});

function agendar(){
    if (!pacienteSelecionado) {
        alert("Selecione um paciente para agendar!");
        return;
    }

    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;

    if (!data || !hora){
        alert("Preencha data e hora!");
        return;
    }

    // Nota: Aqui estamos apenas simulando o agendamento visualmente.
    // Para persistir, seria necessário chamar a API (PUT/POST) para salvar o agendamento no Paciente.
    const novoAgendamento = {
        id: Date.now(),
        pacienteId: pacienteSelecionado.id,
        nome: pacienteSelecionado.nome,
        data,
        hora,
        telefone: pacienteSelecionado.telefone
    };

    agendamentos.push(novoAgendamento);
    
    limparCamposAgendamento();
    renderizarCalendario(); 
    fecharModalAgendamento();
    
    alert(`Sessão agendada (visualmente) para ${pacienteSelecionado.nome}.`);
}

function removerAgendamento(idAgendamento){
    // Lógica visual mantida
    const agendamentosAntes = agendamentos.length;
    agendamentos = agendamentos.filter(agendamento => agendamento.id !== idAgendamento);
    const agendamentosDepois = agendamentos.length;

    if (agendamentosAntes !== agendamentosDepois){
        alert("Agendamento removido visualmente.");
        renderizarCalendario();
    } else {
        alert("Erro: Agendamento não encontrado.");
    }
}

function limparCamposAgendamento(){
    document.getElementById('data').value = '';
    document.getElementById('hora').value = '';
    limparSelecaoPaciente();
}

document.addEventListener('DOMContentLoaded', function() {
    // Carrega tudo da API ao iniciar
    carregarAgendamentos();
    carregarPacientes();
    
    inicializarNavegacao();
    renderizarCalendario();
    gerenciadorUsuario.atualizarAvatarCabecalho();
    
    inputBuscarPaciente.addEventListener('input', function() {
        renderizarListaPacientes(this.value);
    });
    
    const redirecionamento = localStorage.getItem('psicare_novo_agendamento');
    if (redirecionamento) {
        const dados = JSON.parse(redirecionamento);
        if (dados.redirecionarCadastro && dados.origem === 'agendamento') {
            setTimeout(() => {
                modalAgendamento.style.display = 'block';
                if (dados.data) document.getElementById('data').value = dados.data;
                if (dados.hora) document.getElementById('hora').value = dados.hora;
                alert('Agora você pode selecionar o paciente que acabou de cadastrar para agendar a sessão.');
            }, 500);
            localStorage.removeItem('psicare_novo_agendamento');
        }
    }
});