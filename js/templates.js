// templates.js - Geração de HTML para o Editor (Rich Text)

function wrapHtml(content) {
  return `<div style="font-family: Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.15; color: #000000;">${content}</div>`;
}

function formatarIdade(sem, dias) {
  let texto = `${sem} semanas`;
  if (dias == 1) texto += ` e 1 dia`;
  else if (dias > 1) texto += ` e ${dias} dias`;
  return texto;
}

function gerarTextoDoppler(dados) {
  let isDoppler = dados.modo === 'doppler';
  let title = isDoppler ? "ULTRASSONOGRAFIA OBSTÉTRICA COM DOPPLERFLUXOMETRIA" : "ULTRASSONOGRAFIA OBSTÉTRICA";
  
  let html = `<div style="text-align: center;"><b>${title}</b></div><br><br>`;
  
  html += `<b>TÉCNICA:</b><br>Exame ultrassonográfico realizado com transdutor convexo por via abdominal.<br><br>`;
  
  // DADOS CLÍNICOS
  html += `<b>DADOS CLÍNICOS:</b><br>`;
  if (dados.origem_ig === 'DUM') {
    html += `Data da última menstruação (DUM): ${dados.dum || '---'}.<br>Idade gestacional pela DUM de ${formatarIdade(dados.ig_calc_sem || dados.ig_sem, dados.ig_calc_dias || dados.ig_dias)}.<br>`;
  } else if (dados.origem_ig === 'referida') {
    html += `Idade gestacional cronológica relatada de ${formatarIdade(dados.ig_sem, dados.ig_dias)}.<br>`;
  } else if (dados.origem_ig === 'exame_previo') {
    html += `Idade gestacional corrigida pelo exame ultrassonográfico do dia ${dados.exame_previo_data || '---'} de ${formatarIdade(dados.ig_calc_sem || dados.ig_sem, dados.ig_calc_dias || dados.ig_dias)}.<br>`;
  } else {
    html += `Idade Gestacional: ${formatarIdade(dados.ig_sem, dados.ig_dias)}.<br>`;
  }
  html += `<br>`;
  
  // ANÁLISE
  html += `<b>ANÁLISE:</b><br>Feto único, em situação ${dados.situacao || '---'}, apresentação ${dados.apresentacao || '---'} e com o dorso ${dados.dorso || '---'}.<br>`;
  html += `Movimentos fetais e batimentos cardíacos presentes<br>Batimento cardíaco fetal (BCF) de ${dados.bcf || '---'} bpm.<br><br>`;
  
  // BIOMETRIA FETAL
  html += `<b>BIOMETRIA FETAL:</b><br>`;
  
  // Percentis Individuais
  let pDbp = "---", pCc = "---", pCa = "---", pCf = "---", pUmero = "---";
  let sem = parseInt(dados.ig_sem) || 0;
  let dias = parseInt(dados.ig_dias) || 0;
  
  if (window.calculos && window.calculos.calcPercentilParametro) {
    pDbp = window.calculos.calcPercentilParametro('dbp', parseFloat(dados.dbp), sem, dias);
    pCc = window.calculos.calcPercentilParametro('cc', parseFloat(dados.cc), sem, dias);
    pCa = window.calculos.calcPercentilParametro('ca', parseFloat(dados.ca), sem, dias);
    pCf = window.calculos.calcPercentilParametro('cf', parseFloat(dados.cf), sem, dias);
    if (dados.umero) {
      pUmero = window.calculos.calcPercentilParametro('umero', parseFloat(dados.umero), sem, dias);
    }
  }

  // Tabela Borderless
  let tableHtml = `<table style="border-collapse: collapse; border: none; font-size: 10pt;">`;
  
  const addRow = (label, val, perc) => {
    let row = `<tr><td style="padding: 2px 20px 2px 0; border: none;">${label}</td><td style="padding: 2px 20px 2px 0; border: none;">${val ? val + ' mm' : '---'}</td>`;
    if (dados.exibir_percentis) {
      row += `<td style="padding: 2px 0; border: none;">Percentil ${perc}</td>`;
    }
    row += `</tr>`;
    return row;
  };

  tableHtml += addRow('Diâmetro biparietal (DBP)', dados.dbp, pDbp);
  tableHtml += addRow('Circunferência cefálica (CC)', dados.cc, pCc);
  tableHtml += addRow('Circunferência abdominal (CA)', dados.ca, pCa);
  tableHtml += addRow('Comprimento do fêmur (CF)', dados.cf, pCf);
  if (dados.exibir_umero) {
    tableHtml += addRow('Comprimento do úmero', dados.umero, pUmero);
  }
  tableHtml += `</table><br>`;
  
  html += tableHtml;
  html += `Peso estimado em ${dados.peso || '---'} gramas pelos critérios de Hadlock IV (+/- 15%).<br>`;
  html += `Percentil estimado no ${dados.p_peso || '---'} (valor de referência p10-p90).<br>`;
  html += `Biometria fetal estimada em ${formatarIdade(dados.biometria_sem, dados.biometria_dias)}.<br><br>`;

  // ÍNDICES BIOMÉTRICOS (Opcional)
  if (dados.exibir_indices) {
    let relCcCa = (dados.cc && dados.ca && dados.ca > 0) ? (dados.cc / dados.ca).toFixed(2) : "---";
    let relCfCa = (dados.cf && dados.ca && dados.ca > 0) ? (dados.cf / dados.ca).toFixed(2) : "---";
    let relCfCc = (dados.cf && dados.cc && dados.cc > 0) ? (dados.cf / dados.cc).toFixed(2) : "---";
    let relCfDbp = (dados.cf && dados.dbp && dados.dbp > 0) ? (dados.cf / dados.dbp).toFixed(2) : "---";

    let hc_ac_mean = 1.18 - (0.005 * sem);
    let p5_cc_ca = (hc_ac_mean - 0.08).toFixed(2);
    let p95_cc_ca = (hc_ac_mean + 0.08).toFixed(2);

    html += `<b>ÍNDICES BIOMÉTRICOS:</b><br>`;
    html += `Relação CC/CA: ${relCcCa} (p5=${p5_cc_ca}; p95=${p95_cc_ca} para ${sem} semanas)<br>`;
    html += `Relação CF/CA: ${relCfCa} (normal de 0.20 a 0.24)<br>`;
    html += `Relação CF/CC: ${relCfCc} (média=0.19; média+2DP= 0.21)<br>`;
    html += `Relação CF/DBP: ${relCfDbp} (normal de 0.71 a 0.87)<br><br>`;
  }

  // PLACENTA E LIQUIDO
  html += `Placenta de inserção corporal ${dados.placenta || '---'}, não se estendendo até o segmento inferior do útero.<br>`;
  if (dados.espessura_placenta) {
    html += `Espessura placentária de ${dados.espessura_placenta} cm e grau ${dados.placenta_grau || '0'} de maturidade (Grannum).<br><br>`;
  } else {
    html += `Grau ${dados.placenta_grau || '0'} de maturidade (Grannum).<br><br>`;
  }
  
  html += `Cordão umbilical com morfologia normal. Presença de duas artérias e uma veia.<br><br>`;
  html += `Líquido amniótico ${dados.frase_ila || 'de volume normal'}.<br>`;
  
  if (dados.ila) {
    html += `Índice de Líquido Amniótico (ILA): ${dados.ila} cm. Maior bolsão de ${dados.maior_bolsao || '---'} cm.<br><br>`;
  } else if (dados.maior_bolsao) {
    html += `Maior bolsão de ${dados.maior_bolsao} cm.<br><br>`;
  } else {
    html += `<br>`;
  }

  // DOPPLER
  if (isDoppler) {
    html += `<b>ESTUDO DOPPLERFLUXOMÉTRICO:</b><br>`;
    html += `Índice de Pulsatilidade (IP) das artérias umbilicais: ${dados.ip_u || '---'} (percentil ${dados.p_umb || '---'}).<br>`;
    html += `Índice de pulsatilidade (IP) da artéria cerebral média de ${dados.ip_c || '---'} (percentil ${dados.p_cer || '---'}).<br>`;
    html += `Relação Cérebro-Placentária (RCP) = ${dados.relacao || '---'} (percentil ${dados.p_rcp || '---'}).<br>`;
    
    if (dados.exibir_uterinas) {
      let p_utd = dados.p_utd ? ` (percentil ${dados.p_utd})` : '';
      let p_ute = dados.p_ute ? ` (percentil ${dados.p_ute})` : '';
      let p_ut_medio = dados.p_ut_medio ? ` (percentil ${dados.p_ut_medio})` : '';
      html += `Artéria uterina direita com índice de pulsatilidade de ${dados.ip_utd || '---'}${p_utd}.<br>`;
      html += `Artéria uterina esquerda com índice de pulsatilidade de ${dados.ip_ute || '---'}${p_ute}.<br>`;
      html += `Índice de pulsatilidade Médio das Artérias Uterinas = ${dados.ip_ut_medio || '---'}${p_ut_medio}.<br>`;
    }
    if (dados.exibir_ducto) {
      let ondaA = dados.onda_a_dv ? dados.onda_a_dv.charAt(0).toUpperCase() + dados.onda_a_dv.slice(1) : '---';
      let p_dv = dados.p_dv ? ` (percentil ${dados.p_dv})` : '';
      html += `Ducto Venoso: IP = ${dados.ip_dv || '---'}${p_dv} (Onda A ${ondaA}).<br>`;
    }
    html += `<br>`;
  }

  // IMPRESSÃO DIAGNÓSTICA
  let imp = `<b>IMPRESSÃO DIAGNÓSTICA:</b><br>- Gestação com feto único e vivo.<br>`;
  
  if (dados.origem_ig === 'DUM') {
    imp += `- Idade gestacional cronológica pela DUM de ${formatarIdade(dados.ig_calc_sem || dados.ig_sem, dados.ig_calc_dias || dados.ig_dias)}.<br>`;
  } else if (dados.origem_ig === 'referida') {
    imp += `- Idade gestacional cronológica referida de ${formatarIdade(dados.ig_sem, dados.ig_dias)}.<br>`;
  } else if (dados.origem_ig === 'exame_previo') {
    imp += `- Idade gestacional cronológica de ${formatarIdade(dados.ig_calc_sem || dados.ig_sem, dados.ig_calc_dias || dados.ig_dias)} pelo exame do dia ${dados.exame_previo_data || '---'}.<br>`;
  } else {
    imp += `- Idade gestacional cronológica de ${formatarIdade(dados.ig_sem, dados.ig_dias)}.<br>`;
  }
  
  imp += `- Biometria fetal de ${formatarIdade(dados.biometria_sem, dados.biometria_dias)}.`;
  
  if (isDoppler) {
    imp += `<br>- Estudo dopplervelocimétrico dentro da normalidade para idade gestacional.`;
  }
  
  let percPeso = parseFloat(dados.p_peso_raw);
  if (!isNaN(percPeso)) {
    if (percPeso >= 10 && percPeso <= 90) {
      imp += `<br>- Crescimento fetal adequado para idade gestacional segundo Hadlock IV.`;
    } else if (percPeso > 90) {
      imp += `<br>- Feto grande para idade gestacional.`;
    } else if (percPeso < 10 && percPeso > 2.9) {
      imp += `<br>- Feto pequeno para idade gestacional.`;
    } else if (percPeso <= 2.9) {
      imp += `<br>- Restrição de crescimento intrauterino (percentil do peso abaixo do p3 para idade gestacional).`;
    }
  }

  html += imp + `<br><br>`;
  html += `<span style="font-size: 8pt;">Nota: O objetivo do ultrassom obstétrico é avaliar o crescimento e vitalidade fetais. Não tem finalidade de rastreamento e diagnóstico de doenças genéticas e/ou malformações fetais.</span>`;

  return wrapHtml(html);
}

