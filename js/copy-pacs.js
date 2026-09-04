// copy-pacs.js
// Filtro simplificador de cópia para compatibilidade com sistemas PACS

function _copyLaudoRichText(sourceEl, callback) {
  var clone = sourceEl.cloneNode(true);
  
  // Usamos reverse() para processar de dentro para fora (bottom-up)
  var els = Array.from(clone.querySelectorAll('*')).reverse();
  
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    
    if (el.classList.contains('doc-titulo')) {
      el.outerHTML = '<div style="text-align: center;"><b>' + el.innerHTML.toUpperCase() + '</b></div><br><br>';
    } 
    else if (el.classList.contains('doc-secao')) {
      // Como o último parágrafo já vai pular 2 linhas, a seção em si não precisa pular mais nenhuma
      el.outerHTML = '<div>' + el.innerHTML + '</div>';
    } 
    else if (el.classList.contains('doc-p')) {
      // Parágrafos: pulam 2 linhas para dar o espaçamento de "um enter vazio" entre um órgão e outro!
      el.outerHTML = '<span>' + el.innerHTML + '</span><br><br>';
    } 
    else if (el.classList.contains('doc-label')) {
      // Rótulos (TÉCNICA:, ANÁLISE:): apenas 1 quebra de linha para o texto colar nele
      el.outerHTML = '<b>' + el.innerHTML + '</b><br>';
    }
  }

  // Wrapper geral idêntico ao do Obstétrico
  var wrapper = document.createElement('div');
  wrapper.style.fontFamily = 'Helvetica, Arial, sans-serif';
  wrapper.style.fontSize = '10pt';
  wrapper.style.lineHeight = '1.15';
  wrapper.style.color = '#000000';
  wrapper.innerHTML = clone.innerHTML;
  
  var htmlContent = wrapper.outerHTML;
  var plainText = sourceEl.innerText || sourceEl.textContent || '';

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
        if (callback) callback(true);
      }).catch(function() {
        _fallbackCopy(htmlContent, plainText, callback);
      });
    } catch (e) {
      _fallbackCopy(htmlContent, plainText, callback);
    }
  } else {
    _fallbackCopy(htmlContent, plainText, callback);
  }
}

function _fallbackCopy(htmlContent, plainText, callback) {
  var container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.opacity = '0';
  document.body.appendChild(container);
  window.getSelection().removeAllRanges();
  var range = document.createRange();
  range.selectNode(container);
  window.getSelection().addRange(range);
  var ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (err) {}
  document.body.removeChild(container);
  window.getSelection().removeAllRanges();
  if (callback) callback(ok);
}
