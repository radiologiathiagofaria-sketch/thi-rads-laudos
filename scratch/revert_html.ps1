$files = Get-ChildItem -Path "C:\Users\thiag\Downloads\obs\acrescente" -Filter "*.html"

foreach ($file in $files) {
    # We use Default encoding to avoid any UTF-8 mangling for ANSI files
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::Default)
    
    $pattern = "(?s)<script>`r?`n// -- Intercept manual Ctrl\+C inside the pre-laudo.+?</script>`r?`n</body>"
    if ($content -match $pattern) {
        $content = $content -replace $pattern, "</body>"
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::Default)
        Write-Host "Reverted $($file.Name)"
    }
}
