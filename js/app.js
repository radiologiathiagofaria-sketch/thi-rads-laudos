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
    if (utd > 0) document.getElementById('p_utd').value = window.calculos.getPercentilUtA(sem, dias, utd);
    else document.getElementById('p_utd').value = '';
    
    if (ute > 0) document.getElementById('p_ute').value = window.calculos.getPercentilUtA(sem, dias, ute);
    else document.getElementById('p_ute').value = '';
    
    if (utm > 0) document.getElementById('p_ut_medio').value = window.calculos.getPercentilUtA(sem, dias, utm);
    else document.getElementById('p_ut_medio').value = '';
    
    let ipDv = parseFloat(document.getElementById('ip_dv').value.replace(',', '.')) || 0;
    if (ipDv > 0) document.getElementById('p_dv').value = window.calculos.getPercentilDV(sem, dias, ipDv);
    else document.getElementById('p_dv').value = '';
  }

  if (ipU > 0 && ipC > 0 && sem > 0) {
    let rcp = (ipC / ipU).toFixed(2);
    document.getElementById('relacao').value = rcp;

    let pUmb = window.calculos.getPercentilUmb(sem, dias, ipU);
    document.getElementById('p_umb').value = "p" + pUmb;

    let pAcm = window.calculos.getPercentilACM(sem, dias, ipC);
    document.getElementById('p_cer').value = "p" + pAcm;

    let pRcp = window.calculos.getPercentilRCP(sem, dias, ipC, ipU);
    document.getElementById('p_rcp').value = "p" + pRcp;
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
  
  // Create a Range and Selection to select the content
  const range = document.createRange();
  range.selectNodeContents(editor);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    // Execute the copy command (copies HTML + Text)
    const successful = document.execCommand('copy');
    if (successful) {
      showToast('Laudo copiado (com formatação) para a área de transferência!');
    } else {
      alert('Falha ao copiar. Pressione CTRL+C após o texto ser selecionado.');
    }
  } catch (err) {
    console.error('Falha ao copiar', err);
    alert('Erro ao copiar o laudo.');
  }

  // Remove selection
  selection.removeAllRanges();
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
  const origemSelect = document.getElementById('origem_ig');
  if (origemSelect) {
    origemSelect.addEventListener('change', function() {
      document.getElementById('div_origem_dum').style.display = (this.value === 'DUM') ? 'block' : 'none';
      document.getElementById('div_origem_exame_previo').style.display = (this.value === 'exame_previo') ? 'block' : 'none';
      atualizarIGDoppler();
      updatePreview();
    });
  }

  const atualizarIGDoppler = () => {
    let origem = document.getElementById('origem_ig').value;
    let sem = 0, dias = 0, dpp = "";
    
    if (origem === 'DUM') {
      let dumVal = document.getElementById('dum').value;
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
          document.getElementById('ig_calc_display').innerText = `Calculado: ${sem}s ${dias}d | DPP: ${dpp}`;
        } else {
          document.getElementById('ig_calc_display').innerText = `Data futura inválida.`;
        }
      } else {
        document.getElementById('ig_calc_display').innerText = `Aguardando data...`;
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
          document.getElementById('ig_calc_display').innerText = `Calculado pelo exame prévio: ${sem}s ${dias}d`;
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
