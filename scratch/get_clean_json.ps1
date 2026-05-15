# Use paths relative to the script location
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path $scriptPath -Parent
$baseDir = Split-Path $scriptDir -Parent

$jsonPath = Join-Path $baseDir "OB SANTA\extracted.json"

if (-not (Test-Path $jsonPath)) {
    Write-Error "Could not find extracted.json at $jsonPath"
    return
}

$data = Get-Content $jsonPath -Raw | ConvertFrom-Json

$output = ""
foreach ($item in $data) {
    if ($item.nome -eq "US OBSTETRICO INICIAL TRANSVAGINAL (1)") {
        $item.nome = "US OBSTETRICO INICIAL TRANSVAGINAL"
    }
    # Create a single line JSON for each object
    $line = $item | ConvertTo-Json -Compress
    $output += "    " + $line + ",`r`n"
}

Write-Output $output
