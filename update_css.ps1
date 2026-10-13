$refPath = 'c:\Users\thiag\Downloads\obs\_referencia_layout.html.html'
$refContent = [System.IO.File]::ReadAllText($refPath, [System.Text.Encoding]::UTF8)

if ($refContent -match '(?s)<style>(.*?)</style>') {
    $refStyle = $matches[1]
} else {
    Write-Host 'Style block not found in reference.'
    exit
}

$targetDir = 'c:\Users\thiag\Downloads\obs\acrescente'
$files = Get-ChildItem -Path $targetDir -Filter '*.html'
$count = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # regex to replace the first occurrence
    $regex = [regex]'(?s)<style>.*?</style>'
    $newContent = $regex.Replace($content, "<style>$refStyle</style>", 1)
    
    if ($newContent -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        $count++
    }
}

Write-Host "Updated $count HTML files."

$cssFile = 'c:\Users\thiag\Downloads\obs\css\partes-moles.css'
[System.IO.File]::WriteAllText($cssFile, $refStyle.Trim(), [System.Text.Encoding]::UTF8)
Write-Host 'Updated css/partes-moles.css'

