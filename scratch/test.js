var window={}; var document={getElementById:function(){return {innerHTML:''}}, body:{classList:{toggle:function(){}}}}; var localStorage={getItem:function(){}, setItem:function(){}}; var navigator={}; var alert=function(){};

const estado = {
  rins: {
    sit: 'habitual',
    ectopicoLado: 'direito',
    ectopicoLoc: 'fossa ilíaca direita',
    nefrecDir: false, nefrecEsq: false,
    afeccaoLado: 'bilateral',
    dimRD_L: '', dimRD_AP: '', dimRD_T: '', espRD: '',
    dimRE_L: '', dimRE_AP: '', dimRE_T: '', espRE: '',
    hidroDir: 'ausente', hidroEsq: 'ausente',
    ureterDir: false, ureterEsq: false,
    lesoes: []
  },
  bexiga: {
    sit: 'habitual',
    espParede: '',
    diverticulos: false,
    conteudoDebris: false,
    conteudoCoagulo: false, coaguloX: '', coaguloY: '', coaguloZ: '',
    conteudoCalculo: false, calculoX: '', calculoY: '', calculoZ: '',
    conteudoLesao: false, lesaoLoc: 'assoalho vesical', lesaoX: '', lesaoY: '', lesaoZ: '', lesaoFluxo: false,
    conteudoBalao: false,
    jatos: 'nao_citar'
  },
  volume: {
    preL: '', preAP: '', preT: '',
    posL: '', posAP: '', posT: ''
  },
  adicionais: { texto: '' }
};

let secaoAtual = 'rins';
let lesaoId = 0;

function showSection(sec){
  secaoAtual = sec;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('nav-'+sec).classList.add('active');
  renderPanel();
  updateLaudo();
}

function renderPanel(){
  const p = document.getElementById('main-panel');
  if(secaoAtual==='rins') p.innerHTML = renderRins();
  else if(secaoAtual==='bexiga') p.innerHTML = renderBexiga();
  else if(secaoAtual==='volume') p.innerHTML = renderVolume();
  else if(secaoAtual==='adicionais') p.innerHTML = renderAdicionais();
}

