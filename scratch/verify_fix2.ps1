# Verify all fixes in aparelho_urinario_elite.html
$file = 'c:\Users\thiag\Downloads\obs\acrescente\aparelho_urinario_elite.html'
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Check imprimir function area
$idx = $content.IndexOf('function imprimir')
if ($idx -gt 0) {
    $s = $idx
    $l = [Math]::Min(400, $content.Length - $s)
    Write-Host "imprimir function:"
    Write-Host $content.Substring($s, $l)
}

Write-Host ""
Write-Host "=== Checking template literal consistency ==="

# Check opening
$tlStart = $content.IndexOf('innerHTML=')
$b = $bytes[($tlStart+9)..($tlStart+12)]
Write-Host "Template literal opening bytes: $([BitConverter]::ToString($b))"

# Check opFinal  
$opIdx = $content.IndexOf('opFinal}', 47000)
$b2 = $bytes[($opIdx-3)..($opIdx+8)]
Write-Host "opFinal area bytes: $([BitConverter]::ToString($b2))"
Write-Host "opFinal area text: $($content.Substring($opIdx-3, 12))"
