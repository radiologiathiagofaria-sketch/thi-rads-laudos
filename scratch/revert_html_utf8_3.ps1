$utf8NoBom = New-Object System.Text.UTF8Encoding $False
$files = Get-ChildItem -Path "C:\Users\thiag\Downloads\obs\acrescente" -Filter "*.html"

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
    
    $pattern = "(?s)<script>`r?`n// .+? Intercept manual Ctrl\+C inside the pre-laudo.+?</script>`r?`n</body>"
    if ($content -match $pattern) {
        $content = $content -replace $pattern, "</body>"
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Host "Reverted $($file.Name)"
    }
}