# Fix aparelho_urinario_elite.html - restore escaped template literals
$file = 'c:\Users\thiag\Downloads\obs\acrescente\aparelho_urinario_elite.html'
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fix 1: The opFinal interpolation in updateLaudo template
# Change: <div class="doc-p">${opFinal}</div>
# To:     <div class="doc-p">\${opFinal}</div>
$content = $content.Replace(
    '<div class="doc-p">${opFinal}</div>' + "`n" + '    </div>' + '`;',
    '<div class="doc-p">\${opFinal}</div>' + "`n" + '    </div>\`;'
)

# Fix 2: The imprimir function template literal
# Change: w.document.write(`<!DOCTYPE...${h}...</html>`);
# To:     w.document.write(\`<!DOCTYPE...\${h}...</html>\`);
$content = $content.Replace(
    "w.document.write(" + '`' + "<!DOCTYPE",
    "w.document.write(\`<!DOCTYPE"
)
$content = $content.Replace(
    '</body></html>' + '`' + ');',
    '</body></html>\`);'
)
$content = $content.Replace(
    '</body>${h}</body>',
    '</body>\${h}</body>'
)
# Actually the pattern is <body>${h}</body>
$content = $content.Replace(
    '<body>${h}</body>',
    '<body>\${h}</body>'
)

# Write back with same encoding (UTF-8 without BOM to match original)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllBytes($file, $utf8NoBom.GetBytes($content))

Write-Host "Fix applied!"

# Verify
$bytes2 = [System.IO.File]::ReadAllBytes($file)
$content2 = [System.Text.Encoding]::UTF8.GetString($bytes2)

$idx = $content2.IndexOf('opFinal}', 47000)
if ($idx -gt 0) {
    $s = $idx - 5
    $b = $bytes2[$s..($s+17)]
    Write-Host "opFinal after fix:"
    Write-Host "  Hex: $([BitConverter]::ToString($b))"
    Write-Host "  Text: $($content2.Substring($s, 18))"
}