function gerarTextoInicial(dados) {
  // Posição do útero
  let posUtero = dados.posicao_utero || '---';

  // Saco Gestacional
  let diametrosSG = `${dados.sg_a || '---'} x ${dados.sg_b || '---'} x ${dados.sg_c || '---'}`;
  let sgMedio = dados.sg_medio || '---';

  // Vesícula Vitelina
  let vvTexto = (dados.tem_vv === 'sim') 
    ? `Vesícula vitelina presente e de aspecto habitual, medindo ${dados.vv_mm || '---'} mm.` 
    : `Vesícula vitelina não caracterizada.`;

  // Embrião e BCF
  let embTexto, bcfTexto, impEmb;
  if (dados.tem_emb === 'sim') {
    embTexto = `Embrião único com comprimento cabeça-nádega (CCN) medindo ${dados.ccn || '---'} mm.`;
    bcfTexto = `Movimentos embrionários e batimentos cardíacos presentes (BCF = ${dados.bcf || '---'} bpm).`;
    impEmb = `- Gestação tópica, com embrião único e vivo.<br>- Idade gestacional de ${formatarIdade(dados.idade_calc_sem || 'X', dados.idade_calc_dias || 'Y')} (+/- 5 dias) pelo CCN.`;
  } else {
    embTexto = `Embrião não caracterizado.`;
    bcfTexto = ``;
    impEmb = `- Saco gestacional tópico.<br>- Embrião não caracterizado neste exame, achado que pode ser compatível com idade gestacional precoce. Sugere-se controle ultrassonográfico evolutivo.`;
  }

  // Hematoma
  let hemTexto = "";
  if (dados.tem_hematoma === 'sim') {
    let parede = dados.hematoma_parede || '---';
    let dimHem = `${dados.hem_a || '---'} x ${dados.hem_b || '---'} x ${dados.hem_c || '---'}`;
    hemTexto = `Nota-se imagem laminar, hipoecogênica, de contornos irregulares, sem fluxo ao estudo Doppler, adjacente à parede ${parede} do saco gestacional, medindo ${dimHem} mm, sugerindo hematoma.<br><br>`;
    impEmb += `<br>- Hematoma retrocoriônico.`;
  }

  // Ovários
  let ovariosTexto = `Ovários em topografia, morfologia, contornos, dimensões e ecotextura normais.`;
  if (dados.sel_ovarios === "nenhum") ovariosTexto = `Ovários não caracterizados no presente estudo (interposição gasosa de alças intestinais).`;
  else if (dados.sel_ovarios === "so_direito") ovariosTexto = `Ovário esquerdo não caracterizado (interposição gasosa de alças intestinais).<br>Ovário direito em topografia, morfologia, contornos, dimensões e ecotextura normais.`;
  else if (dados.sel_ovarios === "so_esquerdo") ovariosTexto = `Ovário direito não caracterizado (interposição gasosa de alças intestinais).<br>Ovário esquerdo em topografia, morfologia, contornos, dimensões e ecotextura normais.`;

  let html = `<div style="text-align: center;"><b>ULTRASSONOGRAFIA OBSTÉTRICA (1º TRIMESTRE)</b></div><br><br>`;

  html += `<b>TÉCNICA:</b><br>Exame ultrassonográfico realizado com transdutor endocavitário pela via transvaginal.<br><br>`;

  // Dados da DUM e Exame Anterior
  let dadosClinicos = `<b>DADOS CLÍNICOS:</b><br>`;
  
  if (dados.dum_disp === 'sim' && dados.dum_data && dados.dum_data.length === 10 && dados.dpp_texto) {
    dadosClinicos += `Data da última menstruação (DUM): ${dados.dum_data}<br>Idade gestacional pela DUM: ${formatarIdade(dados.ig_dum_sem, dados.ig_dum_dias)}.<br>Data provável do parto (DPP): ${dados.dpp_texto}<br>`;
  } else {
    dadosClinicos += `Data da última menstruação não disponível.<br>`;
  }

  if (dados.exame_ant_disp === 'sim' && dados.exame_ant_data && dados.exame_ant_data.length === 10 && dados.ig_corrigida_sem !== undefined) {
    dadosClinicos += `Idade gestacional corrigida pelo exame do dia ${dados.exame_ant_data} de ${formatarIdade(dados.ig_corrigida_sem, dados.ig_corrigida_dias)}.<br>`;
  }

  dadosClinicos += `<br>`;
  html += dadosClinicos;

  html += `<b>ANÁLISE:</b><br>Bexiga urinária vazia.<br><br>`;
  
  html += `Útero ${posUtero}.<br>Dimensões uterinas gravídicas.<br>Miométrio com ecotextura homogênea.<br><br>`;
  
  html += `Saco gestacional em localização fúndica na cavidade uterina, de contornos regulares e medindo ${diametrosSG} mm (diâmetro médio do saco gestacional de ${sgMedio} mm).<br><br>`;
  
  html += hemTexto;
  
  html += `${vvTexto}<br><br>`;
  
  if (bcfTexto) {
    html += `${embTexto}<br>${bcfTexto}<br><br>`;
  } else {
    html += `${embTexto}<br><br>`;
  }
  
  html += `${ovariosTexto}<br><br>`;
  
  html += `Fundo de saco posterior livre de coleções.<br><br>`;
  
  html += `<b>IMPRESSÃO DIAGNÓSTICA:</b><br>${impEmb}`;

  return wrapHtml(html);
}

