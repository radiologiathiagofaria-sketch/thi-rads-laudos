$targetDir = 'c:\Users\thiag\Downloads\obs\acrescente'
$backupDir = 'c:\Users\thiag\Downloads\obs\_backup_antes_layout\acrescente'
$files = Get-ChildItem -Path "$targetDir\*.html"
$allGood = $true

foreach ($file in $files) {
    $current = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $backup = [System.IO.File]::ReadAllText("$backupDir\$($file.Name)", [System.Text.Encoding]::UTF8)
    
    # Strip all style blocks from both
    $regex = [regex]'(?s)<style>.*?</style>'
    $currentNoStyle = $regex.Replace($current, '<STYLE_STRIPPED>', 0)
    $backupNoStyle  = $regex.Replace($backup,  '<STYLE_STRIPPED>', 0)
    
    if ($currentNoStyle -ne $backupNoStyle) {
        # Find first difference position
        $minLen = [Math]::Min($currentNoStyle.Length, $backupNoStyle.Length)
        $diffPos = -1
        for ($i = 0; $i -lt $minLen; $i++) {
            if ($currentNoStyle[$i] -ne $backupNoStyle[$i]) {
                $diffPos = $i
                break
            }
        }
        if ($diffPos -eq -1) { $diffPos = $minLen }
        $context = $currentNoStyle.Substring([Math]::Max(0,$diffPos-100), [Math]::Min(200, $currentNoStyle.Length - [Math]::Max(0,$diffPos-100)))
        Write-Host "MISMATCH in $($file.Name) at pos $diffPos"
        Write-Host "  Context: $($context -replace '\r\n',' ')"
        $allGood = $false
    }
}
if ($allGood) {
    Write-Host "All files: non-CSS content matches backup perfectly."
}
