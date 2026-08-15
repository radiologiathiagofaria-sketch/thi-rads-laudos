// app.js - UI Logic and Interaction

let modoAtual = 'home';

// THEME TOGGLE
const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

// UI Navigation
function abrirForm(tipo) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  
  if (tipo === 'inicial') {
    modoAtual = 'inicial';
    document.getElementById('view-form-inicial').classList.add('active');
  } else {
    modoAtual = tipo;
    document.getElementById('view-form-doppler').classList.add('active');
    document.getElementById('card-doppler').style.display = (tipo === 'doppler') ? 'block' : 'none';
  }
  updatePreview();
}

function voltar() {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-home').classList.add('active');
  modoAtual = 'home';
  document.getElementById('report-editor').innerHTML = `<div style="color: #94a3b8; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 10pt;">Selecione um exame na coluna ao lado para gerar o laudo padrão...</div>`;
}

function maskData(i) {
  let v = i.value.replace(/\D/g, '');
  if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2);
  if (v.length > 5) v = v.substring(0,5) + '/' + v.substring(5,9);
  i.value = v;
}

// ------------------------------------
// DOPPLER & SEM-DOPPLER LOGIC
// ------------------------------------

function atualizarFraseILA() {
  const ilaVal = document.getElementById('ila').value;
  const mbVal = document.getElementById('maior_bolsao').value;
  let ila = parseFloat(ilaVal.replace(',', '.'));
  let mb = parseFloat(mbVal.replace(',', '.'));
  
  let frase = "de volume normal";
  
  if (ilaVal && !isNaN(ila)) {
    if (ila > 18) frase = "de volume aumentado";
    else if (ila < 8) frase = "de volume reduzido";
  } else if (mbVal && !isNaN(mb)) {
    if (mb > 8) frase = "de volume aumentado";
    else if (mb < 2) frase = "de volume reduzido";
  }

  document.getElementById('frase_ila').value = frase;
  updatePreview();
}

function calcularPesoEPerc() {
  let sem = parseFloat(document.getElementById('ig_sem').value) || 0;
  let dias = parseFloat(document.getElementById('ig_dias').value) || 0;
  let MA = sem + (dias / 7);

  let dbp = (parseFloat(document.getElementById('dbp').value) || 0) / 10;
  let cc  = (parseFloat(document.getElementById('cc').value)  || 0) / 10;
  let ca  = (parseFloat(document.getElementById('ca').value)  || 0) / 10;
  let cf  = (parseFloat(document.getElementById('cf').value)  || 0) / 10;

  if (ca > 0 && cf > 0 && dbp > 0) {
    let log10Peso = 1.3596 + (0.00061 * dbp * ca) + (0.0424 * ca) + (0.174 * cf) + (0.0064 * cc) - (0.00386 * ca * cf);
    let pesoG = Math.pow(10, log10Peso);
    let pesoFinal = Math.round(pesoG);

    document.getElementById('peso').value = pesoFinal;
    document.getElementById('peso_display').innerText = pesoFinal + " g";

    let lnMediaG = 0.578 + (0.332 * MA) - (0.00354 * MA * MA);
    let z = (Math.log(pesoG) - lnMediaG) / 0.13;
    let perc = window.calculos.zToPercentileReal(z);

    let formatado = (perc < 3) ? "< p3" : (perc > 97) ? "> p97" : "p" + perc;
    document.getElementById('p_peso').value = formatado;
    document.getElementById('p_peso_raw').value = perc;
    document.getElementById('p_display').innerText = formatado;
  }
  updatePreview();
}

