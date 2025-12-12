// --- CONFIGURAÇÃO DA API ---
const API_URL = "http://localhost:8087/psicare/paciente";

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

const gerenciadorUsuario = new GerenciadorUsuario();

// Variáveis Globais
const CHAVE_AGENDAMENTOS = "psicare_agendamentos";
const CHAVE_ANOTACOES = "psicare_anotacoes";

// PACIENTES AGORA VÊM DO ARRAY VAZIO INICIALMENTE (SERÁ PREENCHIDO PELO JAVA)
let pacientes = []; 
let agendamentos = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS)) || [];
let anotacoes = JSON.parse(localStorage.getItem(CHAVE_ANOTACOES)) || [];

const listaPacientes = document.getElementById('lista-pacientes');
const pacientesAtivos = document.getElementById('pacientes_ativos');
const sessoesHoje = document.getElementById('sessoes_hoje');
const sessoesSemana = document.getElementById('sessoes_semana');
const filtroStatus = document.getElementById('filtro-status');
const pesquisaInput = document.getElementById('pesquisa-paciente');
const botaoAdicionar = document.getElementById('adicionar_paciente');

const modal = document.getElementById("modal");
const formulario = document.getElementById("formulario-paciente");
const modalAnotacoes = document.getElementById("modal-anotacoes");
const modalPaciente = document.getElementById("modal-paciente");
const modalNovaAnotacao = document.getElementById("modal-nova-anotacao");
const formularioAnotacao = document.getElementById("formulario-anotacao");

let seletorDataNascimento, seletorDataSessao, seletorHorarioSessao, seletorDataSessaoAnotacao;

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

let pacienteSelecionado = null;
let compareceuSessao = true;

// --- FUNÇÕES DE COMUNICAÇÃO COM O BACKEND (JAVA) ---

function carregarPacientesDoBanco() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            pacientes = data; // Atualiza a lista com o que veio do banco
            renderizarPacientes(pacientes);
            atualizarContadores();
        })
        .catch(error => console.error("Erro ao carregar pacientes:", error));
}

function converterDataParaISO(dataBR) {
    // Converte "15/05/1990" para "1990-05-15" (Formato que o Java aceita)
    if (!dataBR) return null;
    const [dia, mes, ano] = dataBR.split('/');
    return `${ano}-${mes}-${dia}`;
}

// ---------------------------------------------------

function navegarPara(pagina) {
    window.location.href = pagina;
}

function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('psicare_usuario');
        navegarPara('index-login.html');
    }
}

function inicializarSeletoresData() {
    seletorDataNascimento = flatpickr("#data-nascimento", {
        locale: "pt",
        dateFormat: "d/m/Y",
        maxDate: "today",
        allowInput: true
    });

    seletorDataSessao = flatpickr("#data-sessao", {
        locale: "pt",
        dateFormat: "d/m/Y",
        minDate: "today",
        allowInput: true
    });

    seletorHorarioSessao = flatpickr("#horario-sessao", {
        locale: "pt",
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: true,
        minuteIncrement: 30
    });

    seletorDataSessaoAnotacao = flatpickr("#data-sessao-anotacao", {
        locale: "pt",
        dateFormat: "d/m/Y",
        allowInput: true
    });
}

function gerarIniciais(nomeCompleto) {
    if (!nomeCompleto || nomeCompleto.trim() === "") return "??";
    return nomeCompleto.trim().split(" ").map((nome) => nome[0]).join("").substring(0, 2).toUpperCase();
}

function gerarCorAvatar(iniciais) {
    const indice = (iniciais.charCodeAt(0) + (iniciais.charCodeAt(1) || 0)) % coresAvatar.length;
    return coresAvatar[indice];
}

function obterTextoStatus(status) {
    // Java manda UPPERCASE, convertemos para lowercase para a chave
    const statusKey = status ? status.toLowerCase() : 'ativo';
    const textos = { ativo: "Ativo", pausa: "Em pausa", inativo: "Inativo" };
    return textos[statusKey] || "Ativo";
}

