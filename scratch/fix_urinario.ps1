# Fix aparelho_urinario_elite.html
$file = 'c:\Users\thiag\Downloads\obs\acrescente\aparelho_urinario_elite.html'
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Check the actual bytes around the problematic area
$idx = $content.IndexOf('OPINI')
Write-Host "Found OPINI at index: $idx"
Write-Host "Context around it (40 chars before, 120 after):"
$start = [Math]::Max(0, $idx - 40)
$len = [Math]::Min(160, $content.Length - $start)
$snippet = $content.Substring($start, $len)
Write-Host "---"
Write-Host $snippet
Write-Host "---"

# Check bytes around ${opFinal}
$idx2 = $content.IndexOf('opFinal')
Write-Host ""
Write-Host "Found opFinal at index: $idx2"
if ($idx2 -gt 0) {
    $s2 = [Math]::Max(0, $idx2 - 10)
    $l2 = [Math]::Min(40, $content.Length - $s2)
    $bytes2 = $bytes[$s2..($s2+$l2-1)]
    Write-Host "Hex bytes around opFinal:"
    Write-Host ([BitConverter]::ToString($bytes2))
}

# Also check around the backtick that closes the template literal
$idx3 = $content.IndexOf('</div>`' + ';')
Write-Host ""
Write-Host "Found closing backtick-semicolon at index: $idx3"
if ($idx3 -gt 0) {
    $s3 = [Math]::Max(0, $idx3 - 5)
    $l3 = [Math]::Min(20, $content.Length - $s3)
    $bytes3 = $bytes[$s3..($s3+$l3-1)]
    Write-Host "Hex bytes around closing:"
    Write-Host ([BitConverter]::ToString($bytes3))
}

# Check how the WORKING template literals look (e.g. ${fraseRins})
$idx4 = $content.IndexOf('fraseRins')
Write-Host ""
Write-Host "Found fraseRins at index: $idx4"
if ($idx4 -gt 0) {
    $s4 = [Math]::Max(0, $idx4 - 5)
    $l4 = [Math]::Min(30, $content.Length - $s4)
    $bytes4 = $bytes[$s4..($s4+$l4-1)]
    Write-Host "Hex bytes around fraseRins:"
    Write-Host ([BitConverter]::ToString($bytes4))
}