function calcularDopplerAutomatico() {
  let sem  = parseInt(document.getElementById('ig_sem').value) || 0;
  let dias = parseInt(document.getElementById('ig_dias').value) || 0;

  let ipU = parseFloat(document.getElementById('ip_u').value.replace(',', '.')) || 0;
  let ipC = parseFloat(document.getElementById('ip_c').value.replace(',', '.')) || 0;
  
  let utd = parseFloat(document.getElementById('ip_utd').value.replace(',', '.')) || 0;
  let ute = parseFloat(document.getElementById('ip_ute').value.replace(',', '.')) || 0;
  let utm = 0;
  
  if (utd > 0 && ute > 0) {
    utm = (utd + ute) / 2;
    document.getElementById('ip_ut_medio').value = utm.toFixed(2);
  } else if (utd > 0) {
    utm = utd;
    document.getElementById('ip_ut_medio').value = utd.toFixed(2);
  } else if (ute > 0) {
    utm = ute;
    document.getElementById('ip_ut_medio').value = ute.toFixed(2);
  } else {
    document.getElementById('ip_ut_medio').value = '';
  }

  if (sem > 0) {
    if (utd > 0) {
      document.getElementById('p_utd').value = window.calculos.getPercentilUtA(sem, dias, utd);
    } else {
      document.getElementById('p_utd').value = '';
    }
    
    if (ute > 0) {
      document.getElementById('p_ute').value = window.calculos.getPercentilUtA(sem, dias, ute);
    } else {
      document.getElementById('p_ute').value = '';
    }
    
    if (utm > 0) {
      document.getElementById('p_ut_medio').value = window.calculos.getPercentilUtA(sem, dias, utm);
      document.getElementById('p_ut_medio_raw').value = window.calculos.getPercentilUtARaw(sem, dias, utm);
    } else {
      document.getElementById('p_ut_medio').value = '';
      if(document.getElementById('p_ut_medio_raw')) document.getElementById('p_ut_medio_raw').value = '';
    }
    
    let ipDv = parseFloat(document.getElementById('ip_dv').value.replace(',', '.')) || 0;
    if (ipDv > 0) {
      document.getElementById('p_dv').value = window.calculos.getPercentilDV(sem, dias, ipDv);
      document.getElementById('p_dv_raw').value = window.calculos.getPercentilDVRaw(sem, dias, ipDv);
    } else {
      document.getElementById('p_dv').value = '';
      if(document.getElementById('p_dv_raw')) document.getElementById('p_dv_raw').value = '';
    }
  }

  if (sem > 0) {
    if (ipU > 0) {
      let pUmb = window.calculos.getPercentilUmb(sem, dias, ipU);
      document.getElementById('p_umb').value = "p" + pUmb;
      document.getElementById('p_umb_raw').value = window.calculos.getPercentilUmbRaw(sem, dias, ipU);
    } else {
      document.getElementById('p_umb').value = "";
      if(document.getElementById('p_umb_raw')) document.getElementById('p_umb_raw').value = "";
    }

    if (ipC > 0) {
      let pAcm = window.calculos.getPercentilACM(sem, dias, ipC);
      document.getElementById('p_cer').value = "p" + pAcm;
      document.getElementById('p_cer_raw').value = window.calculos.getPercentilACMRaw(sem, dias, ipC);
    } else {
      document.getElementById('p_cer').value = "";
      if(document.getElementById('p_cer_raw')) document.getElementById('p_cer_raw').value = "";
    }

    if (ipU > 0 && ipC > 0) {
      let rcp = (ipC / ipU).toFixed(2);
      document.getElementById('relacao').value = rcp;

      let pRcp = window.calculos.getPercentilRCP(sem, dias, ipC, ipU);
      document.getElementById('p_rcp').value = "p" + pRcp;
      document.getElementById('p_rcp_raw').value = window.calculos.getPercentilRCPRaw(sem, dias, ipC, ipU);
    } else {
      document.getElementById('relacao').value = "";
      document.getElementById('p_rcp').value = "";
      if(document.getElementById('p_rcp_raw')) document.getElementById('p_rcp_raw').value = "";
    }
  } else {
    document.getElementById('p_umb').value = "";
    document.getElementById('p_cer').value = "";
    document.getElementById('relacao').value = "";
    document.getElementById('p_rcp').value = "";
    if(document.getElementById('p_umb_raw')) document.getElementById('p_umb_raw').value = "";
    if(document.getElementById('p_cer_raw')) document.getElementById('p_cer_raw').value = "";
    if(document.getElementById('p_rcp_raw')) document.getElementById('p_rcp_raw').value = "";
    if(document.getElementById('p_ut_medio_raw')) document.getElementById('p_ut_medio_raw').value = "";
    if(document.getElementById('p_dv_raw')) document.getElementById('p_dv_raw').value = "";
  }
  updatePreview();
}

const p = (id) => {
  let el = document.getElementById(id);
  return el ? el.value : '';
}

