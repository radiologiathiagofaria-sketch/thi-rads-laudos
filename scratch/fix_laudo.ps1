$htmlPath = '../laudo-mascara.html'
$jsonPath = '../OB SANTA/extracted.json'

if (Test-Path $htmlPath) {
    $html = Get-Content $htmlPath -Raw
    $json = Get-Content $jsonPath -Raw
    $jsonClean = $json.Trim().Substring(1, $json.Trim().Length - 2)

    # Pattern to find the end of the "Tórax" item and everything after it until the end of the array
    # I'll use a simpler pattern just to be sure.
    $pattern = '(?s)(\{"nome":"Tórax",.*?\},).*?(\];\s+// ========================= FIM DO ARRAY =========================)'

    $replacement = "`$1`r`n    " + $jsonClean + "`r`n`$2"

    if ($html -match $pattern) {
        $newHtml = [regex]::Replace($html, $pattern, $replacement)
        Set-Content $htmlPath $newHtml -Encoding UTF8
        Write-Host "File updated successfully."
    } else {
        Write-Error "Could not find the pattern in the HTML file."
    }
} else {
    Write-Error "HTML file not found at $htmlPath"
}