function formatarDataExibicao(dataString) {
    if (!dataString) return "-";
    // Se vier array do Java [ano, mes, dia]
    if (Array.isArray(dataString)) {
        return `${String(dataString[2]).padStart(2,'0')}/${String(dataString[1]).padStart(2,'0')}/${dataString[0]}`;
    }
    // Se vier string "yyyy-mm-dd"
    if (dataString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    // Se já estiver certo
    return dataString;
}

function converterParaData(dataString) {
    if (!dataString) return null;
    // Tenta formato ISO vindo do Java (yyyy-mm-dd)
    if (typeof dataString === 'string' && dataString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [ano, mes, dia] = dataString.split('-');
        return new Date(ano, mes - 1, dia);
    }
    // Tenta formato Array vindo do Java [yyyy, mm, dd]
    if (Array.isArray(dataString)) {
        return new Date(dataString[0], dataString[1] - 1, dataString[2]);
    }
    try {
        const [dia, mes, ano] = dataString.split('/');
        return new Date(ano, mes - 1, dia);
    } catch {
        return null;
    }
}

function isSessaoHoje(paciente) {
    // Verifica agendamentos aninhados ou campo dataSessao antigo
    let dataSessaoStr = paciente.dataSessao;
    // Se usar a lista de agendamentos do backend:
    if (paciente.agendamento && paciente.agendamento.length > 0) {
        dataSessaoStr = paciente.agendamento[0].data; 
    }

    if (!paciente.status || paciente.status.toLowerCase() !== 'ativo' || !dataSessaoStr) return false;
    
    const hoje = new Date();
    const dataSessao = converterParaData(dataSessaoStr);
    if (!dataSessao) return false;
    return dataSessao.toDateString() === hoje.toDateString();
}

function isSessaoEstaSemana(paciente) {
    let dataSessaoStr = paciente.dataSessao;
    if (paciente.agendamento && paciente.agendamento.length > 0) {
        dataSessaoStr = paciente.agendamento[0].data; 
    }

    if (!paciente.status || paciente.status.toLowerCase() !== 'ativo' || !dataSessaoStr) return false;
    
    const hoje = new Date();
    const dataSessao = converterParaData(dataSessaoStr);
    if (!dataSessao) return false;
    
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    return dataSessao >= inicioSemana && dataSessao <= fimSemana;
}

function salvarArmazenamento() {
    // Mantém salvando coisas locais, mas Pacientes agora é via API
    localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(agendamentos));
    localStorage.setItem(CHAVE_ANOTACOES, JSON.stringify(anotacoes));
    atualizarContadores();
}

function abrirModal(paciente = null) {
    modal.style.display = "flex";
    document.getElementById("titulo-modal").textContent = paciente ? "Editar Paciente" : "Novo Paciente";

    document.getElementById("id-paciente").value = paciente?.id || "";
    document.getElementById("nome").value = paciente?.nome || "";
    document.getElementById("telefone").value = paciente?.telefone || "";
    document.getElementById("email").value = paciente?.email || "";
    
    const statusVal = paciente?.status ? paciente.status.toLowerCase() : "ativo";
    document.getElementById("status").value = statusVal;
    
    // --- CORREÇÃO: Preenchendo campos do Prontuário ---
    const prontuario = paciente?.prontuario || {};
    
    document.getElementById("queixa-principal").value = prontuario.queixaPrincipal || "";
    document.getElementById("historico-familiar").value = prontuario.historicoFamiliar || "";
    document.getElementById("observacoes-iniciais").value = prontuario.observacoesIniciais || "";
    document.getElementById("anotacoes").value = prontuario.anotacoesGerais || "";
    
    if (paciente?.dataNascimento) {
        // Se vier do Java pode ser array ou string ISO, o flatpickr geralmente entende, 
        // mas é bom usar o formatador se necessário.
        seletorDataNascimento.setDate(formatarDataExibicao(paciente.dataNascimento));
    } else {
        seletorDataNascimento.clear();
    }
    
    // Se for edição, tenta pegar o último agendamento
    let dataAgendamento = "";
    let horaAgendamento = "";
    if (paciente?.agendamento && paciente.agendamento.length > 0) {
        dataAgendamento = paciente.agendamento[0].data;
        horaAgendamento = paciente.agendamento[0].hora;
    }

    if (dataAgendamento) {
        seletorDataSessao.setDate(formatarDataExibicao(dataAgendamento));
    } else {
        seletorDataSessao.clear();
    }
    
    if (horaAgendamento) {
        seletorHorarioSessao.setDate(`1970-01-01 ${horaAgendamento}`);
    } else {
        seletorHorarioSessao.clear();
    }
    
    document.getElementById("frequencia-sessao").value = paciente?.frequencia || "";
}