function getFormDadosDoppler() {
  let dados = {
    modo: modoAtual,
    dum_disp: p('dum_disp_doppler'),
    origem_ig: p('origem_ig'),
    dum: p('dum'),
    exame_previo_data: p('exame_previo_data'),
    exame_previo_sem: p('exame_previo_sem'),
    exame_previo_dias: p('exame_previo_dias'),
    ig_sem: p('ig_sem'),
    ig_dias: p('ig_dias'),
    
    exibir_percentis: document.getElementById('exibir_percentis') ? document.getElementById('exibir_percentis').checked : true,
    exibir_indices: document.getElementById('exibir_indices') ? document.getElementById('exibir_indices').checked : false,
    exibir_umero: document.getElementById('exibir_umero') ? document.getElementById('exibir_umero').checked : false,
    exibir_uterinas: document.getElementById('exibir_uterinas') ? document.getElementById('exibir_uterinas').checked : false,
    exibir_ducto: document.getElementById('exibir_ducto') ? document.getElementById('exibir_ducto').checked : false,
    
    situacao: p('situacao'),
    apresentacao: p('apresentacao'),
    dorso: p('dorso'),
    bcf: p('bcf'),
    
    dbp: p('dbp'),
    cc: p('cc'),
    ca: p('ca'),
    cf: p('cf'),
    umero: p('umero'),
    peso: p('peso'),
    p_peso: p('p_peso'),
    p_peso_raw: p('p_peso_raw'),
    
    ip_u: p('ip_u'),
    p_umb: p('p_umb'),
    ip_c: p('ip_c'),
    p_cer: p('p_cer'),
    relacao: p('relacao'),
    p_rcp: p('p_rcp'),
    
    ip_utd: p('ip_utd'), p_utd: p('p_utd'),
    ip_ute: p('ip_ute'), p_ute: p('p_ute'),
    ip_ut_medio: p('ip_ut_medio'), p_ut_medio: p('p_ut_medio'),
    ip_dv: p('ip_dv'), p_dv: p('p_dv'), onda_a_dv: p('onda_a_dv'),
    
    ila: p('ila'),
    frase_ila: p('frase_ila'),
    maior_bolsao: p('maior_bolsao'),
    placenta: p('placenta_local'),
    placenta_grau: p('placenta_grau'),
    espessura_placenta: p('espessura_placenta')
  };

  // Cálculo robusto da IG e DPP apenas para ter dados extras, a UI já atualiza os inputs na tela
  let sem = parseInt(dados.ig_sem) || 0;
  let dias = parseInt(dados.ig_dias) || 0;
  let dpp_texto = "";
  
  if (dados.origem_ig === 'DUM' && dados.dum && dados.dum.length === 10) {
    let partes = dados.dum.split('/');
    if (partes.length === 3) {
      let dppDate = new Date(partes[2], partes[1] - 1, partes[0]);
      dppDate.setDate(dppDate.getDate() + 280);
      dpp_texto = dppDate.toLocaleDateString('pt-BR');
    }
  } else if (sem > 0) {
    let totalDiasIG = (sem * 7) + dias;
    let diasRestantes = 280 - totalDiasIG;
    let hoje = new Date();
    hoje.setDate(hoje.getDate() + diasRestantes);
    dpp_texto = hoje.toLocaleDateString('pt-BR');
  }
  
  dados.ig_calc_sem = sem;
  dados.ig_calc_dias = dias;
  dados.dpp_texto = dpp_texto;
  
  // Cálculo da Média da Idade Biométrica
  let idades = [];
  if (dados.dbp && parseFloat(dados.dbp) > 0) {
    let dbp = parseFloat(dados.dbp) / 10;
    idades.push(9.54 + 1.482*dbp + 0.1676*(dbp*dbp));
  }
  if (dados.cc && parseFloat(dados.cc) > 0) {
    let cc = parseFloat(dados.cc) / 10;
    idades.push(8.96 + 0.54*cc + 0.0003*(cc*cc*cc));
  }
  if (dados.ca && parseFloat(dados.ca) > 0) {
    let ca = parseFloat(dados.ca) / 10;
    idades.push(8.14 + 0.753*ca + 0.0036*(ca*ca));
  }
  if (dados.cf && parseFloat(dados.cf) > 0) {
    let cf = parseFloat(dados.cf) / 10;
    idades.push(10.35 + 2.46*cf + 0.17*(cf*cf));
  }
  
  if (idades.length > 0) {
    let avg = idades.reduce((a, b) => a + b, 0) / idades.length;
    dados.biometria_sem = Math.floor(avg);
    dados.biometria_dias = Math.round((avg - dados.biometria_sem) * 7);
    if (dados.biometria_dias === 7) {
      dados.biometria_sem++;
      dados.biometria_dias = 0;
    }
  } else {
    dados.biometria_sem = sem;
    dados.biometria_dias = dias;
  }
  
  return dados;
}

// ------------------------------------
// INICIAL LOGIC
// ------------------------------------

function calcInic() {
  let a = parseFloat(document.getElementById('sg_a').value) || 0;
  let b = parseFloat(document.getElementById('sg_b').value) || 0;
  let c = parseFloat(document.getElementById('sg_c').value) || 0;
  let n = (a > 0 ? 1 : 0) + (b > 0 ? 1 : 0) + (c > 0 ? 1 : 0);
  let m = n > 0 ? (a + b + c) / n : 0;
  document.getElementById('display_medio_inic').innerText = "MÉDIO: " + m.toFixed(1) + " mm";
  updatePreview();
}

function getFormDadosInicial() {
  let dados = {
    posicao_utero: document.getElementById('posicao_utero').value,
    dum_disp: document.getElementById('dum_disp_inic').value,
    dum_data: document.getElementById('dum_data_inic').value,
    sg_a: document.getElementById('sg_a').value,
    sg_b: document.getElementById('sg_b').value,
    sg_c: document.getElementById('sg_c').value,
    sg_medio: document.getElementById('display_medio_inic').innerText.replace("MÉDIO: ","").replace(" mm",""),
    exame_ant_disp: document.getElementById('exame_ant_disp').value,
    exame_ant_data: document.getElementById('exame_ant_data').value,
    exame_ant_sem: document.getElementById('exame_ant_sem').value,
    exame_ant_dias: document.getElementById('exame_ant_dias').value,
    tem_hematoma: document.getElementById('tem_hematoma').value,
    hematoma_parede: document.getElementById('hematoma_parede').value,
    hem_a: document.getElementById('hem_a').value,
    hem_b: document.getElementById('hem_b').value,
    hem_c: document.getElementById('hem_c').value,
    tem_vv: document.getElementById('tem_vv').value,
    vv_mm: document.getElementById('vv_mm_inic').value,
    tem_emb: document.getElementById('tem_emb_inic').value,
    ccn: document.getElementById('ccn_inic').value,
    bcf: document.getElementById('bcf_inic').value,
    sel_ovarios: document.getElementById('sel_ovarios_inic').value,
    restos_ovulares: document.getElementById('restos_ovulares').value,
    espessura_restos_mm: document.getElementById('espessura_restos_mm').value
  };

  if (dados.dum_disp === 'sim' && dados.dum_data.length === 10) {
    let partes = dados.dum_data.split('/');
    if (partes.length === 3) {
      let dumDate = new Date(partes[2], partes[1] - 1, partes[0]);
      let hoje = new Date();
      let diffMs = hoje - dumDate;
      if (diffMs >= 0) {
        let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        dados.ig_dum_sem = Math.floor(diffDias / 7);
        dados.ig_dum_dias = diffDias % 7;
        
        let dppDate = new Date(dumDate);
        dppDate.setDate(dppDate.getDate() + 280);
        dados.dpp_texto = dppDate.toLocaleDateString('pt-BR');
      }
    }
  }

  if (dados.tem_emb === "sim") {
    let ccn = parseFloat(dados.ccn) || 0;
    let totalDias = Math.round(8.052 * Math.sqrt(ccn * 1.037) + 23.73);
    dados.idade_calc_total_dias = totalDias;
    dados.idade_calc_sem = Math.floor(totalDias / 7); 
    dados.idade_calc_dias = totalDias % 7;
  }

  if (dados.exame_ant_disp === 'sim' && dados.exame_ant_data.length === 10) {
    let partes = dados.exame_ant_data.split('/');
    if (partes.length === 3) {
      let exameDate = new Date(partes[2], partes[1] - 1, partes[0]);
      let hoje = new Date();
      let diffMs = hoje - exameDate;
      let semAnt = parseInt(dados.exame_ant_sem) || 0;
      let diasAnt = parseInt(dados.exame_ant_dias) || 0;
      
      if (diffMs >= 0) {
        let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let totalDias = (semAnt * 7) + diasAnt + diffDias;
        
        dados.ig_corrigida_sem = Math.floor(totalDias / 7);
        dados.ig_corrigida_dias = totalDias % 7;
      }
    }
  }
  
  return dados;
}

