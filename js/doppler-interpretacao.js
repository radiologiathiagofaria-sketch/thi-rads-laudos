// doppler-interpretacao.js
// Módulo de Interpretação Clínica do Doppler Fetal
// Este arquivo é 100% independente e NÃO modifica nenhuma função existente.
// Baseado em: Medicina Fetal Barcelona, FMF, ISUOG Practice Guidelines, FIGO, Febrasgo

(function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================
  let interpretacaoAplicada = null; // null = nenhuma interpretação aplicada
  let modalAberto = false;
  let alertasMostrados = {
    umbilical: false,
    acm: false,
    rcp: false,
    uterinas: false,
    ducto: false
  };

  // ============================================================
  // HELPERS — leitura dos percentis do DOM
  // ============================================================

  function extrairPercentilNumerico(valor) {
    // Formatos possíveis: "p87", "p5", "< p3", "> p97", "< p5", "> p95", ""
    if (!valor || valor === '---' || valor.trim() === '') return null;
    let v = valor.trim().toLowerCase();
    // "< p3" → 2  |  "> p97" → 98  |  "p45" → 45
    if (v.startsWith('< p') || v.startsWith('<p')) {
      let n = parseInt(v.replace(/[^0-9]/g, ''));
      return Math.max(n - 1, 1); // abaixo do limite
    }
    if (v.startsWith('> p') || v.startsWith('>p')) {
      let n = parseInt(v.replace(/[^0-9]/g, ''));
      return Math.min(n + 1, 99); // acima do limite
    }
    let n = parseInt(v.replace(/[^0-9]/g, ''));
    return isNaN(n) ? null : n;
  }

  function lerCampoDom(id) {
    let el = document.getElementById(id);
    return el ? el.value : '';
  }

  // ============================================================
  // DETECÇÃO DE ALTERAÇÕES DOPPLER
  // ============================================================

  function detectarAlteracoes() {
    let alteracoes = {
      umbilical: false,
      acm: false,
      rcp: false,
      uterinas: false,
      ducto: false,
      temAlteracao: false
    };

    // Só analisa se estamos no modo doppler
    let cardDoppler = document.getElementById('card-doppler');
    if (!cardDoppler || cardDoppler.style.display === 'none') return alteracoes;

    // Umbilical — percentil >= 95
    let pUmb = extrairPercentilNumerico(lerCampoDom('p_umb'));
    if (pUmb !== null && pUmb >= 95) {
      alteracoes.umbilical = true;
    }

    // ACM — percentil <= 5
    let pCer = extrairPercentilNumerico(lerCampoDom('p_cer'));
    if (pCer !== null && pCer <= 5) {
      alteracoes.acm = true;
    }

    // RCP — percentil <= 5
    let pRcp = extrairPercentilNumerico(lerCampoDom('p_rcp'));
    if (pRcp !== null && pRcp <= 5) {
      alteracoes.rcp = true;
    }

    // Uterinas — percentil médio >= 95
    let pUtMedio = extrairPercentilNumerico(lerCampoDom('p_ut_medio'));
    let exibirUterinas = document.getElementById('exibir_uterinas');
    if (exibirUterinas && exibirUterinas.checked && pUtMedio !== null && pUtMedio >= 95) {
      alteracoes.uterinas = true;
    }

    // Ducto Venoso — percentil >= 95 ou onda A ausente/reversa
    let exibirDucto = document.getElementById('exibir_ducto');
    if (exibirDucto && exibirDucto.checked) {
      let pDv = extrairPercentilNumerico(lerCampoDom('p_dv'));
      let ondaA = lerCampoDom('onda_a_dv');
      if ((pDv !== null && pDv >= 95) || ondaA === 'ausente' || ondaA === 'reversa') {
        alteracoes.ducto = true;
      }
    }

    alteracoes.temAlteracao = alteracoes.umbilical || alteracoes.acm ||
      alteracoes.rcp || alteracoes.uterinas || alteracoes.ducto;

    return alteracoes;
  }

  // ============================================================
  // AUTO-SUGESTÃO DE CHECKBOXES
  // ============================================================

  function gerarSugestoesAutomaticas() {
    let sugestoes = {
      // Umbilical
      umb_normal: true,
      umb_ip_elevado: false,
      umb_diast_reduzido: false,
      umb_diast_ausente: false,
      umb_diast_reverso: false,
      // ACM
      acm_normal: true,
      acm_ip_reduzido: false,
      acm_centralizacao: false,
      acm_vasodilatacao: false,
      // RCP
      rcp_normal: true,
      rcp_reduzida: false,
      rcp_redistribuicao: false,
      // Uterinas
      ut_normais: true,
      ut_ip_elevado: false,
      ut_incisura_unilateral: false,
      ut_incisura_bilateral: false,
      // Ducto
      dv_normal: true,
      dv_ip_elevado: false,
      dv_onda_a_ausente: false,
      dv_onda_a_reversa: false,
      // Outros
      outros_insuf_placentaria: false,
      outros_centralizacao: false,
      outros_redistribuicao: false,
      outros_piora_hemo: false,
      outros_fluxo_critico: false
    };

    // Umbilical
    let pUmb = extrairPercentilNumerico(lerCampoDom('p_umb'));
    if (pUmb !== null && pUmb >= 95) {
      sugestoes.umb_normal = false;
      sugestoes.umb_ip_elevado = true;
      sugestoes.outros_insuf_placentaria = true;
    }

    // ACM
    let pCer = extrairPercentilNumerico(lerCampoDom('p_cer'));
    if (pCer !== null && pCer <= 5) {
      sugestoes.acm_normal = false;
      sugestoes.acm_ip_reduzido = true;
      sugestoes.acm_vasodilatacao = true;
    }

    // RCP
    let pRcp = extrairPercentilNumerico(lerCampoDom('p_rcp'));
    if (pRcp !== null && pRcp <= 5) {
      sugestoes.rcp_normal = false;
      sugestoes.rcp_reduzida = true;
      sugestoes.rcp_redistribuicao = true;
    }

    // Centralização = ACM reduzido + RCP reduzido
    if (sugestoes.acm_ip_reduzido && sugestoes.rcp_reduzida) {
      sugestoes.acm_centralizacao = true;
      sugestoes.outros_centralizacao = true;
      sugestoes.outros_redistribuicao = true;
    }

    // Uterinas
    let exibirUterinas = document.getElementById('exibir_uterinas');
    if (exibirUterinas && exibirUterinas.checked) {
      let pUtMedio = extrairPercentilNumerico(lerCampoDom('p_ut_medio'));
      if (pUtMedio !== null && pUtMedio >= 95) {
        sugestoes.ut_normais = false;
        sugestoes.ut_ip_elevado = true;
      }
    }

    // Ducto Venoso
    let exibirDucto = document.getElementById('exibir_ducto');
    if (exibirDucto && exibirDucto.checked) {
      let pDv = extrairPercentilNumerico(lerCampoDom('p_dv'));
      let ondaA = lerCampoDom('onda_a_dv');

      if (pDv !== null && pDv >= 95) {
        sugestoes.dv_normal = false;
        sugestoes.dv_ip_elevado = true;
      }
      if (ondaA === 'ausente') {
        sugestoes.dv_normal = false;
        sugestoes.dv_onda_a_ausente = true;
        sugestoes.outros_piora_hemo = true;
      }
      if (ondaA === 'reversa') {
        sugestoes.dv_normal = false;
        sugestoes.dv_onda_a_reversa = true;
        sugestoes.outros_piora_hemo = true;
        sugestoes.outros_fluxo_critico = true;
      }
    }

    // Fluxo crítico: umbilical com diástole zero/reversa + ducto alterado
    // (Isso só seria pré-marcado se o usuário marcar manualmente no modal,
    //  já que a detecção de diástole zero/reversa não vem dos percentis)

    return sugestoes;
  }

  // ============================================================
  // GERAÇÃO DE CONCLUSÃO CLÍNICA
  // ============================================================

  function gerarConclusaoDoppler(selecoes) {
    let frases = [];
    let temAlteracao = false;

    // --- Artéria Umbilical ---
    if (selecoes.umb_diast_reverso) {
      frases.push('Fluxo diastólico reverso na artéria umbilical, indicando comprometimento grave da circulação placentária.');
      temAlteracao = true;
    } else if (selecoes.umb_diast_ausente) {
      frases.push('Fluxo diastólico ausente na artéria umbilical, indicando comprometimento significativo da circulação placentária.');
      temAlteracao = true;
    } else if (selecoes.umb_diast_reduzido) {
      frases.push('Fluxo diastólico reduzido na artéria umbilical, sugestivo de aumento da resistência vascular placentária.');
      temAlteracao = true;
    } else if (selecoes.umb_ip_elevado) {
      frases.push('Elevação da resistência vascular placentária evidenciada por aumento do índice de pulsatilidade da artéria umbilical.');
      temAlteracao = true;
    }

    // --- RCP --- (antes da ACM para fluxo textual lógico)
    if (selecoes.rcp_redistribuicao) {
      frases.push('Relação cérebro-placentária reduzida, compatível com redistribuição hemodinâmica fetal.');
      temAlteracao = true;
    } else if (selecoes.rcp_reduzida) {
      frases.push('Relação cérebro-placentária reduzida para a idade gestacional.');
      temAlteracao = true;
    }

    // --- ACM ---
    if (selecoes.acm_centralizacao) {
      frases.push('Padrão Doppler compatível com centralização fetal.');
      temAlteracao = true;
    } else if (selecoes.acm_vasodilatacao) {
      frases.push('Vasodilatação da artéria cerebral média com redução do índice de pulsatilidade.');
      temAlteracao = true;
    } else if (selecoes.acm_ip_reduzido) {
      frases.push('Redução do índice de pulsatilidade da artéria cerebral média.');
      temAlteracao = true;
    }

    // --- Uterinas ---
    if (selecoes.ut_incisura_bilateral) {
      frases.push('Índices de resistência das artérias uterinas elevados com incisura protodiastólica bilateral, sugerindo comprometimento da implantação placentária.');
      temAlteracao = true;
    } else if (selecoes.ut_incisura_unilateral) {
      frases.push('Índices de resistência das artérias uterinas elevados com incisura protodiastólica unilateral, sugerindo comprometimento da perfusão uteroplacentária.');
      temAlteracao = true;
    } else if (selecoes.ut_ip_elevado) {
      frases.push('Índices de resistência das artérias uterinas elevados para a idade gestacional, sugerindo comprometimento da implantação placentária.');
      temAlteracao = true;
    }

    // --- Ducto Venoso ---
    if (selecoes.dv_onda_a_reversa) {
      frases.push('Alteração do ducto venoso caracterizada por onda A reversa, indicando comprometimento hemodinâmico fetal grave.');
      temAlteracao = true;
    } else if (selecoes.dv_onda_a_ausente) {
      frases.push('Alteração do ducto venoso caracterizada por onda A ausente, indicando comprometimento hemodinâmico fetal.');
      temAlteracao = true;
    } else if (selecoes.dv_ip_elevado) {
      frases.push('Elevação do índice de pulsatilidade do ducto venoso, sugerindo aumento da pós-carga cardíaca fetal.');
      temAlteracao = true;
    }

    if (!temAlteracao) {
      return 'Dopplervelocimetria fetal dentro dos limites da normalidade para a idade gestacional.';
    }

    // --- Construção inteligente da frase combinada ---
    // Se há múltiplas alterações que formam um padrão conhecido, gerar frase combinada
    let usarCombinada = false;
    let combinada = '';

    // Padrão: Umbilical elevada + RCP reduzida + Centralização
    if (selecoes.umb_ip_elevado && selecoes.rcp_reduzida && selecoes.acm_centralizacao) {
      combinada = 'Elevação da resistência vascular placentária, associada à redução da relação cérebro-placentária e padrão de redistribuição hemodinâmica fetal (centralização).';
      usarCombinada = true;

      // Remover frases individuais já cobertas
      frases = frases.filter(f =>
        !f.includes('resistência vascular placentária evidenciada') &&
        !f.includes('Relação cérebro-placentária reduzida') &&
        !f.includes('centralização fetal')
      );
      frases.unshift(combinada);
    }
    // Padrão: Umbilical elevada + RCP reduzida (sem centralização)
    else if (selecoes.umb_ip_elevado && (selecoes.rcp_reduzida || selecoes.rcp_redistribuicao) && !selecoes.acm_centralizacao) {
      combinada = 'Elevação da resistência vascular placentária, associada à redução da relação cérebro-placentária, compatível com redistribuição hemodinâmica fetal.';
      usarCombinada = true;

      frases = frases.filter(f =>
        !f.includes('resistência vascular placentária evidenciada') &&
        !f.includes('Relação cérebro-placentária reduzida')
      );
      frases.unshift(combinada);
    }

    // Adicionar achados "Outros" como frases finais de síntese
    let sintese = [];
    if (selecoes.outros_fluxo_critico) {
      sintese.push('Achados compatíveis com fluxo crítico fetal.');
    } else if (selecoes.outros_piora_hemo) {
      sintese.push('Achados compatíveis com piora hemodinâmica fetal.');
    }
    if (selecoes.outros_insuf_placentaria && !usarCombinada) {
      // Só adiciona se não já está implícito na frase combinada
      sintese.push('Achados sugestivos de insuficiência placentária.');
    }

    // Evitar duplicatas de conceito
    let frasesFinais = [...frases];
    sintese.forEach(s => {
      // Não repetir se conceito já presente
      let conceito = s.toLowerCase();
      let jaPresentou = frasesFinais.some(f => {
        let fl = f.toLowerCase();
        if (conceito.includes('fluxo crítico') && fl.includes('fluxo crítico')) return true;
        if (conceito.includes('piora hemodinâmica') && fl.includes('comprometimento hemodinâmico')) return true;
        if (conceito.includes('insuficiência placentária') && fl.includes('resistência vascular placentária')) return true;
        return false;
      });
      if (!jaPresentou) frasesFinais.push(s);
    });

    return frasesFinais.join(' ');
  }

  // ============================================================
  // BOTÃO — MOSTRAR / ESCONDER
  // ============================================================

  const BOTAO_ID = 'btn-interpretar-doppler';

  function criarOuAtualizarBotao(mostrar) {
    let btn = document.getElementById(BOTAO_ID);

    if (!mostrar) {
      if (btn) btn.style.display = 'none';
      return;
    }

    if (!btn) {
      btn = document.createElement('button');
      btn.id = BOTAO_ID;
      btn.type = 'button';
      btn.innerHTML = '🔍 Interpretar Alterações Doppler';
      btn.addEventListener('click', abrirModal);

      // Estilo inline para seguir o tema sem alterar CSS existente
      Object.assign(btn.style, {
        display: 'block',
        width: '100%',
        marginTop: '15px',
        padding: '12px 20px',
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '0.85rem',
        fontWeight: '700',
        color: '#000',
        background: 'linear-gradient(135deg, #00f2ff, #00ff88)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(0, 242, 255, 0.3)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      });

      btn.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(0, 242, 255, 0.5)';
      });
      btn.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0, 242, 255, 0.3)';
      });

      let cardDoppler = document.getElementById('card-doppler');
      if (cardDoppler) cardDoppler.appendChild(btn);
    }

    btn.style.display = 'block';
  }

  // ============================================================
  // MODAL — CONSTRUÇÃO E LÓGICA
  // ============================================================

  function construirConteudoModal(sugestoes) {
    function grupoCheckbox(titulo, itens) {
      let html = `<div style="margin-bottom: 20px;">`;
      html += `<div style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--primary); font-weight: 600; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--card-border);">${titulo}</div>`;
      itens.forEach(item => {
        let checked = item.checked ? 'checked' : '';
        html += `<label style="display: flex; align-items: center; gap: 8px; font-weight: normal; font-size: 0.9rem; color: var(--text-main); cursor: pointer; padding: 4px 0; transition: color 0.2s;">`;
        html += `<input type="checkbox" name="${item.name}" ${checked} style="accent-color: var(--primary); width: 16px; height: 16px; cursor: pointer;">`;
        html += `<span>${item.label}</span></label>`;
      });
      html += `</div>`;
      return html;
    }

    let html = '';

    // Artéria Umbilical
    html += grupoCheckbox('Artéria Umbilical', [
      { name: 'umb_normal', label: 'Fluxo normal', checked: sugestoes.umb_normal },
      { name: 'umb_ip_elevado', label: 'IP elevado (> P95)', checked: sugestoes.umb_ip_elevado },
      { name: 'umb_diast_reduzido', label: 'Fluxo diastólico reduzido', checked: sugestoes.umb_diast_reduzido },
      { name: 'umb_diast_ausente', label: 'Fluxo diastólico ausente', checked: sugestoes.umb_diast_ausente },
      { name: 'umb_diast_reverso', label: 'Fluxo diastólico reverso', checked: sugestoes.umb_diast_reverso }
    ]);

    // Artéria Cerebral Média
    html += grupoCheckbox('Artéria Cerebral Média', [
      { name: 'acm_normal', label: 'Fluxo normal', checked: sugestoes.acm_normal },
      { name: 'acm_ip_reduzido', label: 'IP reduzido (< P5)', checked: sugestoes.acm_ip_reduzido },
      { name: 'acm_centralizacao', label: 'Centralização fetal', checked: sugestoes.acm_centralizacao },
      { name: 'acm_vasodilatacao', label: 'Vasodilatação cerebral', checked: sugestoes.acm_vasodilatacao }
    ]);

    // Relação Cerebroplacentária
    html += grupoCheckbox('Relação Cerebroplacentária (RCP)', [
      { name: 'rcp_normal', label: 'Normal', checked: sugestoes.rcp_normal },
      { name: 'rcp_reduzida', label: 'Reduzida (< P5)', checked: sugestoes.rcp_reduzida },
      { name: 'rcp_redistribuicao', label: 'Compatível com redistribuição hemodinâmica fetal', checked: sugestoes.rcp_redistribuicao }
    ]);

    // Artérias Uterinas
    html += grupoCheckbox('Artérias Uterinas', [
      { name: 'ut_normais', label: 'Normais', checked: sugestoes.ut_normais },
      { name: 'ut_ip_elevado', label: 'IP médio elevado (> P95)', checked: sugestoes.ut_ip_elevado },
      { name: 'ut_incisura_unilateral', label: 'Incisura protodiastólica unilateral', checked: sugestoes.ut_incisura_unilateral },
      { name: 'ut_incisura_bilateral', label: 'Incisura bilateral', checked: sugestoes.ut_incisura_bilateral }
    ]);

    // Ducto Venoso
    html += grupoCheckbox('Ducto Venoso', [
      { name: 'dv_normal', label: 'Normal', checked: sugestoes.dv_normal },
      { name: 'dv_ip_elevado', label: 'IP elevado', checked: sugestoes.dv_ip_elevado },
      { name: 'dv_onda_a_ausente', label: 'Onda A ausente', checked: sugestoes.dv_onda_a_ausente },
      { name: 'dv_onda_a_reversa', label: 'Onda A reversa', checked: sugestoes.dv_onda_a_reversa }
    ]);

    // Outros achados
    html += grupoCheckbox('Outros Achados', [
      { name: 'outros_insuf_placentaria', label: 'Suspeita de insuficiência placentária', checked: sugestoes.outros_insuf_placentaria },
      { name: 'outros_centralizacao', label: 'Achados compatíveis com centralização fetal', checked: sugestoes.outros_centralizacao },
      { name: 'outros_redistribuicao', label: 'Achados compatíveis com redistribuição hemodinâmica', checked: sugestoes.outros_redistribuicao },
      { name: 'outros_piora_hemo', label: 'Piora hemodinâmica fetal', checked: sugestoes.outros_piora_hemo },
      { name: 'outros_fluxo_critico', label: 'Fluxo crítico fetal', checked: sugestoes.outros_fluxo_critico }
    ]);

    // Preview da conclusão
    html += `<div id="interp-preview-box" style="margin-top: 10px; padding: 15px; background: rgba(0,242,255,0.05); border: 1px solid var(--primary); border-radius: 8px;">`;
    html += `<div style="font-family: 'Orbitron', sans-serif; font-size: 0.75rem; color: var(--primary); margin-bottom: 8px; font-weight: 600;">PRÉ-VISUALIZAÇÃO DA CONCLUSÃO DOPPLER</div>`;
    html += `<div id="interp-preview-text" style="font-family: 'Inter', sans-serif; font-size: 0.9rem; color: var(--text-main); line-height: 1.5; font-style: italic;"></div>`;
    html += `</div>`;

    return html;
  }

  function abrirModal() {
    if (modalAberto) return;
    modalAberto = true;

    let overlay = document.getElementById('interp-modal-overlay');
    let conteudo = document.getElementById('interp-modal-body');
    let sugestoes = gerarSugestoesAutomaticas();

    if (conteudo.innerHTML.trim() === '') {
      conteudo.innerHTML = construirConteudoModal(sugestoes);

      // Listeners para atualizar preview em tempo real
      conteudo.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function () {
          gerenciarExclusaoMutua(this);
          atualizarPreviewConclusao();
        });
      });
    } else {
      // Mantém o que o usuário já havia marcado, mas adiciona as novas alterações detectadas
      for (let k in sugestoes) {
        if (sugestoes[k] === true && !k.endsWith('_normal')) {
          let cb = conteudo.querySelector(`input[name="${k}"]`);
          if (cb && !cb.checked) {
            cb.checked = true;
            gerenciarExclusaoMutua(cb);
          }
        }
      }
    }

    // Atualizar preview inicial
    atualizarPreviewConclusao();

    overlay.style.display = 'flex';
    // Trigger animation
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      let panel = document.getElementById('interp-modal-panel');
      if (panel) {
        panel.style.transform = 'translateY(0) scale(1)';
        panel.style.opacity = '1';
      }
    });
  }

  function gerenciarExclusaoMutua(checkbox) {
    let name = checkbox.name;
    let conteudo = document.getElementById('interp-modal-body');

    // Se marcou "normal", desmarcar as alterações do mesmo grupo
    let grupoNormais = {
      'umb_normal': ['umb_ip_elevado', 'umb_diast_reduzido', 'umb_diast_ausente', 'umb_diast_reverso'],
      'acm_normal': ['acm_ip_reduzido', 'acm_centralizacao', 'acm_vasodilatacao'],
      'rcp_normal': ['rcp_reduzida', 'rcp_redistribuicao'],
      'ut_normais': ['ut_ip_elevado', 'ut_incisura_unilateral', 'ut_incisura_bilateral'],
      'dv_normal': ['dv_ip_elevado', 'dv_onda_a_ausente', 'dv_onda_a_reversa']
    };

    if (grupoNormais[name] && checkbox.checked) {
      grupoNormais[name].forEach(n => {
        let el = conteudo.querySelector(`input[name="${n}"]`);
        if (el) el.checked = false;
      });
    }

    // Se marcou uma alteração, desmarcar o "normal" do mesmo grupo
    let grupoAlteracoes = {};
    Object.keys(grupoNormais).forEach(normalName => {
      grupoNormais[normalName].forEach(altName => {
        grupoAlteracoes[altName] = normalName;
      });
    });

    if (grupoAlteracoes[name] && checkbox.checked) {
      let normalEl = conteudo.querySelector(`input[name="${grupoAlteracoes[name]}"]`);
      if (normalEl) normalEl.checked = false;
    }
  }

  function atualizarPreviewConclusao() {
    let selecoes = lerSelecoesModal();
    let texto = gerarConclusaoDoppler(selecoes);
    let previewEl = document.getElementById('interp-preview-text');
    if (previewEl) previewEl.textContent = texto;
  }

  function lerSelecoesModal() {
    let conteudo = document.getElementById('interp-modal-body');
    if (!conteudo) return {};

    let selecoes = {};
    conteudo.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      selecoes[cb.name] = cb.checked;
    });
    return selecoes;
  }

  function fecharModal() {
    modalAberto = false;
    let overlay = document.getElementById('interp-modal-overlay');
    let panel = document.getElementById('interp-modal-panel');

    if (panel) {
      panel.style.transform = 'translateY(20px) scale(0.95)';
      panel.style.opacity = '0';
    }
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }
  }

  function aplicarInterpretacao() {
    let selecoes = lerSelecoesModal();
    let texto = gerarConclusaoDoppler(selecoes);

    interpretacaoAplicada = texto;

    fecharModal();

    // Forçamos o app.js a regenerar o laudo original (que tem a frase "normal").
    // O MutationObserver detectará a regeneração e fará a injeção de forma confiável.
    if (typeof window.updatePreview === 'function') {
      window.updatePreview();
    } else {
      injetarNaPreview(); // fallback de segurança
    }
  }

  function limparInterpretacao() {
    interpretacaoAplicada = null;
    let conteudo = document.getElementById('interp-modal-body');
    if (conteudo) conteudo.innerHTML = '';
    fecharModal();
    
    if (typeof window.updatePreview === 'function') {
      window.updatePreview();
    }
  }

  // ============================================================
  // INJEÇÃO NO LAUDO VIA MUTATIONOBSERVER
  // ============================================================

  const FRASE_PADRAO_DOPPLER = '- Estudo dopplervelocimétrico dentro da normalidade para idade gestacional.';

  function injetarNaPreview() {
    if (!interpretacaoAplicada) return;

    let editor = document.getElementById('report-editor');
    if (!editor) return;

    let html = editor.innerHTML;

    // Localizar a frase padrão do Doppler e substituir
    let fraseTarget = 'Estudo dopplervelocimétrico dentro da normalidade para idade gestacional.';

    if (html.includes(fraseTarget)) {
      let novaFrase = interpretacaoAplicada;
      html = html.replace(
        '- ' + fraseTarget,
        '- ' + novaFrase
      );
      // Desabilitar observer temporariamente para evitar loop
      pausarObserver = true;
      editor.innerHTML = html;
      setTimeout(() => { pausarObserver = false; }, 100);
    }
  }

  // ============================================================
  // OBSERVER — Detectar quando updatePreview() regenera o laudo
  // ============================================================

  let pausarObserver = false;

  function iniciarObserver() {
    let editor = document.getElementById('report-editor');
    if (!editor) return;

    let observer = new MutationObserver(function () {
      if (pausarObserver) return;
      // Após o laudo ser regenerado, injetar interpretação se existir
      if (interpretacaoAplicada) {
        // Pequeno delay para garantir que o DOM estabilizou
        setTimeout(injetarNaPreview, 50);
      }
    });

    observer.observe(editor, { childList: true, subtree: true, characterData: true });
  }

  // ============================================================
  // LISTENER — Detectar mudanças nos campos Doppler
  // ============================================================

  function verificarEMostrarBotao() {
    let alteracoes = detectarAlteracoes();
    criarOuAtualizarBotao(alteracoes.temAlteracao);

    if (alteracoes.temAlteracao) {
      let novoAlerta = false;
      if (alteracoes.umbilical && !alertasMostrados.umbilical) { novoAlerta = true; alertasMostrados.umbilical = true; }
      if (alteracoes.acm && !alertasMostrados.acm) { novoAlerta = true; alertasMostrados.acm = true; }
      if (alteracoes.rcp && !alertasMostrados.rcp) { novoAlerta = true; alertasMostrados.rcp = true; }
      if (alteracoes.uterinas && !alertasMostrados.uterinas) { novoAlerta = true; alertasMostrados.uterinas = true; }
      if (alteracoes.ducto && !alertasMostrados.ducto) { novoAlerta = true; alertasMostrados.ducto = true; }

      if (novoAlerta) {
        mostrarAlertaAlteracao();
      }
    } else {
      alertasMostrados = { umbilical: false, acm: false, rcp: false, uterinas: false, ducto: false };
      if (interpretacaoAplicada) {
        interpretacaoAplicada = null;
      }
      let conteudo = document.getElementById('interp-modal-body');
      if (conteudo) conteudo.innerHTML = '';
    }
  }

  function mostrarAlertaAlteracao() {
    // Se o modal principal já estiver aberto, não mostra o alerta
    if (modalAberto) return;

    let alertOverlay = document.getElementById('interp-alert-overlay');
    if (!alertOverlay) {
      alertOverlay = document.createElement('div');
      alertOverlay.id = 'interp-alert-overlay';
      Object.assign(alertOverlay.style, {
        display: 'none',
        position: 'fixed',
        top: '0', left: '0', width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: '9998',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: '0',
        transition: 'opacity 0.3s ease'
      });

      let alertBox = document.createElement('div');
      Object.assign(alertBox.style, {
        background: 'var(--card-bg)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--primary)',
        borderRadius: '12px',
        boxShadow: '0 0 20px var(--primary-glow), 0 10px 40px rgba(0,0,0,0.5)',
        width: '90%',
        maxWidth: '400px',
        padding: '24px',
        textAlign: 'center',
        transform: 'translateY(20px) scale(0.95)',
        opacity: '0',
        transition: 'all 0.3s ease'
      });
      
      let icon = document.createElement('div');
      icon.innerHTML = '⚠️';
      Object.assign(icon.style, {
        fontSize: '2.5rem', marginBottom: '15px'
      });

      let title = document.createElement('div');
      title.textContent = 'ALTERAÇÃO DETECTADA';
      Object.assign(title.style, {
        fontFamily: "'Orbitron', sans-serif", fontSize: '1.1rem',
        color: 'var(--primary)', fontWeight: '700', marginBottom: '10px'
      });

      let msg = document.createElement('div');
      msg.textContent = 'Foi detectada uma alteração nos índices de Doppler. Deseja abrir o assistente de interpretação clínica?';
      Object.assign(msg.style, {
        fontFamily: "'Inter', sans-serif", fontSize: '0.95rem',
        color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.4'
      });

      let btnContainer = document.createElement('div');
      Object.assign(btnContainer.style, {
        display: 'flex', gap: '10px', justifyContent: 'center'
      });

      let btnFechar = document.createElement('button');
      btnFechar.textContent = 'Fechar';
      Object.assign(btnFechar.style, {
        padding: '10px 16px', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem',
        fontWeight: '600', color: 'var(--text-muted)', background: 'transparent',
        border: '1px solid var(--card-border)', borderRadius: '8px', cursor: 'pointer', transition: '0.3s'
      });
      btnFechar.onclick = () => {
        alertBox.style.transform = 'translateY(20px) scale(0.95)';
        alertBox.style.opacity = '0';
        alertOverlay.style.opacity = '0';
        setTimeout(() => { alertOverlay.style.display = 'none'; }, 300);
      };

      let btnAbrir = document.createElement('button');
      btnAbrir.textContent = 'Abrir Assistente';
      Object.assign(btnAbrir.style, {
        padding: '10px 16px', fontFamily: "'Orbitron', sans-serif", fontSize: '0.85rem',
        fontWeight: '700', color: '#000', background: 'linear-gradient(135deg, #00f2ff, #00ff88)',
        border: 'none', borderRadius: '8px', cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 242, 255, 0.3)', transition: '0.3s'
      });
      btnAbrir.onclick = () => {
        btnFechar.click();
        abrirModal();
      };

      btnContainer.appendChild(btnFechar);
      btnContainer.appendChild(btnAbrir);

      alertBox.appendChild(icon);
      alertBox.appendChild(title);
      alertBox.appendChild(msg);
      alertBox.appendChild(btnContainer);
      alertOverlay.appendChild(alertBox);
      document.body.appendChild(alertOverlay);
    }

    let alertBox = alertOverlay.firstChild;
    alertOverlay.style.display = 'flex';
    requestAnimationFrame(() => {
      alertOverlay.style.opacity = '1';
      alertBox.style.transform = 'translateY(0) scale(1)';
      alertBox.style.opacity = '1';
    });
  }

  let debounceTimer = null;

  function iniciarListeners() {
    // Escutar mudanças nos campos Doppler (percentis são readonly, mudam via JS)
    let camposDoppler = ['ip_u', 'ip_c', 'ip_utd', 'ip_ute', 'ip_dv'];
    camposDoppler.forEach(id => {
      let el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function() {
          clearTimeout(debounceTimer);
          
          let valor = this.value.trim();
          let ehDecimalCompleto = /^\d+[.,]\d+$/.test(valor);
          
          // Se não for vazio e não for um decimal completo, não inicia o timer
          if (valor !== '' && !ehDecimalCompleto) {
            return;
          }

          debounceTimer = setTimeout(verificarEMostrarBotao, 800);
        });
      }
    });

    // Escutar mudanças no select de onda A do ducto venoso
    let ondaA = document.getElementById('onda_a_dv');
    if (ondaA) {
      ondaA.addEventListener('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(verificarEMostrarBotao, 800);
      });
    }

    // Escutar toggles de uterinas e ducto
    let exibirUterinas = document.getElementById('exibir_uterinas');
    if (exibirUterinas) {
      exibirUterinas.addEventListener('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(verificarEMostrarBotao, 800);
      });
    }
    let exibirDucto = document.getElementById('exibir_ducto');
    if (exibirDucto) {
      exibirDucto.addEventListener('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(verificarEMostrarBotao, 800);
      });
    }

    // Escutar mudanças de IG (recalcula percentis)
    let igSem = document.getElementById('ig_sem');
    let igDias = document.getElementById('ig_dias');
    if (igSem) igSem.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(verificarEMostrarBotao, 800);
    });
    if (igDias) igDias.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(verificarEMostrarBotao, 800);
    });
  }

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  function init() {
    criarModalHTML();
    iniciarListeners();
    iniciarObserver();
  }

  function criarModalHTML() {
    // Criar o overlay e o modal diretamente via JS para não depender de HTML pré-existente
    let overlay = document.createElement('div');
    overlay.id = 'interp-modal-overlay';
    Object.assign(overlay.style, {
      display: 'none',
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      zIndex: '9999',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });

    // Fechar ao clicar no overlay (fora do modal)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) fecharModal();
    });

    let panel = document.createElement('div');
    panel.id = 'interp-modal-panel';
    Object.assign(panel.style, {
      background: 'var(--card-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--primary)',
      borderRadius: '16px',
      boxShadow: '0 0 30px var(--primary-glow), 0 20px 60px rgba(0,0,0,0.5)',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transform: 'translateY(20px) scale(0.95)',
      opacity: '0',
      transition: 'all 0.3s ease'
    });

    // Header do modal
    let header = document.createElement('div');
    Object.assign(header.style, {
      padding: '20px 24px 16px',
      borderBottom: '1px solid var(--card-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: '0'
    });
    header.innerHTML = `
      <div>
        <div style="font-family: 'Orbitron', sans-serif; font-size: 1rem; color: var(--primary); font-weight: 700; text-shadow: 0 0 10px var(--primary-glow);">INTERPRETAÇÃO DOPPLER</div>
        <div style="font-family: 'Inter', sans-serif; font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Barcelona · FMF · ISUOG · FIGO · Febrasgo</div>
      </div>
      <button id="interp-modal-close" type="button" style="background: transparent; border: 1px solid var(--card-border); font-size: 1.3rem; cursor: pointer; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--text-main); transition: 0.3s;">✕</button>
    `;

    // Body do modal (scrollable)
    let body = document.createElement('div');
    body.id = 'interp-modal-body';
    Object.assign(body.style, {
      padding: '20px 24px',
      overflowY: 'auto',
      flex: '1'
    });

    // Footer do modal
    let footer = document.createElement('div');
    Object.assign(footer.style, {
      padding: '16px 24px 20px',
      borderTop: '1px solid var(--card-border)',
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      flexShrink: '0'
    });

    let btnLimpar = document.createElement('button');
    btnLimpar.type = 'button';
    btnLimpar.textContent = 'Limpar';
    Object.assign(btnLimpar.style, {
      padding: '10px 20px',
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.9rem',
      fontWeight: '600',
      color: 'var(--text-muted)',
      background: 'transparent',
      border: '1px solid var(--card-border)',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: '0.3s'
    });
    btnLimpar.addEventListener('click', limparInterpretacao);

    let btnAplicar = document.createElement('button');
    btnAplicar.type = 'button';
    btnAplicar.textContent = '✓  Aplicar Interpretação';
    Object.assign(btnAplicar.style, {
      padding: '10px 24px',
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '0.8rem',
      fontWeight: '700',
      color: '#000',
      background: 'linear-gradient(135deg, #00f2ff, #00ff88)',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0, 242, 255, 0.3)',
      letterSpacing: '0.5px'
    });
    btnAplicar.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 6px 20px rgba(0, 242, 255, 0.5)';
    });
    btnAplicar.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 15px rgba(0, 242, 255, 0.3)';
    });
    btnAplicar.addEventListener('click', aplicarInterpretacao);

    footer.appendChild(btnLimpar);
    footer.appendChild(btnAplicar);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);
    overlay.appendChild(panel);

    document.body.appendChild(overlay);

    // Listener para o botão de fechar
    document.getElementById('interp-modal-close').addEventListener('click', fecharModal);

    // Fechar com ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalAberto) {
        fecharModal();
      }
    });
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
