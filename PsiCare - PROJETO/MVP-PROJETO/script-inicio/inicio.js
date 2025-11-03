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

const CHAVE_ARMAZENAMENTO = "psicare_pacientes";
const CHAVE_AGENDAMENTOS = "psicare_agendamentos";
const CHAVE_ANOTACOES = "psicare_anotacoes";
let pacientes = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO)) || [];
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
    const textos = { ativo: "Ativo", pausa: "Em pausa", inativo: "Inativo" };
    return textos[status] || "Ativo";
}

function formatarDataExibicao(dataString) {
    if (!dataString) return "-";
    if (dataString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dataString;
    }
    try {
        const [dia, mes, ano] = dataString.split('/');
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    } catch {
        return dataString;
    }
}

function converterParaData(dataString) {
    if (!dataString) return null;
    try {
        const [dia, mes, ano] = dataString.split('/');
        return new Date(ano, mes - 1, dia);
    } catch {
        return null;
    }
}

function isSessaoHoje(paciente) {
    if (paciente.status !== 'ativo' || !paciente.dataSessao) return false;
    const hoje = new Date();
    const dataSessao = converterParaData(paciente.dataSessao);
    if (!dataSessao) return false;
    return dataSessao.toDateString() === hoje.toDateString();
}

function isSessaoEstaSemana(paciente) {
    if (paciente.status !== 'ativo' || !paciente.dataSessao) return false;
    const hoje = new Date();
    const dataSessao = converterParaData(paciente.dataSessao);
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
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(pacientes));
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
    document.getElementById("queixa-principal").value = paciente?.queixaPrincipal || "";
    document.getElementById("historico-familiar").value = paciente?.historicoFamiliar || "";
    document.getElementById("observacoes-iniciais").value = paciente?.observacoesIniciais || "";
    document.getElementById("email").value = paciente?.email || "";
    document.getElementById("status").value = paciente?.status || "ativo";
    document.getElementById("anotacoes").value = paciente?.anotacoes || "";
    
    if (paciente?.dataNascimento) {
        seletorDataNascimento.setDate(paciente.dataNascimento);
    } else {
        seletorDataNascimento.clear();
    }
    
    if (paciente?.dataSessao) {
        seletorDataSessao.setDate(paciente.dataSessao);
    } else {
        seletorDataSessao.clear();
    }
    
    if (paciente?.horarioSessao) {
        seletorHorarioSessao.setDate(`1970-01-01 ${paciente.horarioSessao}`);
    } else {
        seletorHorarioSessao.clear();
    }
    
    document.getElementById("frequencia-sessao").value = paciente?.frequenciaSessao || "";
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
    const paciente = pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;

    pacienteSelecionado = paciente;

    document.getElementById('nome-paciente-modal').textContent = paciente.nome;
    
    let horarioTexto = '-';
    if (paciente.horarioSessao) {
        horarioTexto = `${paciente.horarioSessao}`;
    }
    document.getElementById('horario-paciente-modal').textContent = horarioTexto;

    document.getElementById('telefone-paciente-modal').textContent = paciente.telefone || '-';
    document.getElementById('nascimento-paciente-modal').textContent = paciente.dataNascimento || '-';
    
    const statusElement = document.getElementById('status-paciente-modal');
    statusElement.value = paciente.status;

    const anotacoesPaciente = anotacoes.filter(a => a.pacienteId === pacienteId);
    document.getElementById('total-sessoes-modal').textContent = `${anotacoesPaciente.length} sessões`;
    
    const ultimaSessao = anotacoesPaciente.sort((a, b) => new Date(b.dataSessao.split('/').reverse().join('-')) - new Date(a.dataSessao.split('/').reverse().join('-')))[0];
    document.getElementById('ultima-sessao-modal').textContent = ultimaSessao?.dataSessao || '-';
    document.getElementById('proxima-sessao-modal').textContent = paciente.dataSessao || '-';

    const listaAnotacoes = document.getElementById('lista-anotacoes-sessao');
    listaAnotacoes.innerHTML = '';

    if (anotacoesPaciente.length === 0) {
        listaAnotacoes.innerHTML = '<p class="sem-anotacoes">Nenhuma anotação de sessão registrada.</p>';
    } else {
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

function atualizarStatusPaciente() {
    if (!pacienteSelecionado) return;
    
    const novoStatus = document.getElementById('status-paciente-modal').value;
    
    const pacienteIndex = pacientes.findIndex(p => p.id === pacienteSelecionado.id);
    if (pacienteIndex !== -1) {
        pacientes[pacienteIndex].status = novoStatus;
        salvarArmazenamento();
        
        pacienteSelecionado.status = novoStatus;
        renderizarPacientes(pacientes);
    }
}

function fecharModalPaciente() {
    modalPaciente.style.display = "none";
    pacienteSelecionado = null;
}

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

function fecharModalNovaAnotacao() {
    modalNovaAnotacao.style.display = "none";
}

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
    const dataSessao = seletorDataSessaoAnotacao.selectedDates[0] ? 
        seletorDataSessaoAnotacao.formatDate(seletorDataSessaoAnotacao.selectedDates[0], 'd/m/Y') : "";
    const observacoes = document.getElementById('observacoes-sessao').value.trim();
    const humor = document.getElementById('humor-sessao').value.trim();
    const proximosPassos = document.getElementById('proximos-passos-sessao').value.trim();

    if (!dataSessao) {
        alert('A data da sessão é obrigatória.');
        return;
    }

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
    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) return alert("Paciente não encontrado.");

    const conteudoAnotacoes = document.getElementById("conteudo-anotacoes");
    
    let conteudoHTML = `
        <p><strong>Nome:</strong> ${paciente.nome}</p>
        <p><strong>Data de Nascimento:</strong> ${paciente.dataNascimento || "Não informado"}</p>
        <p><strong>Telefone:</strong> ${paciente.telefone || "Não informado"}</p>
        <p><strong>Email:</strong> ${paciente.email || "Não informado"}</p>
        <p><strong>Queixa Principal:</strong> ${paciente.queixaPrincipal || "Não informado"}</p>
        <p><strong>Histórico Familiar:</strong> ${paciente.historicoFamiliar || "Não informado"}</p>
        <p><strong>Observações Iniciais:</strong> ${paciente.observacoesIniciais || "Não informado"}</p>
        <p><strong>Próxima Sessão:</strong> ${paciente.dataSessao ? `${paciente.dataSessao} ${paciente.horarioSessao ? 'às ' + paciente.horarioSessao : ''}` : "Não agendada"}</p>
        <p><strong>Frequência:</strong> ${paciente.frequenciaSessao || "Não definida"}</p>
        <p><strong>Status:</strong> ${obterTextoStatus(paciente.status)}</p>
        <p><strong>Anotações Gerais:</strong> ${paciente.anotacoes?.trim() || "Sem anotações."}</p>
    `;
    
    conteudoAnotacoes.innerHTML = conteudoHTML;
    modalAnotacoes.style.display = "flex";
}