// ------------------------------------
// PREVIEW UPDATE
// ------------------------------------

function updatePreview() {
  let textoHtml = "";
  if (modoAtual === 'inicial') {
    let dados = getFormDadosInicial();
    if (dados.restos_ovulares === 'sim') {
      textoHtml = window.templates.gerarTextoRestosOvulares(dados);
    } else {
      textoHtml = window.templates.gerarTextoInicial(dados);
    }
  } else if (modoAtual === 'doppler' || modoAtual === 'sem-doppler') {
    let dados = getFormDadosDoppler();
    textoHtml = window.templates.gerarTextoDoppler(dados);
  }
  
  if (textoHtml) {
    document.getElementById('report-editor').innerHTML = textoHtml;
  }
}

// ------------------------------------
// RICH TEXT COPY TO CLIPBOARD
// ------------------------------------

function copyRichText() {
  const editor = document.getElementById('report-editor');
  _copyLaudoRichText(editor, function(ok) {
    if (ok) {
      showToast('Laudo copiado (com formatação) para a área de transferência!');
    } else {
      alert('Falha ao copiar. Pressione CTRL+C após o texto ser selecionado.');
    }
  });
}

/**
 * Central rich-text copy helper.
 *
 * STRATEGY: Clone the original laudo element, then walk the original and clone
 * DOM trees in parallel. For each element, read getComputedStyle() from the
 * ORIGINAL (which has access to the page's CSS) and apply relevant document-
 * formatting properties as inline styles on the CLONE. This makes the copied
 * HTML completely self-contained and independent of the page's stylesheets.
 *
 * Dark-mode colours (dark backgrounds, light text) are replaced with
 * document-standard values (white background, black text). All other
 * formatting (bold, italic, alignment, margins, spacing, tables, etc.)
 * is faithfully preserved.
 *
 * The live DOM (#report-editor) is NEVER modified.
 *
 * @param {HTMLElement} sourceEl  – the element whose content is the laudo
 * @param {function}    callback  – called with (true) on success, (false) on failure
 */
function _copyLaudoRichText(sourceEl, callback) {
  // ── 1. Clone the laudo so we never touch the live DOM ──
  var clone = sourceEl.cloneNode(true);

  // ── 2. Document-relevant CSS properties to inline ──
  var RELEVANT_PROPS = [
    'font-family', 'font-size', 'font-weight', 'font-style',
    'line-height', 'text-align', 'text-indent', 'text-decoration',
    'vertical-align', 'white-space', 'display',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'list-style', 'list-style-type',
    'border-collapse', 'border-spacing'
  ];

  // ── 3. Walk original + clone trees in parallel, inlining computed styles ──
  var originalEls = sourceEl.querySelectorAll('*');
  var cloneEls    = clone.querySelectorAll('*');

  // Also process the root element itself
  _inlineComputedStyles(sourceEl, clone, RELEVANT_PROPS, true);

  for (var i = 0; i < originalEls.length; i++) {
    _inlineComputedStyles(originalEls[i], cloneEls[i], RELEVANT_PROPS, false);
  }

  // ── 4. Force document colours on the root clone ──
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';

  // Remove the id/contenteditable from the clone (not needed in clipboard)
  clone.removeAttribute('id');
  clone.removeAttribute('contenteditable');

  // ── 5. Build the final HTML string ──
  var htmlContent = clone.outerHTML;

  // ── 6. Plain-text fallback (preserves line breaks) ──
  var plainText = sourceEl.innerText || sourceEl.textContent || '';

  // ── 7. Write to clipboard ──
  if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      var htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      var textBlob = new Blob([plainText],   { type: 'text/plain' });
      navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob
        })
      ]).then(function() {
        callback(true);
      }).catch(function() {
        _fallbackCopy(htmlContent, plainText, callback);
      });
      return;
    } catch (e) {
      // ClipboardItem constructor failed – fall through to fallback
    }
  }

  _fallbackCopy(htmlContent, plainText, callback);
}