function gerarTextoRestosOvulares(dados) {
  let posUtero = dados.posicao_utero || '---';
  let espessura = dados.espessura_restos_mm || 'X';

  let html = `<div style="text-align: center;"><b>ULTRASSONOGRAFIA PÉLVICA TRANSVAGINAL</b></div><br><br>`;

  html += `<b>TÉCNICA:</b><br>Exame ultrassonográfico realizado com transdutor endocavitário pela via transvaginal.<br><br>`;

  // Dados da DUM
  if (dados.dum_disp === 'sim' && dados.dum_data && dados.dum_data.length === 10) {
    let idadeStr = (dados.ig_dum_sem !== undefined && !isNaN(dados.ig_dum_sem)) 
      ? formatarIdade(dados.ig_dum_sem, dados.ig_dum_dias) 
      : 'xx/xx/xxxx';
    html += `<b>ANÁLISE:</b><br>Data da última menstruação (DUM): ${dados.dum_data}.<br>Idade Gestacional estimada pela DUM: ${idadeStr}.<br><br>`;
  } else {
    html += `<b>ANÁLISE:</b><br>Data da última menstruação (DUM): não disponível.<br><br>`;
  }

  html += `Bexiga urinária vazia.<br><br>`;
  
  html += `Útero ${posUtero}.<br>Dimensões uterinas aumentadas.<br>Miométrio com ecotextura homogênea.<br><br>`;
  
  html += `Cavidade uterina preenchida por material heterogêneo, sem fluxo ao estudo Doppler, medindo até ${espessura} mm de espessura, podendo corresponder à sangue, coágulos e/ou restos ovulares.<br><br>`;

  let ovariosTexto = `Ovários em topografia, morfologia, contornos, dimensões e ecotextura normais.`;
  if (dados.sel_ovarios === "nenhum") ovariosTexto = `Ovários não caracterizados no presente estudo (interposição gasosa de alças intestinais).`;
  else if (dados.sel_ovarios === "so_direito") ovariosTexto = `Ovário esquerdo não caracterizado (interposição gasosa de alças intestinais).<br>Ovário direito em topografia, morfologia, contornos, dimensões e ecotextura normais.`;
  else if (dados.sel_ovarios === "so_esquerdo") ovariosTexto = `Ovário direito não caracterizado (interposição gasosa de alças intestinais).<br>Ovário esquerdo em topografia, morfologia, contornos, dimensões e ecotextura normais.`;

  html += `${ovariosTexto}<br><br>`;
  
  html += `Fundo de saco posterior livre de coleções.<br><br>`;
  
  html += `<b>IMPRESSÃO DIAGNÓSTICA:</b><br>- Material heterogêneo na cavidade uterina. Considerar possibilidade de restos ovulares/coágulos.`;

  return wrapHtml(html);
}

window.templates = {
  gerarTextoDoppler: gerarTextoDoppler,
  gerarTextoInicial: gerarTextoInicial,
  gerarTextoRestosOvulares: gerarTextoRestosOvulares
};