function fecharModal() {
    modal.style.display = "none";
    formulario.reset();
    seletorDataNascimento.clear();
    seletorDataSessao.clear();
    seletorHorarioSessao.clear();
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function abrirModalPaciente(pacienteId) {
    // IMPORTANTE: pacienteId do Java é número, mas o atributo HTML é string
    const paciente = pacientes.find(p => p.id == pacienteId);
    if (!paciente) return;

    pacienteSelecionado = paciente;

    document.getElementById('nome-paciente-modal').textContent = paciente.nome;
    
    let horarioTexto = '-';
    // Verifica lista de agendamentos
    if (paciente.agendamento && paciente.agendamento.length > 0) {
        horarioTexto = `${paciente.agendamento[0].hora}`;
    }
    document.getElementById('horario-paciente-modal').textContent = horarioTexto;

    document.getElementById('telefone-paciente-modal').textContent = paciente.telefone || '-';
    document.getElementById('nascimento-paciente-modal').textContent = formatarDataExibicao(paciente.dataNascimento) || '-';
    
    const prontuario = paciente.prontuario || {}

    document.getElementById('queixa-paciente-modal').textContent = prontuario.queixaPrincipal || 'Não informado';
    document.getElementById('historico-paciente-modal').textContent = prontuario.historicoFamiliar || 'Não informado';
    document.getElementById('observacoes-paciente-modal').textContent = prontuario.observacoesIniciais || 'Não informado';

    const statusElement = document.getElementById('status-paciente-modal');
    statusElement.value = paciente.status ? paciente.status.toLowerCase() : 'ativo';

    // Mantém lógica local de anotações (sessões passadas)
    const anotacoesPaciente = anotacoes.filter(a => a.pacienteId == pacienteId);
    document.getElementById('total-sessoes-modal').textContent = `${anotacoesPaciente.length} sessões`;
    
    // Mostra Próxima Sessão baseada no agendamento do banco
    let proximaSessao = '-';
    if(paciente.agendamento && paciente.agendamento.length > 0){
        proximaSessao = formatarDataExibicao(paciente.agendamento[0].data);
    }
    document.getElementById('proxima-sessao-modal').textContent = proximaSessao;

    const listaAnotacoes = document.getElementById('lista-anotacoes-sessao');
    listaAnotacoes.innerHTML = '';

    if (anotacoesPaciente.length === 0) {
        listaAnotacoes.innerHTML = '<p class="sem-anotacoes">Nenhuma anotação de sessão registrada.</p>';
    } else {
        // ... (código de renderização de anotações mantido igual)
        anotacoesPaciente.sort((a, b) => new Date(b.dataSessao.split('/').reverse().join('-')) - new Date(a.dataSessao.split('/').reverse().join('-'))).forEach(anotacao => {
            const anotacaoHTML = `
                <div class="anotacao-sessao">
                    <div class="cabecalho-anotacao">
                        <span class="data-anotacao">Sessão ${anotacao.dataSessao}</span>
                        <span class="comparecimento-anotacao ${anotacao.compareceu ? '' : 'nao-compareceu'}">${anotacao.compareceu ? 'Compareceu' : 'Não compareceu'}</span>
                    </div>
                    <div class="conteudo-anotacao">
                        <div class="secao-anotacao">
                            <strong>Observações da Sessão</strong>
                            <p>${anotacao.observacoes || '-'}</p>
                        </div>
                        <div class="secao-anotacao">
                            <strong>Humor/Estado Emocional</strong>
                            <p>${anotacao.humor || '-'}</p>
                        </div>
                        <div class="secao-anotacao">
                            <strong>Próximos Passos</strong>
                            <p>${anotacao.proximosPassos || '-'}</p>
                        </div>
                    </div>
                </div>
            `;
            listaAnotacoes.innerHTML += anotacaoHTML;
        });
    }

    modalPaciente.style.display = "flex";
}

function inicializarMascaraTelefone() {
    const inputTelefoneCadastro = document.getElementById('telefone'); 
    if (inputTelefoneCadastro) {
        inputTelefoneCadastro.addEventListener('input', (evento) => {
            let valor = evento.target.value;
            valor = valor.replace(/\D/g, "");
            valor = valor.replace(/^(\d{2})(\d)/, "($1) $2");
            valor = valor.replace(/(\d)(\d{4})/, "$1.$2");
            valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
            evento.target.value = valor;
        });
    }
}

// Em inicio.js

function atualizarStatusPaciente() {
    if (!pacienteSelecionado) return;
    
    const novoStatus = document.getElementById('status-paciente-modal').value.toUpperCase();
    
    // Preparamos apenas o dado que mudou
    const dadosParciais = {
        status: novoStatus
    };

    // Chamada PATCH para a API
    fetch(`${API_URL}/${pacienteSelecionado.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParciais)
    })
    .then(response => {
        if (response.ok) {
            // Sucesso: Atualiza visualmente
            pacienteSelecionado.status = novoStatus;
            
            // Atualiza a lista principal de pacientes (para refletir a cor na tabela)
            const index = pacientes.findIndex(p => p.id === pacienteSelecionado.id);
            if (index !== -1) {
                pacientes[index].status = novoStatus;
            }
            
            renderizarPacientes(pacientes);
            alert("Status atualizado com sucesso!");
        } else {
            alert("Erro ao atualizar status via PATCH.");
        }
    })
    .catch(erro => console.error("Erro na requisição PATCH:", erro));
}

// ... (Funções de Anotação mantidas iguais: abrirModalNovaAnotacao, fecharModalNovaAnotacao, selecionarComparecimento, salvarAnotacao, anotacoesPaciente) ...
// Para economizar espaço, mantenha as funções de anotação como estavam, pois elas usam localStorage e não afetam o erro do backend.
// Certifique-se apenas que 'salvarAnotacao' use 'abrirModalPaciente(pacienteId)' com ID correto.

function abrirModalNovaAnotacao() {
    if (!pacienteSelecionado) return;
    document.getElementById('id-paciente-anotacao').value = pacienteSelecionado.id;
    seletorDataSessaoAnotacao.clear();
    const botoesComparecimento = document.querySelectorAll('.botao-comparecimento');
    botoesComparecimento.forEach(botao => botao.classList.remove('ativo'));
    botoesComparecimento[0].classList.add('ativo');
    compareceuSessao = true;
    document.getElementById('observacoes-sessao').value = '';
    document.getElementById('humor-sessao').value = '';
    document.getElementById('proximos-passos-sessao').value = '';
    modalNovaAnotacao.style.display = "flex";
}
function fecharModalNovaAnotacao() { modalNovaAnotacao.style.display = "none"; }
function selecionarComparecimento(compareceu) {
    compareceuSessao = compareceu;
    const botoesComparecimento = document.querySelectorAll('.botao-comparecimento');
    botoesComparecimento.forEach(botao => {
        if (botao.getAttribute('data-compareceu') === compareceu.toString()) {
            botao.classList.add('ativo');
        } else {
            botao.classList.remove('ativo');
        }
    });
}
function salvarAnotacao(e) {
    e.preventDefault();
    const pacienteId = document.getElementById('id-paciente-anotacao').value;
    const dataSessao = seletorDataSessaoAnotacao.selectedDates[0] ? seletorDataSessaoAnotacao.formatDate(seletorDataSessaoAnotacao.selectedDates[0], 'd/m/Y') : "";
    const observacoes = document.getElementById('observacoes-sessao').value.trim();
    const humor = document.getElementById('humor-sessao').value.trim();
    const proximosPassos = document.getElementById('proximos-passos-sessao').value.trim();
    if (!dataSessao) { alert('A data da sessão é obrigatória.'); return; }
    const novaAnotacao = {
        id: Date.now().toString(),
        pacienteId: pacienteId,
        dataSessao: dataSessao,
        compareceu: compareceuSessao,
        observacoes: observacoes,
        humor: humor,
        proximosPassos: proximosPassos,
        dataCriacao: new Date().toISOString()
    };
    anotacoes.push(novaAnotacao);
    salvarArmazenamento();
    fecharModalNovaAnotacao();
    abrirModalPaciente(pacienteId);
}
function anotacoesPaciente(id){
    const paciente = pacientes.find(p => p.id == id);
    if (!paciente) return alert("Paciente não encontrado.");
    const conteudoAnotacoes = document.getElementById("conteudo-anotacoes");
    const prontuario = paciente.prontuario || {};
    let conteudoHTML = `
        <p><strong>Nome:</strong> ${paciente.nome}</p>
        <p><strong>Data de Nascimento:</strong> ${formatarDataExibicao(paciente.dataNascimento) || "Não informado"}</p>
        <p><strong>Telefone:</strong> ${paciente.telefone || "Não informado"}</p>
        <p><strong>Email:</strong> ${paciente.email || "Não informado"}</p>
        <p><strong>Queixa Principal:</strong> ${prontuario.queixaPrincipal || "Não informado"}</p>
        <p><strong>Histórico Familiar:</strong> ${prontuario.historicoFamiliar || "Não informado"}</p>
        <p><strong>Observações Iniciais:</strong> ${prontuario.observacoesIniciais || "Não informado"}</p>
        <p><strong>Frequência:</strong> ${paciente.frequencia || "Não definida"}</p>
        <p><strong>Status:</strong> ${obterTextoStatus(paciente.status)}</p>
        <p><strong>Anotações Gerais:</strong> ${prontuario.anotacoesGerais?.trim() || "Sem anotações."}</p>
    `;
    conteudoAnotacoes.innerHTML = conteudoHTML;
    modalAnotacoes.style.display = "flex";
}

// --------------------------------------------------------------------------------

function deletarPaciente(pacienteId, evento) {
    evento.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
        // CHAMA API DELETE
        fetch(`${API_URL}/${pacienteId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if(response.ok){
                alert("Paciente excluído com sucesso.");
                carregarPacientesDoBanco(); // Recarrega a lista
            } else {
                alert("Erro ao excluir paciente.");
            }
        })
        .catch(err => console.error("Erro delete:", err));
    }
}

