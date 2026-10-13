$backupDir = 'c:\Users\thiag\Downloads\obs\_backup_antes_layout\acrescente'
$targetDir = 'c:\Users\thiag\Downloads\obs\acrescente'
$refPath = 'c:\Users\thiag\Downloads\obs\_referencia_layout.html.html'

$files = Get-ChildItem -Path $targetDir -Filter '*.html' | Select-Object -ExpandProperty Name

$refContent = [System.IO.File]::ReadAllText($refPath, [System.Text.Encoding]::UTF8)
$refStyle = ''
if ($refContent -match '(?s)<style>(.*?)</style>') { $refStyle = $matches[1] }

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

    $customCss = "`r`n/* --- CUSTOM COMPONENTS RESTORED --- */`r`n"
    $hasCustom = $false
    
    $ruleRegex = [regex]'([^{}]+)\{([^{}]+)\}'
    $rules = $ruleRegex.Matches($bkpStyle)
    
    foreach ($rm in $rules) {
        $selOriginal = $rm.Groups[1].Value.Trim()
        if ($selOriginal.StartsWith('@') -or $selOriginal.StartsWith(':root')) { continue }
        if ($selOriginal -match 'laudo-doc' -or $selOriginal -match 'toast-notification') { continue }
        
        $selNormalized = $selOriginal -replace '\s+', ' '
        
        if ($refSelectors -notcontains $selNormalized -and -not $refStyle.Contains($selNormalized)) {
            # Update focus rings to be harmonious
            $innerCss = $rm.Groups[2].Value -replace 'rgba\(\d+,\d+,\d+,\.08\)', 'var(--focus-ring)'
            $customCss += $selOriginal + " {" + $innerCss + "}`r`n"
            $hasCustom = $true
        }
    }

    if ($hasCustom) {
        $tgtContent = [System.IO.File]::ReadAllText($tgtPath, [System.Text.Encoding]::UTF8)
        
        # Avoid double-injecting if we already did it for some files
        if ($tgtContent -match 'CUSTOM COMPONENTS RESTORED') { continue }
        
        $regexEndStyle = [regex]'(?i)(</style>)'
        $newContent = $regexEndStyle.Replace($tgtContent, $customCss + "`n`$1", 1)
        
        [System.IO.File]::WriteAllText($tgtPath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Restored missing components in $f"
    }
}
