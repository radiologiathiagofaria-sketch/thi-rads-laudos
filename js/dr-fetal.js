// js/dr-fetal.js
// Assistente Inteligente de Medicina Fetal - Dr. Fetal
// Módulo 100% independente que não modifica a lógica existente do sistema.

(function() {
  'use strict';

  // ============================================================
  // ESTADO DO ASSISTENTE
  // ============================================================
  let estadoAtual = 'normal';
  let analiseAtual = null;
  let modalAberto = false;

  const IMG_NORMAL = 'img/dr-fetal-normal.jpg';
  const IMG_ALERT = 'img/dr-fetal-alert.jpg';

  // ============================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================

  function lerValor(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function parsePercentil(valStr, idRaw = null) {
    if (idRaw) {
      let raw = lerValor(idRaw);
      if (raw && !isNaN(parseFloat(raw))) return parseFloat(raw);
    }
    if (!valStr || valStr === '---' || valStr.trim() === '') return null;
    let v = valStr.trim().toLowerCase();
    if (v.startsWith('< p') || v.startsWith('<p')) {
      let n = parseInt(v.replace(/[^0-9]/g, ''));
      return Math.max(n - 0.1, 0.1);
    }
    if (v.startsWith('> p') || v.startsWith('>p')) {
      let n = parseInt(v.replace(/[^0-9]/g, ''));
      return Math.min(n + 0.1, 99.9);
    }
    let n = parseFloat(v.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }

  function formatarPercentilText(p) {
    if (p === null) return '---';
    if (p < 3) return '< p3';
    if (p > 97) return '> p97';
    return `p${Math.round(p)}`;
  }

  // ============================================================
  // LÓGICA MÉDICA (FGR)
  // ============================================================

  function analisarDados() {
    const igSem = parseInt(lerValor('ig_sem')) || 0;
    const igDias = parseInt(lerValor('ig_dias')) || 0;

    const pesoRaw = lerValor('peso');
    const pPesoNum = parsePercentil(lerValor('p_peso'), 'p_peso_raw');

    const caVal = parseFloat(lerValor('ca'));
    let pCaNum = null;
    if (caVal > 0 && igSem > 0 && window.calculos && window.calculos.calcPercentilParametroRaw) {
      pCaNum = window.calculos.calcPercentilParametroRaw('ca', caVal, igSem, igDias);
    } else {
      // Fallback
      pCaNum = parsePercentil(lerValor('p_ca'), 'p_ca_raw');
    }

    const cardDoppler = document.getElementById('card-doppler');
    const temDopplerHabilitado = cardDoppler && cardDoppler.style.display !== 'none';
    
    const pUmb = parsePercentil(lerValor('p_umb'), 'p_umb_raw');
    const pCer = parsePercentil(lerValor('p_cer'), 'p_cer_raw');
    const pRcp = parsePercentil(lerValor('p_rcp'), 'p_rcp_raw');
    const pUtMedio = parsePercentil(lerValor('p_ut_medio'), 'p_ut_medio_raw');
    const pDv = parsePercentil(lerValor('p_dv'), 'p_dv_raw');
    const ondaA = lerValor('onda_a_dv');
    const exibirUterinas = document.getElementById('exibir_uterinas') ? document.getElementById('exibir_uterinas').checked : false;
    const exibirDucto = document.getElementById('exibir_ducto') ? document.getElementById('exibir_ducto').checked : false;

    if (igSem === 0 || pPesoNum === null) return null;

    // Critérios Delphi e Barcelona
    let criterios = {
      pesoAbaixoP3: pPesoNum < 3.0,
      pesoAbaixoP10: pPesoNum < 10.0,
      caAbaixoP3: pCaNum !== null && pCaNum < 3.0,
      caAbaixoP10: pCaNum !== null && pCaNum < 10.0,
      umbElevado: pUmb !== null && pUmb >= 95.0,
      rcpReduzido: pRcp !== null && pRcp < 5.0,
      utElevado: (exibirUterinas && pUtMedio !== null && pUtMedio >= 95.0),
      dvAlterado: (exibirDucto && (pDv >= 95.0 || ondaA === 'ausente' || ondaA === 'reversa'))
    };

    let diagnostico = '';
    let explicacao = [];
    let nivelAlerta = 0; // 0: Verde, 1: Amarelo, 2: Laranja, 3: Vermelho
    let classeCSS = '';

    const isPrecoce = igSem < 32;
    const temCriterioMaior = criterios.pesoAbaixoP3 || criterios.caAbaixoP3;
    const temCriterioMenor = criterios.pesoAbaixoP10 || criterios.caAbaixoP10;
    
    let criteriosDopplerAlterados = 0;
    if (criterios.umbElevado) criteriosDopplerAlterados++;
    if (criterios.rcpReduzido) criteriosDopplerAlterados++;
    if (criterios.utElevado) criteriosDopplerAlterados++;

    let diagCrescimento = '';
    let diagHemodinamico = '';

    // Eixo 1: CRESCIMENTO
    if (temCriterioMaior) {
      diagCrescimento = isPrecoce ? 'Restrição de Crescimento Fetal Precoce' : 'Restrição de Crescimento Fetal Tardia';
      nivelAlerta = 3;
      classeCSS = 'drfetal-class-fgr';
      explicacao.push(`Observei que o ${criterios.pesoAbaixoP3 ? 'peso fetal' : 'percentil da CA'} encontra-se abaixo do percentil 3.`);
      explicacao.push(`Segundo o Consenso Delphi, este achado isolado preenche critério maior para Restrição de Crescimento Fetal (FGR).`);
    } else if (temCriterioMenor) {
      if (!temDopplerHabilitado) {
        diagCrescimento = 'Crescimento Fetal Limítrofe (p3-p10)';
        nivelAlerta = 1;
        classeCSS = 'drfetal-class-sga';
        explicacao.push(`O peso ou a CA encontra-se entre os percentis 3 e 10.`);
        explicacao.push(`Sem a avaliação Doppler, é classificado preliminarmente como SGA. Recomendo estudo dopplervelocimétrico.`);
      } else {
        if (isPrecoce && (criterios.umbElevado || criterios.utElevado)) {
          diagCrescimento = 'Restrição de Crescimento Fetal Precoce';
          nivelAlerta = 3;
          classeCSS = 'drfetal-class-fgr';
          explicacao.push(`O percentil (< p10) está associado a alteração hemodinâmica (Umblical ou Uterinas > p95).`);
          explicacao.push(`Esta associação confirma o diagnóstico de FGR precoce segundo o Consenso Delphi.`);
        } else if (!isPrecoce && criteriosDopplerAlterados >= 2) {
          diagCrescimento = 'Restrição de Crescimento Fetal Tardia';
          nivelAlerta = 3;
          classeCSS = 'drfetal-class-fgr';
          explicacao.push(`O percentil (< p10) está associado a múltiplos critérios hemodinâmicos alterados.`);
          explicacao.push(`Esta associação (≥ 2 critérios menores) confirma FGR tardia segundo o Consenso Delphi.`);
        } else {
          diagCrescimento = 'Feto Pequeno para Idade Gestacional (SGA)';
          nivelAlerta = (criteriosDopplerAlterados === 1) ? 2 : 1; 
          classeCSS = 'drfetal-class-sga';
          explicacao.push(`O peso ou a CA encontra-se entre p3 e p10.`);
          if (criteriosDopplerAlterados === 1) {
            explicacao.push(`Apresenta 1 critério Doppler alterado, não preenchendo critérios completos para FGR tardia, mas necessita vigilância estrita.`);
          } else {
            explicacao.push(`O estudo Doppler está normal, sugerindo feto constitucionalmente pequeno (SGA).`);
          }
        }
      }
    } else if (pPesoNum > 90) {
      diagCrescimento = 'Feto Grande para Idade Gestacional (LGA)';
      nivelAlerta = 1;
      classeCSS = 'drfetal-class-grande';
      explicacao.push(`O peso fetal encontra-se acima do percentil 90.`);
    } else {
      diagCrescimento = 'Crescimento Fetal Adequado';
      nivelAlerta = 0;
      classeCSS = 'drfetal-class-adequado';
      explicacao.push(`O peso fetal encontra-se dentro da normalidade (p10-p90).`);
    }

    // Eixo 2: HEMODINÂMICA (Independente do Crescimento)
    if (temDopplerHabilitado) {
      if (criterios.dvAlterado) {
        diagHemodinamico = 'Risco de Hipóxia Severa (Ducto Venoso)';
        nivelAlerta = 3;
        explicacao.push(`⚠️ ATENÇÃO: Alteração grave no Ducto Venoso indicando risco agudo.`);
      } else if (criteriosDopplerAlterados > 0) {
        diagHemodinamico = 'Redistribuição Hemodinâmica / Insuf. Placentária';
        nivelAlerta = Math.max(nivelAlerta, 2);
        explicacao.push(`⚠️ Estudo Doppler evidencia aumento de resistência placentária ou centralização, independente do peso.`);
      }
    }

    diagnostico = diagCrescimento;
    if (diagHemodinamico && !diagnostico.includes('FGR')) {
      diagnostico += ` — ${diagHemodinamico}`;
    }

    let textoFinal = '';
    if (temCriterioMaior || (temCriterioMenor && temDopplerHabilitado && (isPrecoce ? (criterios.umbElevado || criterios.utElevado) : criteriosDopplerAlterados >= 2))) {
       const tipo = isPrecoce ? 'precoce' : 'tardio';
       textoFinal = `Achados compatíveis com restrição de crescimento fetal de início ${tipo}, conforme os critérios do Consenso Delphi.`;
       if (criterios.dvAlterado) {
          textoFinal += ' Observa-se alteração significativa no fluxo do ducto venoso, achado indicativo de risco para hipóxia severa.';
       } else if (criteriosDopplerAlterados > 0) {
          textoFinal += ' O estudo dopplervelocimétrico evidencia sinais de aumento de resistência placentária ou redistribuição hemodinâmica.';
       }
    } else if (temCriterioMenor) {
       textoFinal = 'Feto pequeno para a idade gestacional';
       if (!temDopplerHabilitado) {
          textoFinal += '. Recomenda-se estudo dopplervelocimétrico para adequada avaliação hemodinâmica.';
       } else if (criterios.dvAlterado) {
          textoFinal += ', associado a alteração significativa no fluxo do ducto venoso, indicativo de risco para hipóxia.';
       } else if (criteriosDopplerAlterados > 0) {
          textoFinal += ', associado a sinais de redistribuição hemodinâmica fetal, sugestivos de insuficiência placentária.';
       } else {
          textoFinal += ', apresentando estudo dopplervelocimétrico dentro dos limites da normalidade para a idade gestacional.';
       }
    } else if (pPesoNum > 90) {
       textoFinal = 'Exame demonstrando biometria compatível com feto grande para a idade gestacional.';
       if (temDopplerHabilitado) {
          if (criterios.dvAlterado) {
             textoFinal += ' Observa-se alteração significativa no fluxo do ducto venoso.';
          } else if (criteriosDopplerAlterados > 0) {
             textoFinal += ' Associa-se a sinais de redistribuição hemodinâmica fetal.';
          }
       }
    } else {
       textoFinal = 'Crescimento fetal adequado para a idade gestacional.';
       if (temDopplerHabilitado) {
          if (criterios.dvAlterado) {
             textoFinal = 'Crescimento fetal adequado para a idade gestacional, porém com alteração significativa no fluxo do ducto venoso.';
          } else if (criteriosDopplerAlterados > 0) {
             textoFinal = 'Crescimento fetal adequado para a idade gestacional, associado a sinais de redistribuição hemodinâmica fetal, sugestivos de insuficiência placentária.';
          }
       }
    }

    return {
      ig: `${igSem}s ${igDias}d`, peso: pesoRaw, pPeso: formatarPercentilText(pPesoNum),
      ca: caVal, pCa: formatarPercentilText(pCaNum), temDoppler: temDopplerHabilitado,
      pUmb: formatarPercentilText(pUmb), pCer: formatarPercentilText(pCer), pRcp: formatarPercentilText(pRcp),
      pUt: exibirUterinas ? formatarPercentilText(pUtMedio) : null,
      pDv: exibirDucto ? formatarPercentilText(pDv) : null,
      criterios: criterios, diagnostico: diagnostico, explicacao: explicacao,
      classeCSS: classeCSS, isAlerta: nivelAlerta > 0, nivelAlerta: nivelAlerta,
      conclusaoTextual: textoFinal
    };
  }

  // ============================================================
  // UI DO DR. FETAL (BALÃO E AVATAR)
  // ============================================================

  function construirUI() {
    const container = document.createElement('div');
    container.id = 'drfetal-container';
    container.className = 'drfetal-container';

    const balloon = document.createElement('div');
    balloon.id = 'drfetal-balloon';
    balloon.className = 'drfetal-balloon';
    balloon.innerHTML = `
      <div class="drfetal-balloon-icon" id="drfetal-balloon-icon">⚠️</div>
      <span id="drfetal-balloon-msg">Revisão sugerida.</span>
      <a class="drfetal-balloon-link">Clique para abrir o Assistente</a>
    `;

    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'drfetal-avatar-wrapper';
    avatarWrapper.id = 'drfetal-avatar-btn';
    avatarWrapper.title = "Assistente de Medicina Fetal";

    const avatar = document.createElement('img');
    avatar.id = 'drfetal-avatar-img';
    avatar.className = 'drfetal-avatar';
    avatar.src = IMG_NORMAL;

    const statusDot = document.createElement('div');
    statusDot.id = 'drfetal-status-dot';
    statusDot.className = 'drfetal-status-dot';

    avatarWrapper.appendChild(avatar);
    avatarWrapper.appendChild(statusDot);

    container.appendChild(balloon);
    container.appendChild(avatarWrapper);

    document.body.appendChild(container);

    avatarWrapper.addEventListener('click', abrirModal);
    balloon.addEventListener('click', abrirModal);

    construirModal();
  }

  function atualizarEstado() {
    const analise = analisarDados();
    analiseAtual = analise;

    const avatar = document.getElementById('drfetal-avatar-img');
    const balloon = document.getElementById('drfetal-balloon');
    const statusDot = document.getElementById('drfetal-status-dot');
    const balloonMsg = document.getElementById('drfetal-balloon-msg');
    const balloonIcon = document.getElementById('drfetal-balloon-icon');

    if (analise && analise.isAlerta) {
      estadoAtual = 'alerta';
      avatar.src = IMG_ALERT;
      avatar.classList.add('drfetal-alert');
      
      let cor = '';
      if (analise.nivelAlerta === 3) cor = '#ef4444'; // Vermelho
      else if (analise.nivelAlerta === 2) cor = '#f97316'; // Laranja
      else cor = '#eab308'; // Amarelo

      avatar.style.borderColor = cor;
      statusDot.style.background = cor;
      statusDot.style.borderColor = '#0a192f'; // Garante o contraste
      balloon.style.borderColor = cor;
      balloonIcon.textContent = analise.nivelAlerta === 3 ? '🚨' : '⚠️';

      if (analise.nivelAlerta === 3) {
        balloonMsg.textContent = 'Prioridade: Revisão clínica crítica necessária.';
      } else if (analise.nivelAlerta === 2) {
        balloonMsg.textContent = 'Atenção: Alterações detectadas merecem revisão.';
      } else {
        balloonMsg.textContent = 'Observação: Parâmetros fora da faixa ideal.';
      }
      
      // Fadiga de alertas: Só exibe o balão se nível >= 2 (Laranja ou Vermelho)
      if (analise.nivelAlerta >= 2) {
        balloon.classList.add('drfetal-visible');
      } else {
        balloon.classList.remove('drfetal-visible');
      }
    } else {
      estadoAtual = 'normal';
      avatar.src = IMG_NORMAL;
      avatar.classList.remove('drfetal-alert');
      avatar.style.borderColor = '';
      statusDot.style.background = '';
      balloon.style.borderColor = '';
      balloon.classList.remove('drfetal-visible');
    }
  }

  // ============================================================
  // MODAL
  // ============================================================

  function construirModal() {
    const overlay = document.createElement('div');
    overlay.id = 'drfetal-modal-overlay';
    overlay.className = 'drfetal-modal-overlay';

    overlay.innerHTML = `
      <div class="drfetal-modal" id="drfetal-modal">
        <div class="drfetal-modal-header">
          <div class="drfetal-modal-header-content">
            <img src="${IMG_NORMAL}" class="drfetal-modal-avatar" id="drfetal-modal-avatar">
            <div>
              <div class="drfetal-modal-title">Assistente de Medicina Fetal</div>
              <div class="drfetal-modal-subtitle">"Vamos revisar este caso juntos."</div>
            </div>
          </div>
          <button class="drfetal-modal-close" id="drfetal-close-btn">✕</button>
        </div>
        
        <div class="drfetal-modal-body" id="drfetal-modal-body">
          <!-- Dinâmico -->
        </div>

        <div class="drfetal-modal-footer">
          <button class="drfetal-btn drfetal-btn-secondary" id="drfetal-btn-ignorar">Ignorar</button>
          <button class="drfetal-btn drfetal-btn-primary" id="drfetal-btn-aplicar">✓ Aplicar ao Laudo</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('drfetal-close-btn').addEventListener('click', fecharModal);
    document.getElementById('drfetal-btn-ignorar').addEventListener('click', fecharModal);
    document.getElementById('drfetal-btn-aplicar').addEventListener('click', aplicarAoLaudo);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fecharModal();
    });
  }

  function renderizarConteudoModal() {
    const body = document.getElementById('drfetal-modal-body');
    if (!analiseAtual) {
      body.innerHTML = `<div class="drfetal-narrative">"Ainda não há dados suficientes para realizar uma análise completa. Preencha as biometrias e a idade gestacional."</div>`;
      return;
    }

    const {
      ig, peso, pPeso, ca, pCa, temDoppler, pUmb, pCer, pRcp, pUt, pDv, 
      criterios, diagnostico, explicacao, classeCSS, nivelAlerta
    } = analiseAtual;

    let narrativaHtml = explicacao.map(p => `<div>${p}</div>`).join('<br>');

    let critHtml = '';
    const addCrit = (cond, texto) => {
      let icon = cond ? '<span class="drfetal-check">✔</span>' : '<span class="drfetal-uncheck">✘</span>';
      critHtml += `<li>${icon} ${texto}</li>`;
    };

    addCrit(criterios.pesoAbaixoP3, `Peso fetal < P3`);
    if (!criterios.pesoAbaixoP3) addCrit(criterios.pesoAbaixoP10, `Peso fetal < P10`);
    addCrit(criterios.caAbaixoP3, `Circunferência Abdominal (CA) < P3`);
    
    if (temDoppler) {
      addCrit(criterios.umbElevado, `IP Umbilical ≥ P95`);
      addCrit(criterios.rcpReduzido, `Relação Cérebro-Placentária (RCP) < P5`);
      if (pUt) addCrit(criterios.utElevado, `IP Médio Uterinas ≥ P95`);
      if (pDv) addCrit(criterios.dvAlterado, `Ducto Venoso Alterado (≥ P95 ou ausente/reverso)`);
    }

    // Sugestão de conclusão gerada pela lógica de linguagem natural
    let sugestaoConclusao = "- " + analiseAtual.conclusaoTextual;

    body.innerHTML = `
      <div class="drfetal-narrative">
        ${narrativaHtml}
      </div>

      <div class="drfetal-classification ${classeCSS}">
        ${diagnostico}
      </div>

      <table class="drfetal-data-table">
        <thead>
          <tr>
            <th>Parâmetro</th>
            <th>Valor</th>
            <th>Percentil</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Idade Gestacional</td><td>${ig}</td><td>---</td></tr>
          <tr><td>Peso Estimado</td><td>${peso || '---'} g</td><td class="${criterios.pesoAbaixoP10 ? 'drfetal-val-danger' : ''}">${pPeso}</td></tr>
          <tr><td>Circunferência Abd.</td><td>${ca || '---'} mm</td><td class="${criterios.caAbaixoP10 ? 'drfetal-val-warning' : ''}">${pCa}</td></tr>
          ${temDoppler ? `
            <tr><td>IP Umbilical</td><td>---</td><td class="${criterios.umbElevado ? 'drfetal-val-danger' : ''}">${pUmb}</td></tr>
            <tr><td>RCP</td><td>---</td><td class="${criterios.rcpReduzido ? 'drfetal-val-danger' : ''}">${pRcp}</td></tr>
            ${pUt ? `<tr><td>IP Uterinas (médio)</td><td>---</td><td class="${criterios.utElevado ? 'drfetal-val-warning' : ''}">${pUt}</td></tr>` : ''}
          ` : ''}
        </tbody>
      </table>

      <div class="drfetal-criteria-title">Critérios Analisados</div>
      <ul class="drfetal-criteria-list">
        ${critHtml}
      </ul>

      <div class="drfetal-guidelines">
        <div class="drfetal-guidelines-title">Esta classificação foi baseada em:</div>
        <ul class="drfetal-guidelines-list">
          <li>Delphi Consensus on FGR</li>
          <li>Barcelona Fetal Medicine Center</li>
          <li>ISUOG Practice Guidelines</li>
        </ul>
      </div>

      <hr class="drfetal-separator">

      <div class="drfetal-conclusion-section">
        <div class="drfetal-conclusion-label">Conclusão Sugerida (Editável)</div>
        <textarea id="drfetal-conclusion-text" class="drfetal-conclusion-box">${sugestaoConclusao}</textarea>
        
        <label class="drfetal-ref-check">
          <input type="checkbox" id="drfetal-include-refs" checked>
          Inserir referências científicas no laudo
        </label>
      </div>
    `;

    const modalAvatar = document.getElementById('drfetal-modal-avatar');
    if (analiseAtual.isAlerta) {
      modalAvatar.src = IMG_ALERT;
      let cor = '';
      if (nivelAlerta === 3) cor = '#ef4444';
      else if (nivelAlerta === 2) cor = '#f97316';
      else cor = '#eab308';
      modalAvatar.style.borderColor = cor;
    } else {
      modalAvatar.src = IMG_NORMAL;
      modalAvatar.style.borderColor = 'rgba(0, 242, 255, 0.3)';
    }
  }

  function abrirModal() {
    if (!analiseAtual) analisarDados();
    renderizarConteudoModal();
    const overlay = document.getElementById('drfetal-modal-overlay');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.classList.add('drfetal-visible');
    });
    modalAberto = true;
    
    const balloon = document.getElementById('drfetal-balloon');
    if (balloon) balloon.classList.remove('drfetal-visible');
  }

  function fecharModal() {
    const overlay = document.getElementById('drfetal-modal-overlay');
    overlay.classList.remove('drfetal-visible');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 350);
    modalAberto = false;
  }

  function aplicarAoLaudo() {
    const textarea = document.getElementById('drfetal-conclusion-text');
    const includeRefs = document.getElementById('drfetal-include-refs').checked;
    
    let conclusao = textarea.value.trim();
    if (!conclusao) {
      fecharModal();
      return;
    }

    if (includeRefs) {
      const refsText = `
        <br><div style="font-size: 7.5pt; color: #64748b; margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 5px;">
          <i>Referências (Assistente):</i><br>
          • Gordijn SJ et al. Delphi Consensus on FGR.<br>
          • ISUOG Practice Guidelines.<br>
          • Barcelona Fetal Medicine Research Center.
        </div>
      `;
      conclusao += refsText;
    }

    const editor = document.getElementById('report-editor');
    if (editor) {
      let html = editor.innerHTML;
      
      // Regex Resiliente para achar conclusões padrões do templates.js mesmo modificadas levemente
      const regexSubstituicao = /-\s*(Crescimento fetal adequado|Feto pequeno para idade gestacional|Restrição de crescimento|Feto grande para idade gestacional).*?(?=(<br>|<\/div>|<\/p>|$|-))/i;
      
      if (regexSubstituicao.test(html)) {
        html = html.replace(regexSubstituicao, conclusao);
      } else if (html.includes('Nota: O objetivo')) {
        // Se não achou, anexa antes da nota de rodapé
        html = html.replace('<span style="font-size: 8pt;">Nota: O objetivo', conclusao + '<br><br><span style="font-size: 8pt;">Nota: O objetivo');
      } else {
        // Fallback final: anexa no fim
        html += '<br><br>' + conclusao;
      }

      editor.innerHTML = html;

      // Animação visual no editor
      editor.style.boxShadow = '0 0 15px rgba(0, 242, 255, 0.5)';
      setTimeout(() => {
        editor.style.boxShadow = '';
      }, 1000);
    }

    fecharModal();
  }

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  function iniciar() {
    construirUI();
    
    const formInputs = document.querySelectorAll('.form-column input, .form-column select');
    formInputs.forEach(input => {
      input.addEventListener('input', () => setTimeout(atualizarEstado, 300));
      input.addEventListener('change', () => setTimeout(atualizarEstado, 300));
    });

    const editor = document.getElementById('report-editor');
    if (editor) {
      const observer = new MutationObserver(() => {
        if (!modalAberto) atualizarEstado();
      });
      observer.observe(editor, { childList: true, subtree: true, characterData: true });
    }

    setInterval(() => {
      if (!modalAberto) atualizarEstado();
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})();