function deletarPaciente(pacienteId, evento) {
    evento.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
        const indice = pacientes.findIndex(p => p.id == pacienteId);
        if (indice !== -1) {
            pacientes.splice(indice, 1);
            anotacoes = anotacoes.filter(a => a.pacienteId !== pacienteId);
            agendamentos = agendamentos.filter(a => a.pacienteId !== pacienteId);
            salvarArmazenamento();
            renderizarPacientes(pacientes);
        }
    }
}

function criarHTMLPaciente(paciente) {
    const corAvatar = gerarCorAvatar(paciente.iniciais);
    const textoStatus = obterTextoStatus(paciente.status);
    
    let horarioTexto = "-";
    if (paciente.dataSessao && paciente.horarioSessao) {
        horarioTexto = `${formatarDataExibicao(paciente.dataSessao)} - ${paciente.horarioSessao}`;
    } else if (paciente.horario) {
        horarioTexto = paciente.horario;
    }
    
    return `
        <li class="item-paciente" data-id="${paciente.id}">
            <div class="avatar-paciente" style="background: ${corAvatar}">${paciente.iniciais}</div>
            <div class="info-paciente">
                <div class="nome-paciente">${paciente.nome}</div>
                <div class="detalhes-paciente">${paciente.telefone}<br>${horarioTexto}</div>
            </div>
            <div class="status-paciente status-${paciente.status}">${textoStatus}</div>
            <button class="botao-deletar" onclick="deletarPaciente('${paciente.id}', event)">×</button>
        </li>
    `;
}