/**
 * Reads getComputedStyle() from `originalEl` and applies relevant document-
 * formatting properties as inline styles on `cloneEl`.
 *
 * Colour handling:
 *   - background-color: forced to transparent (or white for root)
 *   - color: forced to #000000 unless the computed colour is already dark
 *   - border colours on table cells: preserved as-is (they are document formatting)
 *
 * @param {HTMLElement} originalEl  – element in the live DOM (has computed styles)
 * @param {HTMLElement} cloneEl     – corresponding element in the clone
 * @param {string[]}   props       – list of CSS property names to inline
 * @param {boolean}    isRoot      – true if this is the root container element
 */
function _inlineComputedStyles(originalEl, cloneEl, props, isRoot) {
  if (!originalEl || !cloneEl) return;
  if (originalEl.nodeType !== 1 || cloneEl.nodeType !== 1) return;

  var computed = window.getComputedStyle(originalEl);

  // Apply each relevant document-formatting property
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var val  = computed.getPropertyValue(prop);
    if (val) {
      cloneEl.style.setProperty(prop, val);
    }
  }

  // ── Handle colours specially ──

  // Background: strip any dark background, keep white/transparent
  var bgColor = computed.getPropertyValue('background-color');
  if (bgColor) {
    var bgRgb = _parseRGB(bgColor);
    if (!bgRgb || _isTransparent(bgColor)) {
      // transparent or unparseable – leave as transparent
      cloneEl.style.backgroundColor = 'transparent';
    } else if (bgRgb.r > 200 && bgRgb.g > 200 && bgRgb.b > 200) {
      // Light/white background – keep it
      cloneEl.style.backgroundColor = '#ffffff';
    } else {
      // Dark background (likely from dark mode) – force white/transparent
      cloneEl.style.backgroundColor = isRoot ? '#ffffff' : 'transparent';
    }
  }

  // Text colour: force dark
  var textColor = computed.getPropertyValue('color');
  if (textColor) {
    var textRgb = _parseRGB(textColor);
    if (!textRgb || textRgb.r > 100 || textRgb.g > 100 || textRgb.b > 100) {
      // Light text or unparseable – force black
      cloneEl.style.color = '#000000';
    } else {
      // Already dark text – keep it
      cloneEl.style.color = textColor;
    }
  }

  // Preserve border styles for table elements (td, th, table)
  var tag = originalEl.tagName.toLowerCase();
  if (tag === 'td' || tag === 'th' || tag === 'table') {
    var borderProps = ['border-top', 'border-right', 'border-bottom', 'border-left', 'border'];
    for (var j = 0; j < borderProps.length; j++) {
      var bv = computed.getPropertyValue(borderProps[j]);
      if (bv) {
        cloneEl.style.setProperty(borderProps[j], bv);
      }
    }
  }

  // Remove class attribute from clone – styles are now inline
  cloneEl.removeAttribute('class');
}

/**
 * Fallback copy using offscreen container + execCommand('copy').
 */
function _fallbackCopy(htmlContent, plainText, callback) {
  var container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.opacity = '0';
  document.body.appendChild(container);

  var range = document.createRange();
  range.selectNodeContents(container);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  var ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {
    ok = false;
  }

  sel.removeAllRanges();
  document.body.removeChild(container);
  callback(ok);
}

/** Returns true when the colour string represents a transparent/rgba(0,0,0,0) value */
function _isTransparent(colorStr) {
  if (!colorStr) return true;
  if (colorStr === 'transparent') return true;
  var m = colorStr.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  if (m && parseFloat(m[4]) === 0) return true;
  return false;
}

/** Returns true when the parsed colour is light (i.e. white-ish / suitable for document bg) */
function _isLightColor(colorStr) {
  var rgb = _parseRGB(colorStr);
  if (!rgb) return false;
  return (rgb.r > 200 && rgb.g > 200 && rgb.b > 200);
}

/** Returns true when the parsed colour is dark (i.e. black-ish / suitable for document text) */
function _isDarkColor(colorStr) {
  var rgb = _parseRGB(colorStr);
  if (!rgb) return false;
  return (rgb.r < 80 && rgb.g < 80 && rgb.b < 80);
}

function _parseRGB(colorStr) {
  if (!colorStr) return null;
  var m = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
  // Hex
  if (colorStr.charAt(0) === '#') {
    var hex = colorStr.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if (hex.length === 6) {
      return { r: parseInt(hex.substr(0,2),16), g: parseInt(hex.substr(2,2),16), b: parseInt(hex.substr(4,2),16) };
    }
  }
  return null;
}

/**
 * Inlines computed styles on an element that is already in the DOM.
 * Used by the copy-event interceptor on #report-editor.
 * Reads getComputedStyle() directly from `el` (which is temporarily
 * inserted in the DOM), applies relevant document-formatting props as
 * inline styles, and strips dark-mode colours.
 *
 * @param {HTMLElement} el      – element already in the DOM
 * @param {string[]}   props   – CSS property names to inline
 * @param {boolean}    isRoot  – true for the wrapper/root element
 */
