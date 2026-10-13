$targetDir = 'c:\Users\thiag\Downloads\obs\acrescente'
$backupDir = 'c:\Users\thiag\Downloads\obs\_backup_antes_layout\acrescente'
$files = Get-ChildItem -Path $targetDir -Filter '*.html'
$allClean = $true

foreach ($file in $files) {
    $backupPath = Join-Path -Path $backupDir -ChildPath $file.Name
    $origContent = [System.IO.File]::ReadAllText($backupPath, [System.Text.Encoding]::UTF8)
    $newContent = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    $regex = [regex]'(?s)<style>.*?</style>'
    $origNoStyle = $regex.Replace($origContent, '', 1)
    $newNoStyle = $regex.Replace($newContent, '', 1)
    
    if ($origNoStyle -ne $newNoStyle) {
        Write-Host "File changed outside <style>: $($file.Name)"
        $allClean = $false
    }
}

if ($allClean) {
    Write-Host "All files passed verification. Only <style> blocks were changed."
}
