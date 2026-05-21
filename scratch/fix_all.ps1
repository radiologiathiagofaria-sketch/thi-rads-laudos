$files = Get-ChildItem -Path "c:\Users\thiag\Downloads\obs\acrescente\*.html"
foreach ($file in $files) {
    # Read as UTF8
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Update laudo-doc to be contenteditable
    # First, undo any double contenteditable just in case
    $content = $content -replace 'id="laudo-doc" contenteditable="true"', 'id="laudo-doc"'
    $content = $content -replace 'id="laudo-doc"\s*>', 'id="laudo-doc" contenteditable="true">'
    
    # Update function copiar
    $pattern = '(?s)function\s+copiar\s*\(\)\s*\{[^\}]*\}'
    $replacement = "function copiar() {`r`n  const el = document.getElementById('laudo-doc');`r`n  const range = document.createRange();`r`n  range.selectNodeContents(el);`r`n  const selection = window.getSelection();`r`n  selection.removeAllRanges();`r`n  selection.addRange(range);`r`n  try {`r`n    document.execCommand('copy');`r`n    alert('Laudo copiado para a área de transferência!');`r`n  } catch (err) {`r`n    alert('Use Ctrl+A e Ctrl+C no texto do laudo.');`r`n  }`r`n  selection.removeAllRanges();`r`n}"
    
    $content = [Text.RegularExpressions.Regex]::Replace($content, $pattern, $replacement)
    
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
}
Write-Host "Done!"