function criarHTMLPaciente(paciente) {
    // Tratamento para garantir que iniciais existam
    const iniciais = paciente.nome ? gerarIniciais(paciente.nome) : "??";
    const corAvatar = gerarCorAvatar(iniciais);
    const textoStatus = obterTextoStatus(paciente.status);
    
    let horarioTexto = "-";
    // Tenta pegar do agendamento vindo do banco
    if (paciente.agendamento && paciente.agendamento.length > 0) {
        const ag = paciente.agendamento[0];
        horarioTexto = `${formatarDataExibicao(ag.data)} - ${ag.hora}`;
    }
    
    return `
        <li class="item-paciente" data-id="${paciente.id}">
            <div class="avatar-paciente" style="background: ${corAvatar}">${iniciais}</div>
            <div class="info-paciente">
                <div class="nome-paciente">${paciente.nome}</div>
                <div class="detalhes-paciente">${paciente.telefone || ''}<br>${horarioTexto}</div>
            </div>
            <div class="status-paciente status-${paciente.status ? paciente.status.toLowerCase() : 'ativo'}">${textoStatus}</div>
            <button class="botao-deletar" onclick="deletarPaciente(${paciente.id}, event)">×</button>
        </li>
    `;
}

function renderizarPacientes(pacientesParaRenderizar) {
    listaPacientes.innerHTML = '';
    if (!pacientesParaRenderizar || pacientesParaRenderizar.length === 0) {
        listaPacientes.innerHTML = '<li class="nenhum-paciente">Nenhum paciente encontrado</li>';
        return;
    }
    pacientesParaRenderizar.forEach(paciente => {
        listaPacientes.innerHTML += criarHTMLPaciente(paciente);
    });
    adicionarEventosClique();
}

