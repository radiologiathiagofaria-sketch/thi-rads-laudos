# More targeted diagnostic
$file = 'c:\Users\thiag\Downloads\obs\acrescente\aparelho_urinario_elite.html'
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Find ALL occurrences of opFinal
$pattern = 'opFinal'
$idx = 0
$count = 0
while (($idx = $content.IndexOf($pattern, $idx)) -ge 0) {
    $count++
    $s = [Math]::Max(0, $idx - 15)
    $l = [Math]::Min(40, $content.Length - $s)
    $snippet = $content.Substring($s, $l) -replace "`r", '\r' -replace "`n", '\n'
    
    # Get hex of the 3 bytes before opFinal (looking for $ vs \$)
    $beforeStart = [Math]::Max(0, $idx - 3)
    $beforeBytes = $bytes[$beforeStart..($idx-1)]
    $hex = [BitConverter]::ToString($beforeBytes)
    
    Write-Host "Occurrence $count at index $idx"
    Write-Host "  Before bytes (hex): $hex"
    Write-Host "  Context: $snippet"
    Write-Host ""
    $idx++
}

# Find the template literal opening (innerHTML=`)
$tlIdx = $content.IndexOf('innerHTML=')
if ($tlIdx -gt 0) {
    $tlBytes = $bytes[($tlIdx+10)..($tlIdx+12)]
    Write-Host "Template literal open after innerHTML=:"
    Write-Host "  Hex: $([BitConverter]::ToString($tlBytes))"
    Write-Host "  Chars: $($content.Substring($tlIdx+10, 3))"
}

# Find the closing `; after </div>
# Search for the specific pattern near line 695
$closingSearch = $content.IndexOf('</div>`', 47500)
if ($closingSearch -gt 0) {
    $cbytes = $bytes[($closingSearch-2)..($closingSearch+10)]
    Write-Host ""
    Write-Host "Template literal close:"
    Write-Host "  Hex: $([BitConverter]::ToString($cbytes))"
    Write-Host "  Chars: $($content.Substring($closingSearch-2, 12))"
} else {
    # try without backtick escaping
    Write-Host ""
    Write-Host "Did NOT find </div>`` near position 47500"
    # Search broadly
    $ci = 47500
    $searchRange = $content.Substring($ci, [Math]::Min(200, $content.Length - $ci))
    Write-Host "Content at 47500-47700:"
    Write-Host $searchRange
}