function _inlineCopyStyles(el, props, isRoot) {
  if (!el || el.nodeType !== 1) return;

  var computed = window.getComputedStyle(el);

  // Inline document-formatting properties
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var val  = computed.getPropertyValue(prop);
    if (val) {
      el.style.setProperty(prop, val);
    }
  }

  // ── Colour handling (strip dark mode) ──

  // Background
  var bgColor = computed.getPropertyValue('background-color');
  if (bgColor) {
    var bgRgb = _parseRGB(bgColor);
    if (!bgRgb || _isTransparent(bgColor)) {
      el.style.backgroundColor = 'transparent';
    } else if (bgRgb.r > 200 && bgRgb.g > 200 && bgRgb.b > 200) {
      el.style.backgroundColor = '#ffffff';
    } else {
      el.style.backgroundColor = isRoot ? '#ffffff' : 'transparent';
    }
  }

  // Text colour
  var textColor = computed.getPropertyValue('color');
  if (textColor) {
    var textRgb = _parseRGB(textColor);
    if (!textRgb || textRgb.r > 100 || textRgb.g > 100 || textRgb.b > 100) {
      el.style.color = '#000000';
    } else {
      el.style.color = textColor;
    }
  }

  // Borders for table elements
  var tag = el.tagName.toLowerCase();
  if (tag === 'td' || tag === 'th' || tag === 'table') {
    var borderProps = ['border-top', 'border-right', 'border-bottom', 'border-left', 'border'];
    for (var j = 0; j < borderProps.length; j++) {
      var bv = computed.getPropertyValue(borderProps[j]);
      if (bv) {
        el.style.setProperty(borderProps[j], bv);
      }
    }
  }

  // Remove class attribute – styles are now inline
  el.removeAttribute('class');
}

