$files = @('carotidas.html', 'tvp_membros_inferiores (2).html', 'tireoide elite.html', 'cervical_elite.html', 'cervical_linfonodos_elite.html', 'thirads-venoso-corrigido.html')
$backupDir = 'c:\Users\thiag\Downloads\obs\_backup_antes_layout\acrescente'
$targetDir = 'c:\Users\thiag\Downloads\obs\acrescente'
$refPath = 'c:\Users\thiag\Downloads\obs\_referencia_layout.html.html'

$refContent = [System.IO.File]::ReadAllText($refPath, [System.Text.Encoding]::UTF8)
$refStyle = ''
if ($refContent -match '(?s)<style>(.*?)</style>') { $refStyle = $matches[1] }

# Build an array of reference selectors
$refSelectors = @()
$refMatches = [regex]::Matches($refStyle, '([^{}]+)\{')
foreach ($m in $refMatches) {
    $sel = $m.Groups[1].Value.Trim()
    if (-not $sel.StartsWith('@') -and -not $sel.StartsWith(':root')) {
        $selNormalized = $sel -replace '\s+', ' '
        $refSelectors += $selNormalized
    }
}

foreach ($f in $files) {
    $bkpPath = Join-Path $backupDir $f
    $tgtPath = Join-Path $targetDir $f
    if (-not (Test-Path $bkpPath) -or -not (Test-Path $tgtPath)) { continue }

    $bkpContent = [System.IO.File]::ReadAllText($bkpPath, [System.Text.Encoding]::UTF8)
    $bkpStyle = ''
    if ($bkpContent -match '(?s)<style>(.*?)</style>') { $bkpStyle = $matches[1] }

    $customCss = "`r`n/* --- CUSTOM COMPONENTS --- */`r`n"
    
    $ruleRegex = [regex]'([^{}]+)\{([^{}]+)\}'
    $rules = $ruleRegex.Matches($bkpStyle)
    
    foreach ($rm in $rules) {
        $selOriginal = $rm.Groups[1].Value.Trim()
        if ($selOriginal.StartsWith('@') -or $selOriginal.StartsWith(':root')) { continue }
        
        $selNormalized = $selOriginal -replace '\s+', ' '
        
        # Also exclude base classes that might have been formatted differently
        if ($refSelectors -notcontains $selNormalized -and -not $refStyle.Contains($selNormalized)) {
            $customCss += $selOriginal + " {" + $rm.Groups[2].Value + "}`r`n"
        }
    }

    $tgtContent = [System.IO.File]::ReadAllText($tgtPath, [System.Text.Encoding]::UTF8)
    
    $regexEndStyle = [regex]'(?i)(</style>)'
    # Only replace the FIRST </style> tag in the file
    $newContent = $regexEndStyle.Replace($tgtContent, $customCss + "`n`$1", 1)
    
    [System.IO.File]::WriteAllText($tgtPath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed $f"
}
