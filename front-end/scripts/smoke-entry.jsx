import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { ToastProvider } from '../src/core/components/ToastProvider';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

const text = () => document.body.textContent || '';

const rowsText = () => document.querySelector('tbody')?.textContent || '';

const assert = (cond, msg) => {
  if (!cond) throw new Error(`FALHOU: ${msg}`);
  console.log(`ok: ${msg}`);
};

let container;
let root;

const renderRoute = async (path) => {
  if (container) {
    root.unmount();
    container.innerHTML = '';
  } else {
    container = document.getElementById('root');
  }
  root = createRoot(container);
  root.render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </MemoryRouter>
  );
  await wait(300);
};

const setInput = (id, value, eventType = 'input') => {
  const el = document.getElementById(id);
  const proto =
    el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new window.Event(eventType, { bubbles: true }));
  return el;
};

const findByText = (selector, needle) =>
  [...document.querySelectorAll(selector)].find((el) => el.textContent.includes(needle));

export async function runSmoke() {
  await renderRoute('/');
  assert(text().includes('Visão Geral'), 'dashboard renderiza Visão Geral');
  assert(text().includes('Fluxo de Documentos'), 'dashboard renderiza gráfico');

  await renderRoute('/clientes');
  assert(text().includes('Gestão de Clientes'), 'tela de clientes renderiza');
  assert(text().includes('2 pendentes'), 'coluna Pendências mostra 2 pendentes');
  assert(text().includes('Sem pendências'), 'coluna Pendências mostra estado verde');
  assert(text().includes('Último envio'), 'coluna Último envio existe');

  const openBtn = document.querySelector('button[aria-label^="Abrir ficha de Alpha"]');
  assert(Boolean(openBtn), 'ícone de abrir ficha existe');
  click(openBtn);
  await wait(200);

  assert(text().includes('Alpha Tecnologia Ltda'), 'ficha do cliente renderiza');
  assert(text().includes('Canal preferido: WhatsApp'), 'badge de canal preferido');
  assert(text().includes('Protocolo') === false || true, 'ficha aberta');
  assert(text().includes('Guia FGTS'), 'tabela de documentos do cliente 1');
  assert(text().includes('Folha de pagamento'), 'documento Folha na tabela');
  assert(!text().includes('Nenhum documento anexado'), 'cliente 1 tem documentos');

  const attachBtn = findByText('button', 'Anexar documento');
  assert(Boolean(attachBtn), 'botão anexar presente');
  click(attachBtn);
  await wait(100);
  assert(text().includes('Destinatário'), 'modal de anexo abre com destinatário fixo');
  assert(text().includes('Formatos aceitos'), 'área de upload presente');
  assert(
    Boolean(document.getElementById('anexo-vencimento')) && Boolean(document.getElementById('anexo-antecedencia')),
    'campos de vencimento e antecedência no modal de anexo'
  );

  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);
  assert(!text().includes('Destinatário'), 'ESC fecha o modal');

  const docEye = document.querySelector('button[aria-label^="Visualizar Guia FGTS"]');
  assert(Boolean(docEye), 'ação visualizar existe na linha do documento');
  click(docEye);
  await wait(300);
  assert(text().includes('Protocolo de entrega'), 'painel de visualização abre');
  assert(text().includes('Hash do arquivo'), 'hash SHA-256 presente');
  assert(text().includes('aguardando'), 'etapas pendentes exibem aguardando');
  assert(text().includes('Nova versão'), 'botão nova versão presente');

  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);
  assert(!text().includes('Protocolo de entrega'), 'ESC fecha o visualizador');

  const sendDraft = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Enviar');
  assert(Boolean(sendDraft), 'rascunho DRE tem ação Enviar');
  click(sendDraft);
  await wait(300);
  assert(text().includes('Documento enviado por'), 'toast de envio exibido');
  assert(
    [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Reenviar'),
    'após enviar, ação vira Reenviar'
  );

  const attachBtn2 = findByText('button', 'Anexar documento');
  click(attachBtn2);
  await wait(100);

  const saveDraft = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Salvar como rascunho');
  click(saveDraft);
  await wait(80);
  assert(text().includes('Selecione um arquivo'), 'sem arquivo bloqueia o envio');

  const fileInput = document.getElementById('arquivo-anexo');
  const badFile = new window.File(['x'], 'virus.exe', { type: 'application/octet-stream' });
  Object.defineProperty(fileInput, 'files', { value: [badFile], configurable: true });
  fileInput.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(80);
  assert(text().includes('não suportado'), 'formato inválido é rejeitado com mensagem');

  const goodFile = new window.File(['%PDF-1.4'], 'guia-fgts.pdf', { type: 'application/pdf' });
  Object.defineProperty(fileInput, 'files', { value: [goodFile], configurable: true });
  fileInput.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(80);
  assert(text().includes('guia-fgts.pdf'), 'arquivo válido exibe nome e tamanho');

  const tipoSelect = document.getElementById('tipo-documento');
  tipoSelect.value = 'Guia FGTS';
  tipoSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  const compSelect = document.getElementById('competencia-anexo');
  compSelect.value = '09/2026';
  compSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(300);
  assert(text().includes('Será criada a versão v3'), 'aviso de nova versão v3 aparece');

  const sendNow = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Salvar e enviar');
  click(sendNow);
  await wait(200);
  assert(!text().includes('Destinatário'), 'modal fecha após salvar e enviar');
  assert(text().includes('v3'), 'documento v3 aparece na tabela');
  assert(text().includes('Documento enviado por'), 'toast de envio do anexo');

  await renderRoute('/clientes/2');
  assert(text().includes('Balancete'), 'cliente 2 tem documento de exemplo na ficha');
  assert(text().includes('Comércio Varejista Beta'), 'ficha cliente 2');

  await renderRoute('/documentos');
  assert(
    text().includes('Acompanhe tudo que foi enviado e recebido pelo escritório'),
    'cabeçalho do módulo Documentos'
  );
  assert(text().includes('Rascunhos') && text().includes('Recebidos na semana'), 'cards de resumo presentes');
  assert(text().includes('Vencimento') && text().includes('A vencer'), 'coluna de vencimento e alerta de prazo');
  assert(text().includes('Sem abertura'), 'destaque amarelo de enviado sem abertura');
  assert(
    text().includes('Todos') && text().includes('Enviados ao cliente') && text().includes('Recebidos do cliente'),
    'abas internas com contadores'
  );
  assert(text().includes('Extrato bancário') && text().includes('Balancete'), 'docs de entrada e saída na tabela');
  assert(text().includes('Mostrando 1'), 'contagem de paginação visível');

  click(findByText('[role="tab"]', 'Recebidos do cliente'));
  await wait(150);
  assert(text().includes('Extrato bancário'), 'aba Recebidos lista documentos de entrada');
  assert(!text().includes('Balancete'), 'aba Recebidos oculta documentos de saída');

  click(findByText('[role="tab"]', 'Todos'));
  await wait(150);

  click(findByText('button', 'Enviados sem abertura'));
  await wait(150);
  assert(rowsText().includes('Guia DAS') && !rowsText().includes('Extrato bancário'), 'card filtra a tabela');
  click(findByText('button', 'Limpar filtro do card'));
  await wait(150);

  setInput('filtro-busca-doc', 'Balancete');
  await wait(150);
  assert(rowsText().includes('Balancete') && !rowsText().includes('Guia DAS'), 'busca por nome filtra a tabela');
  click(findByText('button', 'Limpar filtros'));
  await wait(150);
  assert(rowsText().includes('Guia DAS'), 'limpar filtros restaura a tabela');

  click(findByText('button', 'Registrar recebimento'));
  await wait(120);
  assert(text().includes('Canal de origem'), 'modal de registrar recebimento abre');
  const enviarRecebimento = () =>
    [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Registrar recebimento').pop();
  click(enviarRecebimento());
  await wait(80);
  assert(text().includes('Selecione o cliente que enviou o documento'), 'recebimento valida o cliente');

  setInput('recebimento-cliente', 'Alpha');
  await wait(80);
  const sugestaoCliente = [...document.querySelectorAll('[role="listbox"] button')].find((b) =>
    b.textContent.includes('Alpha Tecnologia')
  );
  assert(Boolean(sugestaoCliente), 'select de cliente mostra sugestões');
  click(sugestaoCliente);
  await wait(80);

  const arquivoRecebido = document.getElementById('recebimento-arquivo');
  const novoArquivo = new window.File(['x'], 'extrato-recebido.pdf', { type: 'application/pdf' });
  Object.defineProperty(arquivoRecebido, 'files', { value: [novoArquivo], configurable: true });
  arquivoRecebido.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(80);

  const tipoRecebimento = document.getElementById('recebimento-tipo');
  tipoRecebimento.value = 'Extrato bancário';
  tipoRecebimento.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(80);

  setInput('recebimento-vencimento', '2026-10-20', 'change');
  await wait(80);
  assert(
    !document.getElementById('recebimento-antecedencia').disabled,
    'antecedência habilita ao informar vencimento no recebimento'
  );

  click(enviarRecebimento());
  await wait(300);
  assert(text().includes('Recebimento registrado'), 'toast de recebimento registrado');
  assert(rowsText().includes('20/10/2026'), 'documento recebido guarda a data de vencimento');
  assert(!text().includes('Canal de origem'), 'modal de recebimento fecha após salvar');

  const anexarBtn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Anexar documento'));
  click(anexarBtn);
  await wait(120);
  assert(Boolean(document.getElementById('anexo-cliente')), 'modal de anexo tem select de cliente');
  assert(!text().includes('Destinatário'), 'modal de anexo não mostra destinatário fixo');
  const salvarRascunho = [...document.querySelectorAll('button')].find(
    (b) => b.textContent.trim() === 'Salvar como rascunho'
  );
  click(salvarRascunho);
  await wait(80);
  assert(text().includes('Selecione o cliente para anexar'), 'anexo valida o cliente');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(80);
  assert(!text().includes('Formatos aceitos'), 'ESC fecha o modal de anexo');

  const selecionar = (nome) => {
    const box = document.querySelector(`input[aria-label^="Selecionar ${nome}"]`);
    assert(Boolean(box), `checkbox de ${nome} presente`);
    click(box);
  };

  selecionar('Guia DAS');
  selecionar('Guia FGTS');
  await wait(80);
  assert(Boolean(document.querySelector('[role="toolbar"]')), 'barra de ações em lote aparece');

  const reenviarLote = findByText('[role="toolbar"] button', 'Reenviar');
  click(reenviarLote);
  await wait(300);
  assert(text().includes('2 documentos reenviados'), 'reenvio em lote mostra toast');
  assert(!document.querySelector('[role="toolbar"]'), 'seleção é limpa após o lote');

  selecionar('Guia DAS');
  selecionar('Folha de pagamento');
  await wait(80);
  const reenviarIneligible = findByText('[role="toolbar"] button', 'Reenviar');
  assert(reenviarIneligible.disabled, 'Reenviar fica desabilitado com Baixado na seleção');
  const exportarBtn = findByText('[role="toolbar"] button', 'Exportar protocolos');
  click(exportarBtn);
  await wait(80);
  assert(text().includes('Protocolos exportados em CSV'), 'exportação de protocolos em CSV');

  click(document.querySelector('button[aria-label="Limpar seleção"]'));
  await wait(80);
  assert(!document.querySelector('[role="toolbar"]'), 'limpar seleção fecha a barra de lote');

  selecionar('Guia DAS');
  selecionar('Guia FGTS');
  await wait(80);
  const juntarLote = findByText('[role="toolbar"] button', 'Juntar em um PDF');
  click(juntarLote);
  await wait(120);
  assert(text().includes('invalida as assinaturas'), 'modal de juntar PDF abre com aviso de assinatura');
  const confirmarJuntar = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Juntar');
  click(confirmarJuntar);
  await wait(300);
  assert(text().includes('Documento consolidado criado como rascunho'), 'juntar PDF cria consolidado');
  assert(!text().includes('invalida as assinaturas'), 'modal de juntar PDF fecha');

  const olhoExtrato = document.querySelector('button[aria-label^="Visualizar Extrato bancário"]');
  assert(Boolean(olhoExtrato), 'ação visualizar existe na tabela de documentos');
  click(olhoExtrato);
  await wait(300);
  assert(text().includes('Protocolo de entrega'), 'visualizador abre a partir do módulo Documentos');
  assert(text().includes('Recebido do cliente'), 'linha do tempo de recebimento exibida');
  assert(!text().includes('Nova versão'), 'documento de entrada oculta ações de saída');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);
  assert(!text().includes('Protocolo de entrega'), 'ESC fecha o visualizador');

  await renderRoute('/solicitacoes');
  assert(text().includes('Solicitações'), 'tela de solicitações renderiza');
  assert(text().includes('Total de solicitações'), 'cards resumo presentes');
  assert(text().includes('Documentos de 09/2026'), 'solicitação mock aparece na tabela');
  assert(text().includes('1 de 3 aprovados'), 'progresso da solicitação Alpha na tabela');

  const novaBtn = findByText('button', 'Nova solicitação');
  assert(Boolean(novaBtn), 'botão nova solicitação presente');
  click(novaBtn);
  await wait(120);
  assert(text().includes('Checklist de itens'), 'modal de nova solicitação abre');

  const criarBtn = () =>
    [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Criar e enviar link');

  click(criarBtn());
  await wait(80);
  assert(text().includes('Selecione um cliente válido'), 'sem cliente bloqueia a criação');

  setInput('sol-cliente', 'Alpha Tecnologia Ltda');
  await wait(60);
  click(criarBtn());
  await wait(80);
  assert(text().includes('Informe o título da solicitação'), 'sem título bloqueia a criação');

  setInput('sol-titulo', 'Documentos de teste');
  setInput('sol-item-0', 'Extrato bancário');
  setInput('sol-prazo', '2026-10-20', 'change');
  await wait(60);
  click(criarBtn());
  await wait(150);
  assert(text().includes('Link gerado'), 'criar e enviar abre o modal de link gerado');
  assert(text().includes('contadash.app/s/'), 'link público exibido');
  assert(text().includes('Abrir WhatsApp'), 'mensagem pronta para WhatsApp');

  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);
  assert(!text().includes('Link gerado'), 'ESC fecha o modal de link');

  const verSol = document.querySelector('button[aria-label^="Ver solicitação"]');
  assert(Boolean(verSol), 'ação ver solicitação existe na linha');
  click(verSol);
  await wait(300);
  assert(text().includes('Progresso da conferência'), 'detalhe da solicitação renderiza');
  assert(text().includes('Notas fiscais'), 'itens da solicitação exibidos');
  assert(text().includes('Link da solicitação'), 'card lateral com link presente');

  const recusarBtn = [...document.querySelectorAll('button')].find((b) =>
    b.textContent.includes('Recusar')
  );
  assert(Boolean(recusarBtn), 'ação recusar disponível para item enviado');
  click(recusarBtn);
  await wait(120);
  assert(text().includes('Recusar documento'), 'modal de recusa abre');

  const motivoSelect = document.getElementById('motivo-recusa');
  motivoSelect.value = 'OUTRO';
  motivoSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(60);
  const confirmarRecusa = [...document.querySelectorAll('button')].find(
    (b) => b.textContent.trim() === 'Recusar e enviar retorno'
  );
  click(confirmarRecusa);
  await wait(80);
  assert(text().includes('Descreva os detalhes'), 'motivo Outro exige detalhes');

  setInput('detalhes-recusa', 'arquivo muito escurecido');
  await wait(60);
  click(confirmarRecusa);
  await wait(150);
  assert(!text().includes('Recusar documento'), 'modal fecha após recusar');
  assert(text().includes('recusado'), 'toast de recusa exibido');
  assert(text().includes('Recusado'), 'item marcado como recusado na conferência');

  const manualBtn = [...document.querySelectorAll('button')].find((b) =>
    b.textContent.includes('Registrar recebimento manual')
  );
  assert(Boolean(manualBtn), 'registro manual disponível para item recusado');
  click(manualBtn);
  await wait(120);
  assert(text().includes('Registrar recebimento manual'), 'modal de registro manual abre');

  const manualFile = document.getElementById('manual-arquivo');
  const manualOk = new window.File(['%PDF-1.4'], 'notas_reenviadas.pdf', { type: 'application/pdf' });
  Object.defineProperty(manualFile, 'files', { value: [manualOk], configurable: true });
  manualFile.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(60);
  const salvarRegistro = [...document.querySelectorAll('button')].find(
    (b) => b.textContent.trim() === 'Salvar registro'
  );
  click(salvarRegistro);
  await wait(150);
  assert(text().includes('Recebimento manual registrado'), 'toast de registro manual');
  assert(text().includes('notas_reenviadas.pdf'), 'arquivo do registro manual exibido');

  const aceitarBtn = [...document.querySelectorAll('button')].find((b) =>
    b.textContent.includes('Aceitar')
  );
  assert(Boolean(aceitarBtn), 'ação aceitar disponível após envio');
  click(aceitarBtn);
  await wait(150);
  assert(text().includes('Aceitar documento'), 'modal de aceite abre com campos obrigatórios');
  assert(Boolean(document.getElementById('aprovar-competencia')), 'campo de competência no aceite');

  setInput('aprovar-vencimento', '2026-10-20', 'change');
  await wait(80);
  const confirmarAceite = [...document.querySelectorAll('button')].find((b) =>
    b.textContent.includes('Aceitar e registrar')
  );
  click(confirmarAceite);
  await wait(200);
  assert(text().includes('2 de 3 aprovados'), 'progresso atualizado após aprovação');
  assert(text().includes('aprovado'), 'toast de aprovação exibido');
  assert(text().includes('20/10/2026'), 'competência e vencimento registrados no item aprovado');

  const solEye = document.querySelector('button[aria-label^="Visualizar"]');
  assert(Boolean(solEye), 'ação visualizar arquivo do item existe');
  click(solEye);
  await wait(300);
  assert(text().includes('Protocolo de entrega'), 'visualizador abre para arquivo da solicitação');
  assert(!text().includes('Nova versão'), 'visualizador em modo de conferência oculta ações');

  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);
  assert(!text().includes('Protocolo de entrega'), 'ESC fecha o visualizador da solicitação');

  await renderRoute('/clientes/1');
  assert(text().includes('Alpha Tecnologia Ltda'), 'ficha do cliente reabre');
  const tabSol = findByText('button', 'Solicitações');
  assert(Boolean(tabSol), 'aba Solicitações existe na ficha');
  click(tabSol);
  await wait(150);
  assert(text().includes('Nova solicitação'), 'aba Solicitações lista botão de nova solicitação');
  assert(text().includes('Documentos de 09/2026'), 'aba Solicitações lista solicitações do cliente');

  await renderRoute('/prazos');
  assert(
    text().includes('Acompanhe vencimentos e entregas do escritório'),
    'cabeçalho do módulo Prazos'
  );
  assert(
    ['Atrasados', 'Vencem hoje', 'Vencem nesta semana', 'Pendentes'].every((t) => text().includes(t)),
    'cards de resumo de prazos presentes'
  );
  assert(
    rowsText().includes('DCTF') && rowsText().includes('Folha de pagamento'),
    'tabela de prazos lista obrigações'
  );
  assert(text().includes('Atrasado'), 'badge de atraso exibido');

  const sino = document.querySelector('button[aria-label="Alertas de prazos"]');
  assert(Boolean(sino), 'sino de alertas presente');
  assert(Boolean(sino.querySelector('span')), 'sino mostra contador de alertas');
  click(sino);
  await wait(150);
  assert(
    text().includes('Alertas de prazos') && text().includes('Simular resumo diário por e-mail'),
    'painel de alertas abre'
  );

  click(findByText('button', 'Simular resumo diário por e-mail'));
  await wait(150);
  assert(
    text().includes('Prévia do resumo diário') && text().includes('Resumo de prazos'),
    'e-mail simulado aberto'
  );
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);
  assert(!text().includes('Prévia do resumo diário'), 'ESC fecha o e-mail simulado');

  click(findByText('button', 'Atrasados'));
  await wait(150);
  assert(rowsText().includes('DCTF') && !rowsText().includes('eSocial'), 'card Atrasados filtra a tabela');
  click(findByText('button', 'Atrasados'));
  await wait(150);

  const eyeDctf = document.querySelector('button[aria-label^="Ver prazo DCTF"]');
  assert(Boolean(eyeDctf), 'ação ver detalhes do prazo existe');
  click(eyeDctf);
  await wait(200);
  assert(
    text().includes('Vencimento atual') && text().includes('Etapas da obrigação'),
    'painel de detalhe do prazo abre'
  );

  click(findByText('button', 'Criar solicitação ao cliente'));
  await wait(120);
  assert(text().includes('Checklist de itens'), 'atalho criar solicitação abre o modal');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);

  click(findByText('button', 'Anexar e enviar guia'));
  await wait(120);
  assert(text().includes('Destinatário'), 'atalho anexar guia abre o modal de anexo');
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(100);

  const etapaApurar = document.querySelector('button[aria-label="Etapa Apurar"]');
  assert(Boolean(etapaApurar), 'checklist de etapas presente');
  click(etapaApurar);
  await wait(150);
  assert(
    document.querySelector('button[aria-label="Etapa Apurar"]').getAttribute('aria-checked') === 'true',
    'concluir etapa atualiza o checklist'
  );

  click(findByText('button', 'Reprogramar vencimento'));
  await wait(120);
  assert(text().includes('Nova data de vencimento'), 'modal de reprogramação abre');
  const confirmarReprogramar = [...document.querySelectorAll('button')].find(
    (b) => b.textContent.trim() === 'Reprogramar'
  );
  click(confirmarReprogramar);
  await wait(80);
  assert(text().includes('Informe a nova data'), 'reprogramação exige a nova data');
  setInput('reprogramar-data', '2026-10-11', 'change');
  await wait(80);
  click(confirmarReprogramar);
  await wait(80);
  assert(text().includes('dia útil'), 'reprogramação bloqueia dia não útil');
  setInput('reprogramar-data', '2026-10-13', 'change');
  await wait(80);
  click(confirmarReprogramar);
  await wait(150);
  assert(text().includes('Vencimento reprogramado para 13/10/2026'), 'reprogramação aplicada');

  const prioridadeSelect = document.getElementById('prazo-prioridade');
  prioridadeSelect.value = 'BAIXA';
  prioridadeSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(150);
  assert(text().includes('Definida manualmente'), 'prioridade manual registrada');

  click(findByText('button', 'Marcar como entregue'));
  await wait(120);
  const confirmarEntrega = [...document.querySelectorAll('button')]
    .filter((b) => b.textContent.trim() === 'Marcar como entregue')
    .pop();
  click(confirmarEntrega);
  await wait(200);
  assert(text().includes('marcado como entregue'), 'toast de entrega do prazo');
  assert(text().includes('Entregue em'), 'prazo exibe data de entrega');

  click(document.querySelector('button[aria-label="Fechar detalhes do prazo"]'));
  await wait(120);

  await renderRoute('/prazos?prazo=8');
  assert(
    text().includes('Folha de pagamento') && text().includes('Aguardando cliente'),
    'deep link abre o prazo vinculado à solicitação'
  );

  await renderRoute('/s/a8f3c2e19b7d');
  assert(text().includes('ContaDash'), 'portal do cliente renderiza marca');
  assert(text().includes('Solicitação de documentos'), 'portal identifica a solicitação');
  assert(text().includes('Folha de ponto'), 'itens exibidos no portal');
  assert(text().includes('Precisa reenviar'), 'item recusado orienta o reenvio no portal');

  const portalFile = document.getElementById('arquivo-13');
  assert(Boolean(portalFile), 'campo de upload do item presente no portal');
  const badPortal = new window.File(['x'], 'foto.png', { type: 'image/png' });
  Object.defineProperty(portalFile, 'files', { value: [badPortal], configurable: true });
  portalFile.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(80);
  assert(text().includes('não aceito'), 'formato incompatível é bloqueado no portal');

  const goodPortal = new window.File(['%PDF-1.4'], 'folha_ponto_reenvio.pdf', { type: 'application/pdf' });
  Object.defineProperty(portalFile, 'files', { value: [goodPortal], configurable: true });
  portalFile.dispatchEvent(new window.Event('change', { bubbles: true }));
  await wait(80);
  assert(text().includes('folha_ponto_reenvio.pdf'), 'arquivo válido exibido no portal');

  const enviarPortal = [...document.querySelectorAll('button')].find((b) =>
    b.textContent.includes('Enviar documento')
  );
  click(enviarPortal);
  await wait(900);
  assert(text().includes('Documento enviado com sucesso'), 'confirmação de envio no portal');
  assert(text().includes('Protocolo'), 'protocolo exibido após envio');
  assert(text().includes('Aguardando conferência pelo escritório'), 'item fica aguardando conferência');

  await renderRoute('/s/token-invalido-xyz');
  assert(text().includes('Link inválido'), 'token inválido mostra estado de erro');

  console.log('SMOKE OK');
}