function showToast(message) {
  let toast = document.getElementById('toast');
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Add event listeners on load
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const modoParam = urlParams.get('modo');
  if (modoParam) {
    abrirForm(modoParam);
  }

  // ── Intercept manual Ctrl+C inside the pre-laudo ──────────────────────
  // Strips dark-mode backgrounds/colours from the selection so that
  // Word/PACS receives clean document formatting (white bg, black text).
  // Only affects #report-editor; the rest of the page is untouched.
  var reportEditor = document.getElementById('report-editor');
  if (reportEditor) {
    reportEditor.addEventListener('copy', function(event) {
      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      // 1. Clone only the selected fragment (not the entire laudo)
      var range = selection.getRangeAt(0);
      var fragment = range.cloneContents();

      // 2. Put fragment in a temporary wrapper and insert it hidden
      //    inside the report-editor so it inherits the same CSS context
      var tempWrapper = document.createElement('div');
      tempWrapper.style.position = 'fixed';
      tempWrapper.style.left = '-99999px';
      tempWrapper.style.top = '0';
      tempWrapper.style.opacity = '0';
      tempWrapper.style.pointerEvents = 'none';
      tempWrapper.appendChild(fragment);
      reportEditor.appendChild(tempWrapper);

      // 3. Document-relevant CSS properties to inline
      var COPY_PROPS = [
        'font-family', 'font-size', 'font-weight', 'font-style',
        'line-height', 'text-align', 'text-indent', 'text-decoration',
        'vertical-align', 'white-space', 'display',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'list-style', 'list-style-type',
        'border-collapse', 'border-spacing'
      ];

      // 4. Walk all elements inside the temp wrapper and inline computed styles
      var allEls = tempWrapper.querySelectorAll('*');
      // Also process the wrapper itself (it acts as the root container)
      _inlineCopyStyles(tempWrapper, COPY_PROPS, true);
      for (var i = 0; i < allEls.length; i++) {
        _inlineCopyStyles(allEls[i], COPY_PROPS, false);
      }

      // 5. Force document colours on the wrapper
      tempWrapper.style.backgroundColor = '#ffffff';
      tempWrapper.style.color = '#000000';

      // 6. Extract HTML and plain text
      var htmlContent = tempWrapper.innerHTML;
      var plainText = tempWrapper.innerText || tempWrapper.textContent || '';

      // 7. Remove the temporary wrapper from the DOM
      reportEditor.removeChild(tempWrapper);

      // 8. Set clipboard data and prevent the native copy (which carries dark bg)
      event.clipboardData.setData('text/html', htmlContent);
      event.clipboardData.setData('text/plain', plainText);
      event.preventDefault();
    });
  }

  // Input triggers for Inicial
  document.getElementById('dum_disp_inic').addEventListener('change', function() {
    document.getElementById('div_dum_inic').style.display = (this.value === 'nao' ? 'none' : 'block');
    updatePreview();
  });
  
  document.getElementById('dum_data_inic').addEventListener('input', function() {
    maskData(this);
    if (this.value.length === 10) {
      let partes = this.value.split('/');
      let dumDate = new Date(partes[2], partes[1] - 1, partes[0]);
      let hoje = new Date();
      let diffMs = hoje - dumDate;
      if (diffMs >= 0) {
        let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let sem = Math.floor(diffDias / 7);
        let dias = diffDias % 7;
        
        let dppDate = new Date(dumDate);
        dppDate.setDate(dppDate.getDate() + 280);
        let dpp = dppDate.toLocaleDateString('pt-BR');
        
        document.getElementById('dum_calc_display').innerText = `IG: ${sem}s ${dias}d | DPP: ${dpp}`;
      } else {
        document.getElementById('dum_calc_display').innerText = "Data futura inválida.";
      }
    } else {
      document.getElementById('dum_calc_display').innerText = "Aguardando data...";
    }
    updatePreview();
  });

  function updateExameAntCalc() {
    let dataVal = document.getElementById('exame_ant_data').value;
    let semVal = document.getElementById('exame_ant_sem').value;
    let diasVal = document.getElementById('exame_ant_dias').value;

    if (dataVal.length === 10) {
      let partes = dataVal.split('/');
      let exameDate = new Date(partes[2], partes[1] - 1, partes[0]);
      let hoje = new Date();
      let diffMs = hoje - exameDate;
      let semAnt = parseInt(semVal) || 0;
      let diasAnt = parseInt(diasVal) || 0;

      if (diffMs >= 0) {
        let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let totalDias = (semAnt * 7) + diasAnt + diffDias;
        let sem = Math.floor(totalDias / 7);
        let dias = totalDias % 7;
        
        document.getElementById('exame_ant_calc_display').innerText = `IG Atual: ${sem}s ${dias}d`;
      } else {
        document.getElementById('exame_ant_calc_display').innerText = "Data futura inválida.";
      }
    } else {
      document.getElementById('exame_ant_calc_display').innerText = "Aguardando dados do exame anterior...";
    }
  }

  document.getElementById('exame_ant_disp').addEventListener('change', function() {
    document.getElementById('div_exame_ant').style.display = (this.value === 'nao' ? 'none' : 'block');
    updatePreview();
  });
  
  document.getElementById('exame_ant_data').addEventListener('input', function() {
    maskData(this);
    updateExameAntCalc();
    updatePreview();
  });
  
  document.getElementById('exame_ant_sem').addEventListener('input', function() {
    updateExameAntCalc();
    updatePreview();
  });
  
  document.getElementById('exame_ant_dias').addEventListener('input', function() {
    updateExameAntCalc();
    updatePreview();
  });

  document.getElementById('posicao_utero').addEventListener('change', updatePreview);
  
  document.getElementById('tem_hematoma').addEventListener('change', function() {
    document.getElementById('div_hematoma').style.display = (this.value === 'nao' ? 'none' : 'block');
    updatePreview();
  });
  document.getElementById('hematoma_parede').addEventListener('change', updatePreview);
  document.getElementById('hem_a').addEventListener('input', updatePreview);
  document.getElementById('hem_b').addEventListener('input', updatePreview);
  document.getElementById('hem_c').addEventListener('input', updatePreview);

  document.getElementById('tem_vv').addEventListener('change', function() {
    document.getElementById('div_vv_inic').style.display = (this.value === 'nao' ? 'none' : 'block');
    updatePreview();
  });
  document.getElementById('vv_mm_inic').addEventListener('input', updatePreview);
  document.getElementById('tem_emb_inic').addEventListener('change', function() {
    document.getElementById('div_emb_inic').style.display = (this.value === 'nao' ? 'none' : 'block');
    updatePreview();
  });
  document.getElementById('ccn_inic').addEventListener('input', updatePreview);
  document.getElementById('bcf_inic').addEventListener('input', updatePreview);
  document.getElementById('sel_ovarios_inic').addEventListener('change', updatePreview);
  
  document.getElementById('restos_ovulares').addEventListener('change', function() {
    document.getElementById('div_espessura_restos').style.display = (this.value === 'sim' ? 'block' : 'none');
    updatePreview();
  });
  document.getElementById('espessura_restos_mm').addEventListener('input', updatePreview);
  
  // Attach oninput events dynamically where not in HTML for Doppler
  document.querySelectorAll('#view-form-doppler input, #view-form-doppler select').forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  // Lógica Doppler - Origem IG e Checkboxes
  const dumDispSelect = document.getElementById('dum_disp_doppler');
  if (dumDispSelect) {
    dumDispSelect.addEventListener('change', function() {
      document.getElementById('div_dum_doppler').style.display = (this.value === 'nao') ? 'none' : 'block';
      updatePreview();
    });
  }

  const origemSelect = document.getElementById('origem_ig');
  if (origemSelect) {
    origemSelect.addEventListener('change', function() {
      document.getElementById('div_origem_exame_previo').style.display = (this.value === 'exame_previo') ? 'block' : 'none';
      atualizarIGDoppler();
      updatePreview();
    });
  }

  const atualizarIGDoppler = () => {
    let origem = document.getElementById('origem_ig').value;
    let sem = 0, dias = 0, dpp = "";
    
    // Atualiza o display da DUM independente do método
    let dumVal = document.getElementById('dum') ? document.getElementById('dum').value : '';
    if (dumVal.length === 10) {
      let p = dumVal.split('/');
      let d = new Date(p[2], p[1] - 1, p[0]);
      let diffMs = new Date() - d;
      if (diffMs >= 0) {
        let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let dumSem = Math.floor(diffDias / 7);
        let dumDias = diffDias % 7;
        let dppDate = new Date(d);
        dppDate.setDate(dppDate.getDate() + 280);
        let dumDpp = dppDate.toLocaleDateString('pt-BR');
        let dumDisplay = document.getElementById('dum_doppler_calc_display');
        if(dumDisplay) dumDisplay.innerText = `IG: ${dumSem}s ${dumDias}d | DPP: ${dumDpp}`;
      } else {
        let dumDisplay = document.getElementById('dum_doppler_calc_display');
        if(dumDisplay) dumDisplay.innerText = `Data futura inválida.`;
      }
    } else {
      let dumDisplay = document.getElementById('dum_doppler_calc_display');
      if(dumDisplay) dumDisplay.innerText = `Aguardando data...`;
    }

    if (origem === 'DUM') {
      if (dumVal.length === 10) {
        let p = dumVal.split('/');
        let d = new Date(p[2], p[1] - 1, p[0]);
        let diffMs = new Date() - d;
        if (diffMs >= 0) {
          let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          sem = Math.floor(diffDias / 7);
          dias = diffDias % 7;
          let dppDate = new Date(d);
          dppDate.setDate(dppDate.getDate() + 280);
          dpp = dppDate.toLocaleDateString('pt-BR');
          document.getElementById('ig_calc_display').innerText = `Usando a IG da DUM: ${sem}s ${dias}d`;
        } else {
          document.getElementById('ig_calc_display').innerText = `Data da DUM inválida.`;
        }
      } else {
        document.getElementById('ig_calc_display').innerText = `Aguardando data da DUM...`;
      }
    } else if (origem === 'exame_previo') {
      let dataVal = document.getElementById('exame_previo_data').value;
      let semAnt = parseInt(document.getElementById('exame_previo_sem').value) || 0;
      let diasAnt = parseInt(document.getElementById('exame_previo_dias').value) || 0;
      if (dataVal.length === 10) {
        let p = dataVal.split('/');
        let d = new Date(p[2], p[1] - 1, p[0]);
        let diffMs = new Date() - d;
        if (diffMs >= 0) {
          let diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          let totalDias = (semAnt * 7) + diasAnt + diffDias;
          sem = Math.floor(totalDias / 7);
          dias = totalDias % 7;
          let dppUsg = new Date();
          let diasRestantes = 280 - totalDias;
          dppUsg.setDate(dppUsg.getDate() + diasRestantes);
          dpp = dppUsg.toLocaleDateString('pt-BR');
          document.getElementById('ig_calc_display').innerText = `Calculado pelo exame prévio: ${sem}s ${dias}d | DPP: ${dpp}`;
        } else {
          document.getElementById('ig_calc_display').innerText = `Data futura inválida.`;
        }
      } else {
        document.getElementById('ig_calc_display').innerText = `Aguardando data do exame prévio...`;
      }
    } else {
      document.getElementById('ig_calc_display').innerText = `Informe a IG atualizada abaixo.`;
    }

    if (origem !== 'referida' && sem > 0) {
      document.getElementById('ig_sem').value = sem;
      document.getElementById('ig_dias').value = dias;
      calcularPesoEPerc();
      atualizarFraseILA();
    }
  };

  const dumDoppler = document.getElementById('dum');
  if (dumDoppler) dumDoppler.addEventListener('input', function() { maskData(this); atualizarIGDoppler(); updatePreview(); });
  
  const exPrevData = document.getElementById('exame_previo_data');
  if (exPrevData) exPrevData.addEventListener('input', function() { maskData(this); atualizarIGDoppler(); updatePreview(); });
  
  const exPrevSem = document.getElementById('exame_previo_sem');
  if (exPrevSem) exPrevSem.addEventListener('input', function() { atualizarIGDoppler(); updatePreview(); });
  
  const exPrevDias = document.getElementById('exame_previo_dias');
  if (exPrevDias) exPrevDias.addEventListener('input', function() { atualizarIGDoppler(); updatePreview(); });
  
  const exibirUmero = document.getElementById('exibir_umero');
  if (exibirUmero) {
    exibirUmero.addEventListener('change', function() {
      document.getElementById('div_umero').style.display = this.checked ? 'block' : 'none';
      updatePreview();
    });
  }
});