function renderizarPacientes(pacientesParaRenderizar) {
    listaPacientes.innerHTML = '';
    if (pacientesParaRenderizar.length === 0) {
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
        const statusCorresponde = statusSelecionado === 'todos' || paciente.status === statusSelecionado;
        return nomeCorresponde && statusCorresponde;
    });
    renderizarPacientes(pacientesFiltrados);
}

function atualizarContadores() {
    const countAtivos = pacientes.filter(p => p.status === 'ativo').length;
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

function formatarDataParaAgenda(dataString) {
    if (!dataString) return '';
    const [dia, mes, ano] = dataString.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

function criarAgendamentoDoPaciente(paciente) {
    if (paciente.dataSessao && paciente.horarioSessao) {
        const dataAgenda = formatarDataParaAgenda(paciente.dataSessao);
        
        const agendamentoExistente = agendamentos.find(a => 
            a.pacienteId === paciente.id && 
            a.data === dataAgenda && 
            a.hora === paciente.horarioSessao
        );

        if (!agendamentoExistente) {
            const novoAgendamento = {
                id: Date.now(),
                pacienteId: paciente.id,
                nome: paciente.nome,
                data: dataAgenda,
                hora: paciente.horarioSessao,
                telefone: paciente.telefone
            };
            
            agendamentos.push(novoAgendamento);
            return true;
        }
    }
    return false;
}

function atualizarAgendamentosExistentes(paciente) {
    // Remove agendamentos antigos do paciente
    agendamentos = agendamentos.filter(a => a.pacienteId !== paciente.id);
    
    // Cria novo agendamento se houver data e horário
    if (paciente.dataSessao && paciente.horarioSessao) {
        criarAgendamentoDoPaciente(paciente);
    }
}

formulario.onsubmit = (e) => {
    e.preventDefault();

    const nomePaciente = document.getElementById("nome").value.trim();
    
    const dados = {
        id: document.getElementById("id-paciente").value || gerarId(),
        nome: nomePaciente,
        dataNascimento: seletorDataNascimento.selectedDates[0] ? 
            seletorDataNascimento.formatDate(seletorDataNascimento.selectedDates[0], 'd/m/Y') : "",
        telefone: document.getElementById("telefone").value.trim(),
        queixaPrincipal: document.getElementById("queixa-principal").value.trim(),
        historicoFamiliar: document.getElementById("historico-familiar").value.trim(),
        observacoesIniciais: document.getElementById("observacoes-iniciais").value.trim(),
        email: document.getElementById("email").value.trim(),
        dataSessao: seletorDataSessao.selectedDates[0] ? 
            seletorDataSessao.formatDate(seletorDataSessao.selectedDates[0], 'd/m/Y') : "",
        horarioSessao: seletorHorarioSessao.selectedDates[0] ? 
            seletorHorarioSessao.formatDate(seletorHorarioSessao.selectedDates[0], 'H:i') : "",
        frequenciaSessao: document.getElementById("frequencia-sessao").value,
        status: document.getElementById("status").value,
        iniciais: gerarIniciais(nomePaciente),
        anotacoes: document.getElementById("anotacoes").value.trim(),
    };

    if (!dados.nome) return alert("O nome é obrigatório.");

    const existe = pacientes.some(p => p.id === dados.id);
    if (existe) {
        pacientes = pacientes.map(p => (p.id === dados.id ? dados : p));
        // Atualiza agendamentos quando edita paciente
        atualizarAgendamentosExistentes(dados);
    } else {
        pacientes.unshift(dados);
        // Cria agendamento apenas para novos pacientes com sessão agendada
        criarAgendamentoDoPaciente(dados);
    }

    salvarArmazenamento();
    fecharModal();
    renderizarPacientes(pacientes);
};

formularioAnotacao.onsubmit = salvarAnotacao;

function inicializar() {
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
    gerenciadorUsuario.atualizarAvatarCabecalho();
    salvarArmazenamento();
    renderizarPacientes(pacientes);
    atualizarContadores();
    
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
    agendamentos: agendamentos,
    anotacoes: anotacoes,
    adicionarPaciente: () => abrirModal(),
    filtrarPacientes: filtrarPacientes,
    atualizarContadores: atualizarContadores,
    gerenciadorUsuario: gerenciadorUsuario,
    fazerLogout: fazerLogout,
};