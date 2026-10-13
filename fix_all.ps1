$targetDir = 'c:\Users\thiag\Downloads\obs\acrescente'
$backupDir = 'c:\Users\thiag\Downloads\obs\_backup_antes_layout\acrescente'

# Restore files from backup
Copy-Item -Path "$backupDir\*.html" -Destination $targetDir -Force
Write-Host "Restored HTML files from backup."

# Extract reference CSS
$refPath = 'c:\Users\thiag\Downloads\obs\_referencia_layout.html.html'
$refContent = [System.IO.File]::ReadAllText($refPath, [System.Text.Encoding]::UTF8)

if ($refContent -match '(?s)<style>(.*?)</style>') {
    $refStyle = $matches[1]
} else {
    Write-Host "Style block not found in reference."
    exit
}

# Toast CSS
$toastCss = @"
.toast-notification{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(12px);background:var(--text);color:var(--white);font-size:12.5px;font-weight:500;padding:10px 18px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.18);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;z-index:999;}
.toast-notification.show{opacity:1;transform:translateX(-50%) translateY(0);}
body.dark .toast-notification{background:#3a4155;color:#e2e6f0;}
"@

# Append toast CSS to reference CSS
$refStyleWithToast = $refStyle + "`r`n" + $toastCss + "`r`n"

# Process HTML files
$files = Get-ChildItem -Path $targetDir -Filter '*.html'
$count = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    $regex = [regex]'(?s)<style>.*?</style>'
    $newContent = $regex.Replace($content, "<style>$refStyleWithToast</style>", 1)
    
    [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
    $count++
}

Write-Host "Updated $count HTML files."

# Update css/partes-moles.css
$cssFile = 'c:\Users\thiag\Downloads\obs\css\partes-moles.css'
[System.IO.File]::WriteAllText($cssFile, $refStyleWithToast.Trim(), [System.Text.Encoding]::UTF8)
Write-Host "Updated css/partes-moles.css"