function filtrarPacientes() {
    const termoPesquisa = pesquisaInput.value.toLowerCase();
    const statusSelecionado = filtroStatus.value;
    const pacientesFiltrados = pacientes.filter(paciente => {
        const nome = paciente.nome || '';
        const nomeCorresponde = nome.toLowerCase().includes(termoPesquisa);
        const statusPaciente = paciente.status ? paciente.status.toLowerCase() : 'ativo';
        const statusCorresponde = statusSelecionado === 'todos' || statusPaciente === statusSelecionado;
        return nomeCorresponde && statusCorresponde;
    });
    renderizarPacientes(pacientesFiltrados);
}

function atualizarContadores() {
    // Filtro simples baseados nos dados carregados
    if(!pacientes) return;
    const countAtivos = pacientes.filter(p => p.status && p.status.toUpperCase() === 'ATIVO').length;
    pacientesAtivos.textContent = countAtivos;
    
    const countHoje = pacientes.filter(isSessaoHoje).length;
    sessoesHoje.textContent = countHoje;
    
    const countSemana = pacientes.filter(isSessaoEstaSemana).length;
    sessoesSemana.textContent = countSemana;
}

function adicionarEventosClique() {
    const itensPacientes = document.querySelectorAll('.item-paciente');
    itensPacientes.forEach(item => {
        item.addEventListener('click', function() {
            const pacienteId = this.getAttribute('data-id');
            abrirModalPaciente(pacienteId);
        });
    });
}

