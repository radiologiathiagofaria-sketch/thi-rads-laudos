$targetDir = 'c:\Users\thiag\Downloads\obs\acrescente'
$files = Get-ChildItem -Path $targetDir -Filter '*.html'

$toastCss = "
.toast-notification{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(12px);background:var(--text);color:var(--white);font-size:12.5px;font-weight:500;padding:10px 18px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.18);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;z-index:999;}
.toast-notification.show{opacity:1;transform:translateX(-50%) translateY(0);}
body.dark .toast-notification{background:#3a4155;color:#e2e6f0;}
"

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # We only inject if it's not already there to prevent double injection
    if (-not ($content -match '\.toast-notification\{')) {
        $newContent = $content -replace '(?i)(</style>)', "$toastCss$1"
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
    }
}

$cssFile = 'c:\Users\thiag\Downloads\obs\css\partes-moles.css'
$cssContent = [System.IO.File]::ReadAllText($cssFile, [System.Text.Encoding]::UTF8)
if (-not ($cssContent -match '\.toast-notification\{')) {
    $newCssContent = $cssContent + "
" + $toastCss
    [System.IO.File]::WriteAllText($cssFile, $newCssContent, [System.Text.Encoding]::UTF8)
}

Write-Host "Toast CSS successfully injected."