function radio(id, val, label, name, extra=''){
  const sel = estado[secaoAtual].sit === val ? 'selected' : '';
  return \`<div class="radio-opt \${sel}" onclick="setSit('\${val}')"><input type="radio" name="\${name}"><label class="radio-label"><span class="radio-mark"></span>\${label}\${extra}</label></div>\`;
}
function radioVal(sec, field, val, label, name, extra=''){
  const sel = estado[sec][field] === val ? 'selected' : '';
  return \`<div class="radio-opt \${sel}" onclick="setVal('\${sec}','\${field}','\${val}')"><input type="radio" name="\${name}"><label class="radio-label"><span class="radio-mark"></span>\${label}\${extra}</label></div>\`;
}
function chk(sec, field, label){
  const sel = estado[sec][field] ? 'selected' : '';
  return \`<div class="check-row \${sel}" onclick="toggleChk('\${sec}','\${field}')"><input type="checkbox" \${estado[sec][field]?'checked':''}><label class="check-label"><span class="check-box"><svg viewBox="0 0 10 10" fill="none" stroke="#fff" stroke-width="1.8"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg></span>\${label}</label></div>\`;
}
function dimInput(sec, field, label, unit='cm'){
  return \`<div class="dim-row"><span class="dim-lbl">\${label}</span><input class="dim-input" type="text" value="\${estado[sec][field]}" placeholder="—" oninput="setVal('\${sec}','\${field}',this.value)"><span class="dim-unit">\${unit}</span></div>\`;
}
function selTag(opts, val, onchangeStr){
  return \`<select class="sel-tag" onchange="\${onchangeStr}" onclick="event.stopPropagation()">\${opts.map(o=>\`<option value="\${o.v}" \${val===o.v?'selected':''}>\${o.l}</option>\`).join('')}</select>\`;
}

// ── RINS ──
function renderRins(){
  const e = estado.rins;
  const isSit = (v) => e.sit===v ? 'selected' : '';
  const hdOpt = [{v:'ausente',l:'ausente'},{v:'discreta',l:'discreta'},{v:'moderada',l:'moderada'},{v:'acentuada',l:'acentuada'}];
  return \`
  <div class="sec-title">Rins e Ureteres</div>
  <div class="block"><div class="block-title">Nefrectomia</div>
    \${chk('rins','nefrecDir','Nefrectomia Direita')}
    \${chk('rins','nefrecEsq','Nefrectomia Esquerda')}
  </div>
  <div class="block"><div class="block-title">Situação Geral</div>
    <div class="radio-opt \${isSit('habitual')}" onclick="setSit('habitual')"><label class="radio-label"><span class="radio-mark"></span>Habituais</label></div>
    <div class="radio-opt \${isSit('ectopico')}" onclick="setSit('ectopico')"><label class="radio-label"><span class="radio-mark"></span>Ectópico \${selTag([{v:'direito',l:'direito'},{v:'esquerdo',l:'esquerdo'}],e.ectopicoLado,"setVal('rins','ectopicoLado',this.value)")} em \${selTag([{v:'fossa ilíaca direita',l:'fossa ilíaca direita'},{v:'fossa ilíaca esquerda',l:'fossa ilíaca esquerda'},{v:'pelve',l:'pelve'}],e.ectopicoLoc,"setVal('rins','ectopicoLoc',this.value)")}</label></div>
    <div class="radio-opt \${isSit('ferradura')}" onclick="setSit('ferradura')"><label class="radio-label"><span class="radio-mark"></span>Em ferradura</label></div>
    <div class="radio-opt \${isSit('drpad')}" onclick="setSit('drpad')"><label class="radio-label"><span class="radio-mark"></span>Doença renal policística (DRPAD)</label></div>
    <div class="radio-opt \${isSit('insuf')}" onclick="setSit('insuf')"><label class="radio-label"><span class="radio-mark"></span>Insuficiência renal incipiente \${selTag([{v:'bilateral',l:'bilateral'},{v:'à direita',l:'à direita'},{v:'à esquerda',l:'à esquerda'}],e.afeccaoLado,"setVal('rins','afeccaoLado',this.value)")}</label></div>
    <div class="radio-opt \${isSit('aguda')}" onclick="setSit('aguda')"><label class="radio-label"><span class="radio-mark"></span>Nefropatia aguda \${selTag([{v:'bilateral',l:'bilateral'},{v:'à direita',l:'à direita'},{v:'à esquerda',l:'à esquerda'}],e.afeccaoLado,"setVal('rins','afeccaoLado',this.value)")}</label></div>
    <div class="radio-opt \${isSit('cronica')}" onclick="setSit('cronica')"><label class="radio-label"><span class="radio-mark"></span>Nefropatia crônica \${selTag([{v:'bilateral',l:'bilateral'},{v:'à direita',l:'à direita'},{v:'à esquerda',l:'à esquerda'}],e.afeccaoLado,"setVal('rins','afeccaoLado',this.value)")}</label></div>
  </div>
  \${!e.nefrecDir ? \`<div class="block"><div class="block-title">Dimensões Rim Direito</div><div class="dim-rows">
    \${dimInput('rins','dimRD_L','Comprimento')}
    \${dimInput('rins','dimRD_AP','A-P')}
    \${dimInput('rins','dimRD_T','Largura')}
    \${dimInput('rins','espRD','Espessura Parênquima')}
  </div></div>\` : ''}
  \${!e.nefrecEsq ? \`<div class="block"><div class="block-title">Dimensões Rim Esquerdo</div><div class="dim-rows">
    \${dimInput('rins','dimRE_L','Comprimento')}
    \${dimInput('rins','dimRE_AP','A-P')}
    \${dimInput('rins','dimRE_T','Largura')}
    \${dimInput('rins','espRE','Espessura Parênquima')}
  </div></div>\` : ''}
  
  <div class="block"><div class="block-title">Dilatação do Sistema Coletor (Hidronefrose)</div>
    \${!e.nefrecDir ? \`<div style="padding:8px 14px 4px;"><label style="font-size:12px;color:var(--text-2);">À Direita:</label> \${selTag(hdOpt,e.hidroDir,"setVal('rins','hidroDir',this.value)")}</div>\`:''}
    \${(!e.nefrecDir && e.hidroDir !== 'ausente') ? chk('rins','ureterDir','Dilatação ureteral à direita') : ''}
    \${!e.nefrecEsq ? \`<div style="padding:8px 14px 4px;"><label style="font-size:12px;color:var(--text-2);">À Esquerda:</label> \${selTag(hdOpt,e.hidroEsq,"setVal('rins','hidroEsq',this.value)")}</div>\`:''}
    \${(!e.nefrecEsq && e.hidroEsq !== 'ausente') ? chk('rins','ureterEsq','Dilatação ureteral à esquerda') : ''}
  </div>

  <div class="block"><div class="block-title">Lesões Renais</div><div class="lesoes-wrap">
    <div id="lesoes-renais-list">\${renderLesoesRenais()}</div>
    <div style="display:flex;gap:6px;margin-top:4px;">
      <button class="btn-add-lesao" onclick="addLesaoRim('calculo')">+ Cálculo</button>
      \${e.sit!=='drpad' ? \`<button class="btn-add-lesao" onclick="addLesaoRim('cisto')">+ Cisto</button>\`:''}
      <button class="btn-add-lesao" onclick="addLesaoRim('nodulo')">+ Nódulo</button>
    </div>
  </div></div>
  \`;
}

function renderLesoesRenais(){
  return estado.rins.lesoes.map(l => {
    let extra = '';
    const lados = [{v:'direito',l:'direito'},{v:'esquerdo',l:'esquerdo'},{v:'bilateral',l:'bilateral'}];
    const locs = [{v:'terço superior',l:'terço superior'},{v:'terço médio',l:'terço médio'},{v:'terço inferior',l:'terço inferior'},{v:'junção ureteropiélica',l:'junção ureteropiélica'},{v:'junção ureterovesical',l:'junção ureterovesical'},{v:'ureter proximal',l:'ureter proximal'},{v:'ureter médio',l:'ureter médio'},{v:'ureter distal',l:'ureter distal'}];
    
    if(l.tipo==='calculo'){
      extra = \`<div class="ff"><label>Lado</label><select onchange="updLesaoRim(\${l.id},'lado',this.value)">\${lados.map(o=>\`<option value="\${o.v}" \${l.lado===o.v?'selected':''}>\${o.l}</option>\`).join('')}</select></div>
               <div class="ff"><label>Localização</label><select onchange="updLesaoRim(\${l.id},'loc',this.value)">\${locs.map(o=>\`<option value="\${o.v}" \${l.loc===o.v?'selected':''}>\${o.l}</option>\`).join('')}</select></div>
               <div class="ff"><label>Agrupamento</label><select onchange="updLesaoRim(\${l.id},'agrup',this.value)"><option value="unico" \${l.agrup==='unico'?'selected':''}>único</option><option value="varios" \${l.agrup==='varios'?'selected':''}>vários (maior)</option></select></div>\`;
    }else if(l.tipo==='cisto'){
      extra = \`<div class="ff"><label>Lado</label><select onchange="updLesaoRim(\${l.id},'lado',this.value)">\${lados.map(o=>\`<option value="\${o.v}" \${l.lado===o.v?'selected':''}>\${o.l}</option>\`).join('')}</select></div>
               <div class="ff"><label>Localização</label><select onchange="updLesaoRim(\${l.id},'loc',this.value)">\${locs.slice(0,3).map(o=>\`<option value="\${o.v}" \${l.loc===o.v?'selected':''}>\${o.l}</option>\`).join('')}</select></div>
               <div class="ff"><label>Agrupamento</label><select onchange="updLesaoRim(\${l.id},'agrup',this.value)"><option value="unico" \${l.agrup==='unico'?'selected':''}>único</option><option value="varios" \${l.agrup==='varios'?'selected':''}>múltiplos (maior)</option></select></div>
               <div class="ff"><label>Composição</label><select onchange="updLesaoRim(\${l.id},'comp',this.value)"><option value="simples" \${l.comp==='simples'?'selected':''}>simples</option><option value="complexo" \${l.comp==='complexo'?'selected':''}>complexo</option></select></div>
               <div class="ff"><label>Topografia</label><select onchange="updLesaoRim(\${l.id},'topo',this.value)"><option value="cortical" \${l.topo==='cortical'?'selected':''}>cortical</option><option value="seio renal" \${l.topo==='seio renal'?'selected':''}>seio renal</option></select></div>\`;
    }else if(l.tipo==='nodulo'){
      extra = \`<div class="ff"><label>Lado</label><select onchange="updLesaoRim(\${l.id},'lado',this.value)">\${lados.map(o=>\`<option value="\${o.v}" \${l.lado===o.v?'selected':''}>\${o.l}</option>\`).join('')}</select></div>
               <div class="ff"><label>Localização</label><select onchange="updLesaoRim(\${l.id},'loc',this.value)">\${locs.slice(0,3).map(o=>\`<option value="\${o.v}" \${l.loc===o.v?'selected':''}>\${o.l}</option>\`).join('')}</select></div>
               <div class="ff"><label>Agrupamento</label><select onchange="updLesaoRim(\${l.id},'agrup',this.value)"><option value="unico" \${l.agrup==='unico'?'selected':''}>único</option><option value="varios" \${l.agrup==='varios'?'selected':''}>múltiplos (maior)</option></select></div>
               <div class="ff"><label>Ecogenicidade</label><select onchange="updLesaoRim(\${l.id},'eco',this.value)"><option value="hipoecoico" \${l.eco==='hipoecoico'?'selected':''}>hipoecoico</option><option value="hiperecoico" \${l.eco==='hiperecoico'?'selected':''}>hiperecoico</option><option value="isoecoico" \${l.eco==='isoecoico'?'selected':''}>isoecoico</option></select></div>\`;
    }
    
    return \`
    <div class="lesao-card">
      <div class="lesao-hd"><span class="lesao-hd-title">\${l.tipo.toUpperCase()}</span><button class="btn-rem" onclick="remLesaoRim(\${l.id})">✕ remover</button></div>
      <div class="ff-grid">\${extra}</div>
      <div class="ff-grid">
        <div class="ff"><label>Med.1 (cm)</label><input type="text" value="\${l.m1}" oninput="updLesaoRim(\${l.id},'m1',this.value)"></div>
        <div class="ff"><label>Med.2 (cm)</label><input type="text" value="\${l.m2}" oninput="updLesaoRim(\${l.id},'m2',this.value)"></div>
        <div class="ff"><label>Med.3 (cm)</label><input type="text" value="\${l.m3}" oninput="updLesaoRim(\${l.id},'m3',this.value)"></div>
      </div>
    </div>\`;
  }).join('');
}

// ── BEXIGA ──
function renderBexiga(){
  const e = estado.bexiga;
  return \`
  <div class="sec-title">Bexiga</div>
  <div class="block"><div class="block-title">Situação</div>
    \${radioVal('bexiga','sit','habitual','Habitual (distensão adequada, paredes finas)','sit_bex')}
    \${radioVal('bexiga','sit','parcial','Distensão parcial','sit_bex')}
    \${radioVal('bexiga','sit','espessada','Paredes espessadas','sit_bex')}
    \${radioVal('bexiga','sit','vazia','Vazia','sit_bex')}
  </div>
  \${e.sit==='espessada' ? \`
  <div class="block"><div class="block-title">Paredes</div>
    \${dimInput('bexiga','espParede','Espessura parietal')}
    \${chk('bexiga','diverticulos','Presença de divertículos')}
  </div>\` : ''}
  
  \${e.sit!=='vazia' ? \`
  <div class="block"><div class="block-title">Conteúdo</div>
    \${chk('bexiga','conteudoDebris','Ecos em suspensão (debris)')}
    \${chk('bexiga','conteudoCoagulo','Coágulo')}
    \${e.conteudoCoagulo ? \`<div class="dim-rows" style="background:#fafbff;border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
      \${dimInput('bexiga','coaguloX','Med 1')} \${dimInput('bexiga','coaguloY','Med 2')} \${dimInput('bexiga','coaguloZ','Med 3')}</div>\`:''}
    \${chk('bexiga','conteudoCalculo','Cálculo')}
    \${e.conteudoCalculo ? \`<div class="dim-rows" style="background:#fafbff;border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
      \${dimInput('bexiga','calculoX','Med 1')} \${dimInput('bexiga','calculoY','Med 2')} \${dimInput('bexiga','calculoZ','Med 3')}</div>\`:''}
    \${chk('bexiga','conteudoLesao','Lesão vegetante / exofítica')}
    \${e.conteudoLesao ? \`<div class="dim-rows" style="background:#fafbff;border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
      \${dimInput('bexiga','lesaoLoc','Localização (texto)','')} \${dimInput('bexiga','lesaoX','Med 1')} \${dimInput('bexiga','lesaoY','Med 2')} \${dimInput('bexiga','lesaoZ','Med 3')}
      \${chk('bexiga','lesaoFluxo','Com fluxo ao Doppler')}</div>\`:''}
    \${chk('bexiga','conteudoBalao','Balão de sonda vesical')}
  </div>
  <div class="block"><div class="block-title">Jatos Ureterais</div>
    \${radioVal('bexiga','jatos','nao_citar','Não citar','jat')}
    \${radioVal('bexiga','jatos','simetricos','Presentes e simétricos','jat')}
    \${radioVal('bexiga','jatos','reduzido_d','Presentes, reduzidos à direita','jat')}
    \${radioVal('bexiga','jatos','reduzido_e','Presentes, reduzidos à esquerda','jat')}
    \${radioVal('bexiga','jatos','nao_caracterizados','Não caracterizados','jat')}
  </div>\` : ''}
  \`;
}

// ── VOLUME VESICAL ──
function renderVolume(){
  const e = estado.volume;
  const cv = (l,ap,t) => l&&ap&&t ? Math.round(parseFloat(l)*parseFloat(ap)*parseFloat(t)*0.52*1000) : 0;
  const volPre = cv(e.preL,e.preAP,e.preT);
  const volPos = cv(e.posL,e.posAP,e.posT);
  
  return \`
  <div class="sec-title">Volume Vesical (Opcional)</div>
  <div class="block"><div class="block-title">Pré-miccional \${volPre>0?\`(\${volPre} mL)\`:''}</div><div class="dim-rows">
    \${dimInput('volume','preL','Longitudinal')}
    \${dimInput('volume','preAP','Antero-posterior')}
    \${dimInput('volume','preT','Transverso')}
  </div></div>
  <div class="block"><div class="block-title">Pós-miccional \${volPos>0?\`(\${volPos} mL)\`:''}</div><div class="dim-rows">
    \${dimInput('volume','posL','Longitudinal')}
    \${dimInput('volume','posAP','Antero-posterior')}
    \${dimInput('volume','posT','Transverso')}
  </div></div>
  \`;
}

// ── ACHADOS ADICIONAIS ──
function renderAdicionais(){
  return \`
  <div class="sec-title">Achados Adicionais</div>
  <div class="block"><div class="block-title">Texto Livre</div>
    <div style="padding:14px;">
      <textarea class="achados" id="txt-adicionais" oninput="setVal('adicionais','texto',this.value)" placeholder="Digite aqui...">\${estado.adicionais.texto}</textarea>
    </div>
  </div>
  \`;
}

// ── CONTROLES ──
function setSit(val){ estado.rins.sit = val; if(val==='drpad')estado.rins.lesoes=estado.rins.lesoes.filter(l=>l.tipo!=='cisto'); renderPanel(); updateLaudo(); }
function setVal(sec, field, val){ estado[sec][field] = val; renderPanel(); updateLaudo(); }
function toggleChk(sec, field){ estado[sec][field] = !estado[sec][field]; renderPanel(); updateLaudo(); }

function addLesaoRim(tipo){
  estado.rins.lesoes.push({
    id: ++lesaoId, tipo, lado: 'direito', loc: 'terço médio', agrup: 'unico',
    comp: 'simples', eco: 'hipoecoico', topo: 'cortical',
    m1: '', m2: '', m3: ''
  });
  renderPanel(); updateLaudo();
}
function remLesaoRim(id){ estado.rins.lesoes = estado.rins.lesoes.filter(l=>l.id!==id); renderPanel(); updateLaudo(); }
function updLesaoRim(id, field, val){ const l = estado.rins.lesoes.find(l=>l.id===id); if(l){l[field]=val; updateLaudo();} }

function medStr(l){
  const p = [l.m1,l.m2,l.m3].filter(m=>m&&m.trim()!=='');
  return p.length ? \`medindo \${p.join(' x ')} cm\` : '';
}
function medStrAprox(l){
  const p = [l.m1,l.m2,l.m3].filter(m=>m&&m.trim()!=='');
  return p.length ? \`medindo cerca de \${p.join(' x ')} cm\` : '';
}

// ── GERADOR DE LAUDO ──
function updateLaudo(){
  const eR = estado.rins;
  const eB = estado.bexiga;
  const eV = estado.volume;
  const eA = estado.adicionais;

  let analise = [];
  let opinioes = [];

  // RINS
  let fraseRins = '';
  let opRins = '';
  
  if(eR.nefrecDir && eR.nefrecEsq){
    fraseRins = 'Rins direito e esquerdo não caracterizados (status pós-operatório).';
    opRins = 'Status pós-nefrectomia bilateral.';
  } else {
    let preRins = '';
    
    // Situação Base
    if(eR.sit==='habitual'){
      if(eR.nefrecDir) { preRins = 'Rim direito não caracterizado (status pós-operatório). Rim esquerdo em topografia habitual, com dimensões usuais e contornos regulares.'; opRins = 'Status pós-nefrectomia direita.'; }
      else if(eR.nefrecEsq) { preRins = 'Rim esquerdo não caracterizado (status pós-operatório). Rim direito em topografia habitual, com dimensões usuais e contornos regulares.'; opRins = 'Status pós-nefrectomia esquerda.'; }
      else { preRins = 'Rins em topografia habitual, com dimensões usuais e contornos regulares.'; }
    } else if(eR.sit==='ectopico'){
      const outroLado = eR.ectopicoLado==='direito'?'esquerdo':'direito';
      if((eR.ectopicoLado==='direito'&&eR.nefrecEsq)||(eR.ectopicoLado==='esquerdo'&&eR.nefrecDir)){
        preRins = \`Rim \${outroLado} não caracterizado (status pós-operatório). Rim \${eR.ectopicoLado} localizado em \${eR.ectopicoLoc}, com dimensões usuais e contornos regulares.\`;
        opRins = \`Rim \${eR.ectopicoLado} ectópico. Status pós-nefrectomia \${outroLado}.\`;
      } else {
        preRins = \`Rim \${eR.ectopicoLado} localizado em \${eR.ectopicoLoc}. Rim \${outroLado} em topografia habitual. Rins com dimensões usuais e contornos regulares.\`;
        opRins = \`Rim \${eR.ectopicoLado} ectópico.\`;
      }
    } else if(eR.sit==='ferradura'){
      preRins = 'Rins apresentando desvio anterior do seu eixo de rotação assim como fusão de seus polos inferiores em topografia de linha média, anteriormente à aorta abdominal.';
      opRins = 'Rins em ferradura.';
    } else if(eR.sit==='drpad'){
      preRins = 'Rins em topografia habitual, com dimensões aumentadas e contornos lobulados. Presença de alteração ecotextural caracterizada por distorção arquitetural difusa à custa de múltiplos cistos dispersos por todo o parênquima renal bilateralmente, predominantemente corticais.';
      opRins = 'Achados ecográficos compatíveis com doença renal policística autossômica dominante.';
    } else if(eR.sit==='insuf'){
      preRins = \`Rins em topografia habitual, com dimensões habituais e contornos lobulados.\`;
      opRins = \`Achados ecográficos sugestivos de insuficiência renal incipiente \${eR.afeccaoLado}.\`;
    } else if(eR.sit==='aguda'){
      if(eR.afeccaoLado==='bilateral') preRins = \`Rins em topografia habitual, com dimensões aumentadas e contornos regulares.\`;
      else preRins = \`Rins em topografia habitual, com contornos regulares. Rim \${eR.afeccaoLado.replace('à ','')} encontra-se com dimensões aumentadas, enquanto que o rim contralateral conserva dimensões.\`;
      opRins = \`Achados ecográficos compatíveis com nefropatia parenquimatosa aguda \${eR.afeccaoLado}.\`;
    } else if(eR.sit==='cronica'){
      if(eR.afeccaoLado==='bilateral') preRins = \`Rins em topografia habitual, com dimensões reduzidas e contornos regulares.\`;
      else preRins = \`Rins em topografia habitual, com contornos regulares. Rim \${eR.afeccaoLado.replace('à ','')} encontra-se com dimensões reduzidas, enquanto que o rim contralateral conserva dimensões.\`;
      opRins = \`Achados ecográficos compatíveis com nefropatia crônica \${eR.afeccaoLado}.\`;
    }

    // Parenquima
    let parenquima = '';
    if(eR.sit==='drpad') parenquima = ''; // já coberto
    else if(eR.sit==='insuf') parenquima = ' Parênquima com espessura discretamente reduzida e diferenciação corticomedular mantida.';
    else if(eR.sit==='aguda') parenquima = \` Parênquima com espessura preservada e diferenciação corticomedular mantida. Observa-se aumento difuso da ecogenicidade cortical renal \${eR.afeccaoLado}.\`;
    else if(eR.sit==='cronica'){
      if(eR.afeccaoLado==='bilateral') parenquima = ' Parênquima com espessura reduzida e perda da diferenciação corticomedular. Observa-se aumento difuso da ecogenicidade cortical renal bilateralmente.';
      else parenquima = \` Parênquima com espessura reduzida e perda da diferenciação corticomedular, associado a aumento difuso da ecogenicidade cortical renal \${eR.afeccaoLado}.\`;
    }
    else parenquima = ' Parênquima com espessura preservada e diferenciação corticomedular mantida.';
    
    fraseRins = preRins + parenquima;
    
    // Dimensões opcionais
    const cvR = (l,ap,t) => l&&ap&&t ? (parseFloat(l)*parseFloat(ap)*parseFloat(t)*0.52).toFixed(1).replace('.',',') : null;
    if(!eR.nefrecDir){
      const volRD = cvR(eR.dimRD_L, eR.dimRD_AP, eR.dimRD_T);
      if(volRD) fraseRins += \` Rim direito mede \${eR.dimRD_L} x \${eR.dimRD_AP} x \${eR.dimRD_T} cm, com volume de \${volRD} cm³.\`;
      if(eR.espRD) fraseRins += \` Espessura do parênquima à direita: \${eR.espRD} cm.\`;
    }
    if(!eR.nefrecEsq){
      const volRE = cvR(eR.dimRE_L, eR.dimRE_AP, eR.dimRE_T);
      if(volRE) fraseRins += \` Rim esquerdo mede \${eR.dimRE_L} x \${eR.dimRE_AP} x \${eR.dimRE_T} cm, com volume de \${volRE} cm³.\`;
      if(eR.espRE) fraseRins += \` Espessura do parênquima à esquerda: \${eR.espRE} cm.\`;
    }

    // Lesões
    let calculosObstrutivosDir = false;
    let calculosObstrutivosEsq = false;
    if(eR.lesoes.length > 0){
      const descCalc = []; const descCisto = []; const descNod = [];
      eR.lesoes.forEach(l => {
        const ladoTxt = l.lado==='bilateral'?'bilateralmente':\`à \${l.lado}\`;
        if(l.tipo==='calculo'){
          const obs = ['junção ureteropiélica','junção ureterovesical','ureter proximal','ureter médio','ureter distal'].includes(l.loc);
          if(obs && ['direito','bilateral'].includes(l.lado)) calculosObstrutivosDir = true;
          if(obs && ['esquerdo','bilateral'].includes(l.lado)) calculosObstrutivosEsq = true;
          
          if(l.agrup==='unico'){
            descCalc.push(\`cálculo \${obs?'obstrutivo':'não obstrutivo'} em \${l.loc} \${ladoTxt}\${medStrAprox(l)?', '+medStrAprox(l):''}\`);
            opinioes.push(obs ? \`Cálculo obstrutivo em \${l.loc} \${ladoTxt}.\` : \`Nefrolitíase não obstrutiva \${ladoTxt}.\`);
          } else {
            descCalc.push(\`múltiplos cálculos\${obs?'':' não obstrutivos'}, \${obs?'sendo o maior obstrutivo':'o maior localizado'} em \${l.loc} \${ladoTxt}\${medStrAprox(l)?', '+medStrAprox(l):''}\`);
            opinioes.push(obs ? \`Múltiplos cálculos, o maior obstrutivo em \${l.loc} \${ladoTxt}.\` : \`Nefrolitíase não obstrutiva \${ladoTxt}.\`);
          }
        }
        else if(l.tipo==='cisto'){
          if(l.agrup==='unico'){
            descCisto.push(\`cisto \${l.comp} em \${l.loc} \${l.topo} \${ladoTxt}\${medStrAprox(l)?', '+medStrAprox(l):''}\`);
            opinioes.push(\`Cisto renal \${ladoTxt}.\`);
          } else {
            descCisto.push(\`múltiplos cistos \${l.comp}s, o maior localizado em \${l.loc} \${l.topo} \${ladoTxt}\${medStrAprox(l)?', '+medStrAprox(l):''}\`);
            opinioes.push(\`Cistos renais \${ladoTxt}.\`);
          }
        }
        else if(l.tipo==='nodulo'){
          if(l.agrup==='unico'){
            descNod.push(\`nódulo sólido, \${l.eco}, em \${l.loc} \${ladoTxt}\${medStrAprox(l)?', '+medStrAprox(l):''}\`);
            opinioes.push(\`Nódulo renal sólido em rim \${l.lado==='bilateral'?'bilateral':l.lado}. Sugere-se, a critério clínico, prosseguimento da investigação com tomografia computadorizada ou ressonância magnética com contraste.\`);
          } else {
            descNod.push(\`múltiplos nódulos sólidos, o maior \${l.eco} em \${l.loc} \${ladoTxt}\${medStrAprox(l)?', '+medStrAprox(l):''}\`);
            opinioes.push(\`Múltiplos nódulos renais sólidos \${ladoTxt}. Sugere-se, a critério clínico, prosseguimento da investigação.\`);
          }
        }
      });
      const tds = [...descCalc, ...descCisto, ...descNod];
      if(tds.length>0) fraseRins += ' Destaca-se: ' + tds.join('; ') + '.';
    } else {
      fraseRins += ' Não há evidências de cálculos calicinais.';
    }

    // Hidronefrose
    let strHidro = '';
    const hD = eR.hidroDir, hE = eR.hidroEsq;
    const uD = eR.ureterDir ? ' associado a dilatação do ureter à direita' : '';
    const uE = eR.ureterEsq ? ' associado a dilatação do ureter à esquerda' : '';
    
    if(!eR.nefrecDir && !eR.nefrecEsq){
      if(hD==='ausente' && hE==='ausente') strHidro = ' Ausência de hidronefrose.';
      else if(hD===hE) {
        strHidro = \` \${hD.charAt(0).toUpperCase()+hD.slice(1)} dilatação do sistema coletor bilateralmente, sem caracterização de fator obstrutivo ao presente método\${eR.ureterDir||eR.ureterEsq?', associado a dilatação ureteral':''}.\`;
        if(!calculosObstrutivosDir && !calculosObstrutivosEsq) opinioes.push(\`Dilatação do sistema coletor bilateralmente.\`);
      }
      else if(hD!=='ausente' && hE!=='ausente'){
        strHidro = \` Dilatação do sistema coletor bilateralmente, sem caracterização de fator obstrutivo ao presente método, sendo \${hD} à direita e \${hE} à esquerda\${eR.ureterDir||eR.ureterEsq?', associado a dilatação ureteral':''}.\`;
        if(!calculosObstrutivosDir && !calculosObstrutivosEsq) opinioes.push(\`Dilatação do sistema coletor bilateralmente.\`);
      }
      else if(hD!=='ausente'){
        strHidro = \` \${hD.charAt(0).toUpperCase()+hD.slice(1)} dilatação do sistema coletor à direita, sem caracterização de fator obstrutivo ao presente método\${uD}.\`;
        if(!calculosObstrutivosDir) opinioes.push(\`Dilatação do sistema coletor à direita.\`);
        strHidro += ' Ausência de hidronefrose à esquerda.';
      }
      else if(hE!=='ausente'){
        strHidro = \` \${hE.charAt(0).toUpperCase()+hE.slice(1)} dilatação do sistema coletor à esquerda, sem caracterização de fator obstrutivo ao presente método\${uE}.\`;
        if(!calculosObstrutivosEsq) opinioes.push(\`Dilatação do sistema coletor à esquerda.\`);
        strHidro += ' Ausência de hidronefrose à direita.';
      }
    } else if(eR.nefrecEsq && !eR.nefrecDir){
      if(hD==='ausente') strHidro = ' Ausência de hidronefrose à direita.';
      else {
        strHidro = \` \${hD.charAt(0).toUpperCase()+hD.slice(1)} dilatação do sistema coletor à direita, sem caracterização de fator obstrutivo ao presente método\${uD}.\`;
        if(!calculosObstrutivosDir) opinioes.push(\`Dilatação do sistema coletor à direita.\`);
      }
    } else if(eR.nefrecDir && !eR.nefrecEsq){
      if(hE==='ausente') strHidro = ' Ausência de hidronefrose à esquerda.';
      else {
        strHidro = \` \${hE.charAt(0).toUpperCase()+hE.slice(1)} dilatação do sistema coletor à esquerda, sem caracterização de fator obstrutivo ao presente método\${uE}.\`;
        if(!calculosObstrutivosEsq) opinioes.push(\`Dilatação do sistema coletor à esquerda.\`);
      }
    }
    fraseRins += strHidro;
  }
  
  if(opRins) opinioes.unshift(opRins); // coloca no topo das opiniões

  // BEXIGA
  let fraseBexiga = '';
  if(eB.sit==='vazia'){
    fraseBexiga = 'Bexiga vazia.';
    opinioes.push('Bexiga com repleção insuficiente.');
  } else {
    const distStr = eB.sit==='habitual'?'distensão adequada':eB.sit==='parcial'?'distensão parcial':'distensão adequada';
    let parStr = 'parede com espessura normal';
    if(eB.sit==='espessada'){
      parStr = \`paredes com espessura aumentada\${eB.espParede?', medindo até '+eB.espParede+' cm':''}\`;
      if(eB.diverticulos) {
        parStr += '. Presença de divertículos parietais';
        opinioes.push('Espessamento parietal vesical difuso (associado a divertículos).');
      } else {
        opinioes.push('Espessamento parietal vesical difuso.');
      }
    }
    
    let contBase = 'conteúdo homogêneo';
    let destConteudo = [];
    if(eB.conteudoDebris){
      contBase = 'ecos em suspensão';
      opinioes.push('Bexiga contendo debris em seu interior.');
    }
    if(eB.conteudoCoagulo){
      const ms = medStr({m1:eB.coaguloX,m2:eB.coaguloY,m3:eB.coaguloZ});
      destConteudo.push(\`coágulo móvel \${ms}\`);
      opinioes.push('Coágulo vesical.');
    }
    if(eB.conteudoCalculo){
      const ms = medStr({m1:eB.calculoX,m2:eB.calculoY,m3:eB.calculoZ});
      destConteudo.push(\`cálculo \${ms}\`);
      opinioes.push('Litíase vesical.');
    }
    if(eB.conteudoLesao){
      const ms = medStr({m1:eB.lesaoX,m2:eB.lesaoY,m3:eB.lesaoZ});
      const fluxo = eB.lesaoFluxo ? 'caracterizando fluxo vascular interno' : 'não caracterizando fluxo vascular interno';
      destConteudo.push(\`lesão exofítica de contornos irregulares localizada \${eB.lesaoLoc} \${ms}, \${fluxo} ao estudo complementar com Doppler\`);
      opinioes.push('Lesão vesical de provável natureza neoplásica. Sugere-se, a critério clínico, complementação diagnóstica com cistoscopia.');
    }
    if(eB.conteudoBalao){
      destConteudo.push('balonete de sonda vesical');
      opinioes.push('Bexiga contendo balonete de sonda em seu interior.');
    }

    fraseBexiga = \`Bexiga com \${distStr}, apresentando contornos regulares, \${parStr} e \${contBase}.\`;
    if(destConteudo.length>0) fraseBexiga += ' Destaca-se em seu interior: ' + destConteudo.join('; ') + '.';

    // Jatos
    if(eB.jatos==='simetricos') fraseBexiga += ' Jatos ureterais presentes e simétricos.';
    else if(eB.jatos==='reduzido_d') { fraseBexiga += ' Jatos ureterais presentes, assimétricos, reduzidos à direita.'; opinioes.push('Jatos ureterais reduzidos à direita.'); }
    else if(eB.jatos==='reduzido_e') { fraseBexiga += ' Jatos ureterais presentes, assimétricos, reduzidos à esquerda.'; opinioes.push('Jatos ureterais reduzidos à esquerda.'); }
    else if(eB.jatos==='nao_caracterizados') { fraseBexiga += ' Jatos ureterais não caracterizados.'; }
  }

  // VOLUMES
  const cv = (l,ap,t) => l&&ap&&t ? Math.round(parseFloat(l)*parseFloat(ap)*parseFloat(t)*0.52*1000) : 0;
  const vPre = cv(eV.preL,eV.preAP,eV.preT);
  const vPos = cv(eV.posL,eV.posAP,eV.posT);
  let fraseVol = '';

  if(vPre>0) fraseVol += \`Volume vesical pré-miccional estimado em \${vPre} mL. \`;
  
  if(eV.posL){
    if(vPos===0) fraseVol += 'Resíduo vesical pós-miccional ausente.';
    else if(vPos<=30) fraseVol += 'Resíduo vesical pós-miccional desprezível.';
    else if(vPos>30 && vPos<=80) { fraseVol += \`Resíduo vesical pós-miccional pequeno (\${vPos} mL).\`; opinioes.push('Resíduo pós-miccional pequeno.'); }
    else if(vPos>80 && vPos<=150) { fraseVol += \`Resíduo vesical pós-miccional moderado (\${vPos} mL).\`; opinioes.push('Resíduo pós-miccional moderado.'); }
    else if(vPos>150 && vPos<=300) { fraseVol += \`Resíduo vesical pós-miccional acentuado (\${vPos} mL).\`; opinioes.push('Resíduo pós-miccional acentuado.'); }
    else if(vPos>300) { fraseVol += \`Resíduo vesical pós-miccional muito acentuado (\${vPos} mL).\`; opinioes.push('Resíduo pós-miccional muito acentuado.'); }
  }

  // ADICIONAIS
  let adic = eA.texto.trim() ? \`<div class="doc-p">Achados adicionais: \${eA.texto}</div>\` : '';

  // CONCLUSÃO FINAL
  let opFinal = '';
  if(opinioes.length===0){
    opFinal = 'Estudo ecográfico sem evidentes anormalidades apreciáveis ao método.';
  } else {
    // Unique
    opinioes = [...new Set(opinioes)];
    opFinal = opinioes.join('<br>') + '<br>Demais estruturas sem evidentes anormalidades apreciáveis ao método.';
  }

  document.getElementById('laudo-doc').innerHTML=\`
    <div class="doc-titulo">ULTRASSONOGRAFIA DO APARELHO URINÁRIO</div>
    <div class="doc-secao">
      <span class="doc-label">TÉCNICA:</span>
      <div class="doc-p">Exame realizado em aparelho dinâmico com transdutor convexo por via abdominal.</div>
    </div>
    <div class="doc-secao">
      <span class="doc-label">ANÁLISE:</span>
      <div class="doc-p">\${fraseRins}</div>
      <div class="doc-p">\${fraseBexiga}</div>
      \${fraseVol ? \`<div class="doc-p">\${fraseVol}</div>\` : ''}
      \${adic}
    </div>
    <div class="doc-secao">
      <span class="doc-label">OPINIÃO DO RELATÓRIO:</span>
      <div class="doc-p">\${opFinal}</div>
    </div>\`;
}

function toggleDark(){
  const isDark = document.body.classList.toggle('dark');
  const btn = document.getElementById('btn-dark-toggle');
  if(isDark) btn.innerHTML='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13.5 8.5A5.5 5.5 0 0 1 6 3c0-.18.01-.36.03-.53A6 6 0 1 0 13.97 9.5c-.15.01-.31.01-.47 0z"/></svg>Modo claro';
  else btn.innerHTML='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1v1M8 14v1M1 8H2M14 8h1M3.05 3.05l.7.7M12.25 12.25l.7.7M3.05 12.95l.7-.7M12.25 3.75l.7-.7M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>Modo escuro';
  localStorage.setItem('darkMode', isDark ? '1' : '0');
}
(function(){ if(localStorage.getItem('darkMode')==='1') toggleDark(); })();

function copiar() {
  const el = document.getElementById('laudo-doc');
  const range = document.createRange();
  range.selectNodeContents(el);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  try {
    document.execCommand('copy');
    alert('Laudo copiado para a Ã¡rea de transferÃªncia!');
  } catch (err) {
    alert('Use Ctrl+A e Ctrl+C no texto do laudo.');
  }
  selection.removeAllRanges();
}
function imprimir(){ 
  const h=document.getElementById('laudo-doc').innerHTML; 
  const w=window.open('','_blank'); 
  w.document.write(\`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Helvetica,Arial,sans-serif;font-size:10pt;padding:32px;color:#111;line-height:1.65;}.doc-titulo{text-align:center;font-weight:700;text-transform:uppercase;margin-bottom:16px;}.doc-label{font-weight:700;}.doc-p{margin-bottom:8px;}.doc-secao{margin-bottom:14px;}*{color:#111 !important;}.laudo-doc:focus { outline: none; }
</style></head><body>\${h}</body></html>\`); 
  w.document.close(); 
  w.print(); 
}
function reiniciar(){
  estado.rins = { sit: 'habitual', ectopicoLado: 'direito', ectopicoLoc: 'fossa ilíaca direita', nefrecDir: false, nefrecEsq: false, afeccaoLado: 'bilateral', dimRD_L: '', dimRD_AP: '', dimRD_T: '', espRD: '', dimRE_L: '', dimRE_AP: '', dimRE_T: '', espRE: '', hidroDir: 'ausente', hidroEsq: 'ausente', ureterDir: false, ureterEsq: false, lesoes: [] };
  estado.bexiga = { sit: 'habitual', espParede: '', diverticulos: false, conteudoDebris: false, conteudoCoagulo: false, coaguloX: '', coaguloY: '', coaguloZ: '', conteudoCalculo: false, calculoX: '', calculoY: '', calculoZ: '', conteudoLesao: false, lesaoLoc: 'assoalho vesical', lesaoX: '', lesaoY: '', lesaoZ: '', lesaoFluxo: false, conteudoBalao: false, jatos: 'nao_citar' };
  estado.volume = { preL: '', preAP: '', preT: '', posL: '', posAP: '', posT: '' };
  estado.adicionais = { texto: '' };
  showSection('rins');
}

showSection('rins');