// ------------------------------------
// NOVO EXAME LOGIC
// ------------------------------------
function abrirModalNovoExame() {
  const modal = document.getElementById('modal-novo-exame');
  if (modal) {
    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('show');
  }
}

function fecharModalNovoExame() {
  const modal = document.getElementById('modal-novo-exame');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }
}

function limparNovoExame() {
  fecharModalNovoExame();
  
  document.querySelectorAll('input[type="text"], input[type="number"], input[type="hidden"]').forEach(el => {
    el.value = '';
  });
  
  document.querySelectorAll('select').forEach(el => {
    el.selectedIndex = 0;
  });
  
  document.querySelectorAll('input[type="checkbox"]').forEach(el => {
    el.checked = (el.id === 'exibir_percentis');
  });
  
  document.querySelectorAll('.feedback-text').forEach(el => {
    if (el.id === 'dum_doppler_calc_display' || el.id === 'dum_calc_display') {
      el.innerText = 'Aguardando data...';
    } else if (el.id === 'ig_calc_display') {
      el.innerText = 'Insira os dados ou digite a idade manualmente.';
    } else if (el.id === 'exame_ant_calc_display') {
      el.innerText = 'Aguardando dados do exame anterior...';
    } else {
      el.innerText = '';
    }
  });

  document.querySelectorAll('.hud-val').forEach(el => {
    el.innerText = '---';
  });
  
  const displayMedio = document.getElementById('display_medio_inic');
  if (displayMedio) displayMedio.innerText = 'MÉDIO: 0.0 mm';
  
  ['div_origem_exame_previo', 'div_umero', 'div_uterinas', 'div_ducto', 'div_exame_ant', 'div_hematoma', 'div_espessura_restos'].forEach(id => {
    let el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });
  
  ['div_dum_doppler', 'div_dum_inic', 'div_vv_inic', 'div_emb_inic'].forEach(id => {
    let el = document.getElementById(id);
    if(el) el.style.display = 'block';
  });

  updatePreview();

  const formAtual = document.querySelector('.view.active');
  if (formAtual) {
    const firstInput = formAtual.querySelector('input:not([type="hidden"]), select');
    if (firstInput) {
      firstInput.focus();
    }
  }
}
