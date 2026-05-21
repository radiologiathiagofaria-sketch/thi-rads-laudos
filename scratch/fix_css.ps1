$files = Get-ChildItem -Path "c:\Users\thiag\Downloads\obs\acrescente\*.html"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Avoid duplicating if already added
    if (-not ($content -match '\.laudo-doc:focus\s*\{')) {
        $content = $content -replace '</style>', ".laudo-doc:focus { outline: none; }`r`n</style>"
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    }
}
Write-Host "CSS fix applied!"
