# Use paths relative to the script location
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path $scriptPath -Parent
$baseDir = Split-Path $scriptDir -Parent

$htmlPath = Join-Path $baseDir "laudo-mascara.html"

if (-not (Test-Path $htmlPath)) { throw "Could not find laudo-mascara.html at $htmlPath" }

$content = Get-Content $htmlPath -Raw

# Targeted fixes for the 'nome' fields
$content = $content -replace '"nome":"TÃ³rax"', '"nome":"Tórax"'

# Fix common broken character sequences
$content = $content -replace "BSTTRICA", "BSTÉTRICA"
$content = $content -replace "BSTTRICO", "BSTÉTRICO"

# Save as UTF-8
[System.IO.File]::WriteAllText($htmlPath, $content, [System.Text.Encoding]::UTF8)

Write-Host "Encoding fixes applied."
