# Verify all fixes in aparelho_urinario_elite.html
$file = 'c:\Users\thiag\Downloads\obs\acrescente\aparelho_urinario_elite.html'
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Check imprimir function
$idx = $content.IndexOf('function imprimir')
if ($idx -gt 0) {
    $s = $idx
    $l = [Math]::Min(500, $content.Length - $s)
    Write-Host "imprimir function:"
    Write-Host $content.Substring($s, $l)
}

Write-Host ""
Write-Host "=== Checking template literal consistency ==="

# Check all backtick usages in the updateLaudo template
$tlStart = $content.IndexOf('innerHTML=')
Write-Host ""
Write-Host "Template literal start:"
$b = $bytes[($tlStart+9)..($tlStart+12)]
Write-Host "  Hex after innerHTML=: $([BitConverter]::ToString($b))"

# Check opFinal
$opIdx = $content.IndexOf('opFinal}', 47000)
$b2 = $bytes[($opIdx-3)..($opIdx+8)]
Write-Host ""
Write-Host "opFinal area:"  
Write-Host "  Hex: $([BitConverter]::ToString($b2))"
Write-Host "  Text: $($content.Substring($opIdx-3, 12))"

# Check closing
$closeIdx = $content.IndexOf('</div>\`', 47500)
if ($closeIdx -gt 0) {
    Write-Host ""
    Write-Host "Closing backtick found at $closeIdx"
    $b3 = $bytes[$closeIdx..($closeIdx+10)]
    Write-Host "  Hex: $([BitConverter]::ToString($b3))"
    Write-Host "  Text: $($content.Substring($closeIdx, 10))"
} else {
    Write-Host ""
    Write-Host "WARNING: Could not find closing \`"
}