function inicializarNavegacao() {
    document.querySelectorAll('.barralateral li').forEach(item => {
        item.addEventListener('click', function() {
            const texto = this.textContent.trim();
            if (texto.includes('Início')) {
                console.log('Já está no Início');
            } else if (texto.includes('Agenda')) {
                navegarPara('index-agenda.html');
            }
        });
    });

    const avatarUsuario = document.querySelector('.avatar_usuario');
    const menuUsuario = document.querySelector('.menu_usuario');
    
    if (avatarUsuario && menuUsuario) {
        avatarUsuario.addEventListener('click', function() {
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
                    navegarPara('index-perfil.html');
                } else if (acao === 'Sair') {
                    fazerLogout();
                }
                menuUsuario.style.display = 'none';
            });
        });
    }
}

// Helper para formatar data para o input (não é mais tão usado pois o flatpickr gerencia, mas mantido por segurança)
function formatarDataParaAgenda(dataString) {
    if (!dataString) return '';
    const [dia, mes, ano] = dataString.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

// --- LÓGICA DE SUBMISSÃO (CRIAR E EDITAR) VIA API ---

formulario.onsubmit = (e) => {
    e.preventDefault();

    const nomePaciente = document.getElementById("nome").value.trim();
    if (!nomePaciente) return alert("O nome é obrigatório.");

    const dadosParaEnviar = {
        nome: nomePaciente,
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim(),
        // Converte data pt-BR para ISO (yyyy-mm-dd)
        dataNascimento: converterDataParaISO(document.getElementById("data-nascimento").value),
        status: document.getElementById("status").value.toUpperCase(),

        // Prontuário
        queixaPrincipal: document.getElementById("queixa-principal").value.trim(),
        historicoFamiliar: document.getElementById("historico-familiar").value.trim(),
        observacoesIniciais: document.getElementById("observacoes-iniciais").value.trim(),
        anotacoesGerais: document.getElementById("anotacoes").value.trim(),

        // Agendamento (Envia null se vazio)
        dataSessao: document.getElementById("data-sessao").value ? converterDataParaISO(document.getElementById("data-sessao").value) : null,
        horarioSessao: document.getElementById("horario-sessao").value ? document.getElementById("horario-sessao").value + ":00" : null,
        frequencia: document.getElementById("frequencia-sessao").value ? document.getElementById("frequencia-sessao").value.toUpperCase() : null
    };

    const idPaciente = document.getElementById("id-paciente").value;

    let metodo = 'POST';
    let urlEnvio = API_URL;

    if (idPaciente) {
        metodo = 'PUT';
        urlEnvio = `${API_URL}/${idPaciente}`;
    }

    fetch(urlEnvio, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar)
    })
    .then(response => {
        if (!response.ok) return response.text().then(t => { throw new Error(t) });
        return response.json();
    })
    .then(data => {
        alert(idPaciente ? "Atualizado com sucesso!" : "Cadastrado com sucesso!");
        fecharModal();
        carregarPacientesDoBanco(); // Recarrega tabela
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao salvar: " + error.message);
    });
};

