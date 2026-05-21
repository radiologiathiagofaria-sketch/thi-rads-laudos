# Check how the working interpolations look
$file = 'c:\Users\thiag\Downloads\obs\acrescente\aparelho_urinario_elite.html'
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Check ${fraseRins} bytes
$idx = $content.IndexOf('fraseRins}')
if ($idx -gt 0) {
    $s = $idx - 5
    $l = 20
    $b = $bytes[$s..($s+$l-1)]
    Write-Host "fraseRins interpolation bytes:"
    Write-Host "  Hex: $([BitConverter]::ToString($b))"
    Write-Host "  Text: $($content.Substring($s, $l))"
}

# Check ${fraseBexiga} bytes
$idx2 = $content.IndexOf('fraseBexiga}')
if ($idx2 -gt 0) {
    # look in the template literal area (after line 679)
    $idx2 = $content.IndexOf('fraseBexiga}', 47000)
    if ($idx2 -gt 0) {
        $s = $idx2 - 5
        $l = 22
        $b = $bytes[$s..($s+$l-1)]
        Write-Host "fraseBexiga interpolation bytes:"
        Write-Host "  Hex: $([BitConverter]::ToString($b))"
        Write-Host "  Text: $($content.Substring($s, $l))"
    }
}

# Check the opFinal in the template literal
$idx3 = $content.IndexOf('opFinal}', 47000)
if ($idx3 -gt 0) {
    $s = $idx3 - 5
    $l = 18
    $b = $bytes[$s..($s+$l-1)]
    Write-Host "opFinal interpolation bytes:"
    Write-Host "  Hex: $([BitConverter]::ToString($b))"
    Write-Host "  Text: $($content.Substring($s, $l))"
}

# Check innerHTML= opening backtick
$idx4 = $content.IndexOf('innerHTML=')
if ($idx4 -gt 0) {
    $s = $idx4 + 9
    $l = 5
    $b = $bytes[$s..($s+$l-1)]
    Write-Host ""
    Write-Host "innerHTML= opening:"
    Write-Host "  Hex: $([BitConverter]::ToString($b))"
    Write-Host "  Text: '$($content.Substring($s, $l))'"
}

# Show the closing area
$idx5 = $content.IndexOf('opFinal}', 47000)
if ($idx5 -gt 0) {
    $s = $idx5 + 8
    $l = 30
    $b = $bytes[$s..($s+$l-1)]
    Write-Host ""
    Write-Host "After opFinal}:"
    Write-Host "  Hex: $([BitConverter]::ToString($b))"
    Write-Host "  Text: '$($content.Substring($s, $l))'"
}
