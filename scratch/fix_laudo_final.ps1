# Use relative paths from the script's location
$scriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent
$baseDir = Split-Path $scriptDir -Parent

$jsonPath = Join-Path $baseDir "OB SANTA\extracted.json"
$htmlPath = Join-Path $baseDir "laudo-mascara.html"

Write-Host "JSON Path: $jsonPath"
Write-Host "HTML Path: $htmlPath"

if (-not (Test-Path $jsonPath)) { throw "JSON file not found" }
if (-not (Test-Path $htmlPath)) { throw "HTML file not found" }

$data = Get-Content $jsonPath -Raw | ConvertFrom-Json
$jsObjects = ""
foreach ($item in $data) {
    $objJson = $item | ConvertTo-Json -Compress
    $jsObjects += "    " + $objJson + ",`r`n"
}

$html = Get-Content $htmlPath -Raw
$pattern = '(?s)(\{"nome":"Tórax",.*?\},).*?(\];\s+// ========================= FIM DO ARRAY =========================)'
$replacement = "`$1`r`n" + $jsObjects + "`$2"

if ($html -match $pattern) {
    $newHtml = [regex]::Replace($html, $pattern, $replacement)
    Set-Content $htmlPath $newHtml -Encoding UTF8
    Write-Host "File updated successfully."
} else {
    Write-Error "Pattern not found in HTML file"
}