formularioAnotacao.onsubmit = salvarAnotacao;

function inicializar() {
    // ... (Código de redirecionamento da agenda mantido)
    const novoAgendamento = localStorage.getItem('psicare_novo_agendamento');
    if (novoAgendamento) {
        const agendamento = JSON.parse(novoAgendamento);
        if (agendamento.redirecionarCadastro) {
            setTimeout(() => {
                alert('Você veio da agenda! Cadastre o paciente: ' + agendamento.nome);
                abrirModal({
                    nome: agendamento.nome,
                    telefone: agendamento.telefone,
                    dataSessao: agendamento.data ? formatarDataExibicao(agendamento.data.split('-').reverse().join('/')) : '',
                    horarioSessao: agendamento.hora
                });
            }, 1000);
            localStorage.removeItem('psicare_novo_agendamento');
        }
    }
    
    inicializarSeletoresData();
    inicializarMascaraTelefone();
    gerenciadorUsuario.atualizarAvatarCabecalho();
    
    // SUBSTITUI O CARREGAMENTO LOCAL PELO BANCO
    // renderizarPacientes(pacientes); -> removido
    carregarPacientesDoBanco(); 
    
    filtroStatus.addEventListener('change', filtrarPacientes);
    pesquisaInput.addEventListener('input', filtrarPacientes);
    
    botaoAdicionar.addEventListener('click', function() {
        abrirModal();
    });
    
    document.getElementById("cancelar").onclick = fecharModal;
    document.getElementById("fechar-anotacoes").onclick = () => {
        modalAnotacoes.style.display = "none";
    };
    
    document.getElementById('status-paciente-modal').addEventListener('change', atualizarStatusPaciente);
    
    const botoesComparecimento = document.querySelectorAll('.botao-comparecimento');
    botoesComparecimento.forEach(botao => {
        botao.addEventListener('click', function() {
            const compareceu = this.getAttribute('data-compareceu') === 'true';
            selecionarComparecimento(compareceu);
        });
    });
    
    inicializarNavegacao();
}

document.addEventListener('DOMContentLoaded', inicializar);

window.PsiCare = {
    pacientes: pacientes,
    agendamenthos: agendamentos,
    anotacoes: anotacoes,
    adicionarPaciente: () => abrirModal(),
    filtrarPacientes: filtrarPacientes,
    atualizarContadores: atualizarContadores,
    gerenciadorUsuario: gerenciadorUsuario,
    fazerLogout: fazerLogout,
};

function editarPacienteAtual() {
    if (!pacienteSelecionado) return;
    fecharModalPaciente();
    abrirModal(pacienteSelecionado);
}