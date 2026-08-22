$pathJoelho = 'acrescente\ultrassonografia_joelho_elite.html'
$pathPunho = 'acrescente\ultrassonografia_punho.html'
$pathAbdome = 'acrescente\abdome_superior_elite.html'

$abdomeText = [System.IO.File]::ReadAllText((Resolve-Path $pathAbdome).Path)
$joelhoText = [System.IO.File]::ReadAllText((Resolve-Path $pathJoelho).Path)
$punhoText = [System.IO.File]::ReadAllText((Resolve-Path $pathPunho).Path)

$match = [regex]::Match($abdomeText, '(?s)function copiar\(\) \{.*?// --- FIM: FUN[^ ]* DE C[^ ]*PIA RICH-TEXT ---')
if ($match.Success) {
    $newCode = $match.Value
    $patternOld = '(?s)function copiar\(\) \{.*?showToast\(''Falha ao copiar\. Use Ctrl\+A e Ctrl\+C no texto do laudo\.''\);\s*\}\s*\}'
    $joelhoText = [regex]::Replace($joelhoText, $patternOld, $newCode)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Resolve-Path $pathJoelho).Path, $joelhoText, $utf8NoBom)
    
    $punhoText = [regex]::Replace($punhoText, $patternOld, $newCode)
    [System.IO.File]::WriteAllText((Resolve-Path $pathPunho).Path, $punhoText, $utf8NoBom)
    Write-Host "Success"
} else {
    Write-Host "Failed to find match"
}
