# Use paths relative to the script location
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path $scriptPath -Parent
$baseDir = Split-Path $scriptDir -Parent

$jsonPath = Join-Path $baseDir "OB SANTA\extracted.json"
$htmlPath = Join-Path $baseDir "laudo-mascara.html"

if (-not (Test-Path $jsonPath)) { throw "Could not find extracted.json at $jsonPath" }
if (-not (Test-Path $htmlPath)) { throw "Could not find laudo-mascara.html at $htmlPath" }

$data = Get-Content $jsonPath -Raw | ConvertFrom-Json

$newTemplates = ""
foreach ($item in $data) {
    if ($item.nome -eq "US OBSTETRICO INICIAL TRANSVAGINAL (1)") {
        $item.nome = "US OBSTETRICO INICIAL TRANSVAGINAL"
    }
    # Create a single line JSON for each object
    $line = $item | ConvertTo-Json -Compress
    $newTemplates += "        " + $line + ",`r`n"
}

$html = Get-Content $htmlPath -Raw

# Replace from Tórax to the end of the array
# We find Tórax and its content, then replace everything after it until ];
$toraxPattern = '(\{"nome":"Tórax",.*?\})'
if ($html -match $toraxPattern) {
    $toraxLine = $Matches[1]
    
    # We want to keep everything up to Torax line, then add our new ones, then the closing bracket.
    # But wait, there might be other things after Torax.
    # Let's find the closing ]; of the conteudos array.
    
    $startOfArray = $html.IndexOf("const conteudos = [")
    $endOfArray = $html.IndexOf("];", $startOfArray)
    
    # Actually, let's find the position of "Tórax" and keep everything before it + Torax itself.
    $toraxIndex = $html.IndexOf($toraxLine)
    $afterTorax = $html.Substring($toraxIndex + $toraxLine.Length)
    $bracketIndex = $afterTorax.IndexOf("];")
    
    $prefix = $html.Substring(0, $toraxIndex + $toraxLine.Length)
    $suffix = $afterTorax.Substring($bracketIndex)
    
    $newHtml = $prefix + ",`r`n" + $newTemplates + $suffix
    
    Set-Content $htmlPath $newHtml -Encoding UTF8
    Write-Host "Successfully updated laudo-mascara.html"
} else {
    Write-Error "Could not find Tórax template in HTML"
}
