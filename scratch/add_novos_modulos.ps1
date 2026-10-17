# Script para adicionar novos módulos ao laudo-thirads.html
# Abordagem por índice de linha - mais confiável para arquivos com encoding especial

$filePath = "c:\Users\thiag\Downloads\obs\laudo-thirads.html"

# Lê o arquivo preservando encoding
$bytes = [System.IO.File]::ReadAllBytes($filePath)
$encoding = [System.Text.UTF8Encoding]::new($false)
$content = $encoding.GetString($bytes)

$lines = $content -split "`r?`n"
Write-Host "Total de linhas: $($lines.Count)"

# === PASSO 1: APARELHO URINÁRIO - adicionar APARELHO URINÁRIO + PRÓSTATA e PRÓSTATA ===
# Encontrar a linha com o exame APARELHO URINÁRIO (deve ter "icone" e "URIN")
$idxUrinario = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'URIN.*icone' -or ($lines[$i] -match 'icone' -and $lines[$i-1] -match 'URIN')) {
        $idxUrinario = $i
        break
    }
}

# Procurar linha que tem o exame APARELHO URINÁRIO com o ícone
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '"APARELHO' -and $lines[$i] -match 'icone') {
        Write-Host "Encontrado em linha $($i+1)"
        $idxUrinario = $i
        break
    }
}

Write-Host "Índice Aparelho Urinário: $idxUrinario"

# A linha seguinte deve ser "]" fechando os exames
# Inserir após a linha do APARELHO URINÁRIO
if ($idxUrinario -ge 0) {
    $novaLinhaAparelhoProstata = '                    { nome: "APARELHO URIN\u00c1RIO + PR\u00d3STATA", icone: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M22 12 C 16 6, 6 12, 10 24 C 12 30, 18 32, 22 28 C 18 24, 18 16, 22 12 Z"/><path d="M42 12 C 48 6, 58 12, 54 24 C 52 30, 46 32, 42 28 C 46 24, 46 16, 42 12 Z"/><path d="M20 20 C 26 30, 28 36, 28 40"/><path d="M44 20 C 38 30, 36 36, 36 40"/><path d="M20 44 C 20 38, 44 38, 44 44 C 44 50, 38 54, 32 54 C 26 54, 20 50, 20 44 Z"/><ellipse cx="32" cy="58" rx="6" ry="4"/><path d="M32 54 L 32 56"/></svg>` },'
    $novaLinhaProstata = '                    { nome: "PR\u00d3STATA", icone: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M32 18 C 16 18, 12 28, 14 38 C 16 48, 24 52, 32 52 C 40 52, 48 48, 50 38 C 52 28, 48 18, 32 18 Z"/><path d="M22 28 C 26 24, 38 24, 42 28"/><path d="M20 38 C 24 44, 40 44, 44 38"/><path d="M32 52 L 32 60"/><path d="M28 56 L 36 56"/></svg>` }'
    
    # Adicionar vírgula no final da linha do APARELHO URINÁRIO se não tiver
    $lines[$idxUrinario] = $lines[$idxUrinario] -replace '` \}$', '` },'
    
    # Inserir as novas linhas após o índice
    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxUrinario) {
            $novaLinhaAparelhoProstataDec = [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::Unicode.GetBytes($novaLinhaAparelhoProstata))
            $novaLinhaProstataDec = [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::Unicode.GetBytes($novaLinhaProstata))
            $newLines += $novaLinhaAparelhoProstata
            $newLines += $novaLinhaProstata
        }
    }
    $lines = $newLines
    Write-Host "Módulos de próstata inseridos. Total linhas: $($lines.Count)"
}

# === PASSO 2: PÉLVICO / GINECOLÓGICO - adicionar PÉLVICO ABDOMINAL 2.0 e TRANSVAGINAL 2.0 ===
# Encontrar as linhas com PÉLVICO ABDOMINAL e TRANSVAGINAL (os existentes)
$idxPelvico = -1
$idxTransvaginal = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '"P.LVICO ABDOMINAL"' -and $lines[$i] -match 'icone') {
        $idxPelvico = $i
    }
    if ($lines[$i] -match '"TRANSVAGINAL"' -and $lines[$i] -match 'icone') {
        $idxTransvaginal = $i
    }
}
Write-Host "Índice PÉLVICO ABDOMINAL: $idxPelvico"
Write-Host "Índice TRANSVAGINAL: $idxTransvaginal"

if ($idxTransvaginal -ge 0) {
    $novoPelvicoV2 = '                    { nome: "P\u00c9LVICO ABDOMINAL 2.0", icone: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M32 16 C 42 16, 48 22, 44 34 C 42 40, 36 46, 36 52 L 28 52 C 28 46, 22 40, 20 34 C 16 22, 22 16, 32 16 Z"/><path d="M22 22 C 16 20, 10 24, 12 30 C 14 34, 18 32, 20 28"/><path d="M42 22 C 48 20, 54 24, 52 30 C 50 34, 46 32, 44 28"/><path d="M28 52 C 28 58, 36 58, 36 52"/><text x="44" y="20" font-size="12" fill="currentColor" stroke="none" font-weight="bold">2</text></svg>` },'
    $novoTransvaginalV2 = '                    { nome: "TRANSVAGINAL 2.0", icone: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M32 12 C 42 12, 48 18, 44 30 C 42 36, 36 42, 36 48 L 28 48 C 28 42, 22 36, 20 30 C 16 18, 22 12, 32 12 Z"/><path d="M22 18 C 16 16, 10 20, 12 26 C 14 30, 18 28, 20 24"/><path d="M42 18 C 48 16, 54 20, 52 26 C 50 30, 46 28, 44 24"/><path d="M32 54 L 32 62 M 28 58 L 36 58"/><text x="44" y="18" font-size="12" fill="currentColor" stroke="none" font-weight="bold">2</text></svg>` }'
    
    # Adicionar vírgula no final da linha do TRANSVAGINAL se necessário
    $lines[$idxTransvaginal] = $lines[$idxTransvaginal] -replace '` \}$', '` },'
    
    # Inserir após TRANSVAGINAL
    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxTransvaginal) {
            $newLines += $novoPelvicoV2
            $newLines += $novoTransvaginalV2
        }
    }
    $lines = $newLines
    Write-Host "Módulos Pélvico/Transvaginal 2.0 inseridos. Total linhas: $($lines.Count)"
}

# === PASSO 3: PARTES MOLES - adicionar AXILAR ===
$idxPartesMoles = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '"PARTES MOLES"' -and $lines[$i] -match 'icone') {
        $idxPartesMoles = $i
    }
}
Write-Host "Índice PARTES MOLES: $idxPartesMoles"

if ($idxPartesMoles -ge 0) {
    $novoAxilar = '                    { nome: "AXILAR", icone: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 16 C 12 28, 20 36, 32 38 C 44 36, 52 28, 52 16"/><path d="M12 16 C 16 8, 24 6, 32 8 C 40 6, 48 8, 52 16"/><path d="M24 18 C 28 22, 36 22, 40 18"/><path d="M22 28 C 26 32, 38 32, 42 28"/><circle cx="32" cy="14" r="3"/></svg>` }'

    # Adicionar vírgula no final da linha do PARTES MOLES se necessário
    $lines[$idxPartesMoles] = $lines[$idxPartesMoles] -replace '` \}$', '` },'

    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxPartesMoles) {
            $newLines += $novoAxilar
        }
    }
    $lines = $newLines
    Write-Host "Módulo AXILAR inserido. Total linhas: $($lines.Count)"
}

# === PASSO 4: MUSCULOESQUELÉTICO - adicionar TORNOZELO ===
$idxPunho = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '"PUNHO"' -and $lines[$i] -match 'icone') {
        $idxPunho = $i
    }
}
Write-Host "Índice PUNHO: $idxPunho"

if ($idxPunho -ge 0) {
    $novoTornozelo = '                    { nome: "TORNOZELO", icone: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M22 10 L 22 34 C 22 42, 18 46, 16 52 L 48 52 C 46 46, 42 42, 42 34 L 42 10"/><path d="M22 34 C 24 38, 40 38, 42 34"/><path d="M16 52 C 12 52, 10 56, 12 58 C 14 60, 20 58, 20 54"/><path d="M48 52 C 52 52, 54 56, 52 58 C 50 60, 44 58, 44 54"/><line x1="28" y1="10" x2="36" y2="10"/></svg>` }'

    # Adicionar vírgula no final da linha do PUNHO se necessário
    $lines[$idxPunho] = $lines[$idxPunho] -replace '` \}$', '` },'

    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxPunho) {
            $newLines += $novoTornozelo
        }
    }
    $lines = $newLines
    Write-Host "Módulo TORNOZELO inserido. Total linhas: $($lines.Count)"
}

# === PASSO 5: VASCULAR - adicionar ARTERIAL MMSS e ARTERIAL MMII ===
$idxArterial = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '"ARTERIAL DE MEMBROS"' -and $lines[$i] -match 'icone') {
        $idxArterial = $i
    }
}
Write-Host "Índice ARTERIAL DE MEMBROS: $idxArterial"

if ($idxArterial -ge 0) {
    $novoArterialMMSS = '                    { nome: "ARTERIAL MMSS", icone: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M32 8 C 20 8, 12 14, 12 24 C 12 30, 16 34, 22 36 L 22 56"/><path d="M32 8 C 44 8, 52 14, 52 24 C 52 30, 48 34, 42 36 L 42 56"/><path d="M32 8 L 32 20"/><path d="M28 50 L 22 56 L 16 50"/><path d="M48 50 L 42 56 L 36 50"/><path d="M22 44 C 28 40, 36 40, 42 44"/></svg>` },'
    $novoArterialMMII = '                    { nome: "ARTERIAL MMII", icone: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M24 10 C 14 16, 16 36, 20 54 C 22 62, 42 62, 44 54 C 48 36, 50 16, 40 10"/><path d="M32 14 C 32 26, 32 42, 32 58"/><path d="M26 24 L 32 30 L 38 24"/><path d="M26 44 L 32 50 L 38 44"/><path d="M48 26 C 52 30, 52 38, 48 42"/><path d="M52 20 C 58 28, 58 44, 52 50"/></svg>` }'

    # Adicionar vírgula no final da linha do ARTERIAL DE MEMBROS se necessário
    $lines[$idxArterial] = $lines[$idxArterial] -replace '` \}$', '` },'

    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxArterial) {
            $newLines += $novoArterialMMSS
            $newLines += $novoArterialMMII
        }
    }
    $lines = $newLines
    Write-Host "Módulos ARTERIAL MMSS e MMII inseridos. Total linhas: $($lines.Count)"
}

# === PASSO 6: FUNÇÃO abrirLaudo - adicionar os novos cases ===
# Encontrar onde adicionar os novos else if para os novos módulos
$idxAbrirLaudo = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "exame === 'APARELHO URIN" -and $lines[$i] -match "else if") {
        $idxAbrirLaudo = $i
        break
    }
}
Write-Host "Índice case APARELHO URINÁRIO na função: $idxAbrirLaudo"

if ($idxAbrirLaudo -ge 0) {
    $novoCaseAparelhoProstata = "            } else if (exame === 'APARELHO URIN\u00c1RIO + PR\u00d3STATA') {"
    $novoCaseAparelhoProstataHref = "                window.location.href = 'acrescente/aparelho_urinario_prostata_elite.html';"
    $novoCaseProstata = "            } else if (exame === 'PR\u00d3STATA') {"
    $novoCaseProstataHref = "                window.location.href = 'acrescente/prostata_abdominal_elite.html';"
    
    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxAbrirLaudo) {
            # Inserir após o case de APARELHO URINÁRIO (que é a linha atual + href na próxima)
            $newLines += $lines[$i+1]  # window.location.href para aparelho urinário
            $newLines += $novoCaseAparelhoProstata
            $newLines += $novoCaseAparelhoProstataHref
            $newLines += $novoCaseProstata
            $newLines += $novoCaseProstataHref
            $i++  # pular a próxima linha (já foi inserida)
        }
    }
    $lines = $newLines
    Write-Host "Cases de próstata inseridos na função. Total linhas: $($lines.Count)"
}

# === PASSO 7: FUNÇÃO abrirLaudo - adicionar cases para PÉLVICO 2.0 e TRANSVAGINAL 2.0 ===
$idxCaseTransvaginal = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "exame === 'TRANSVAGINAL'" -and $lines[$i] -match "else if") {
        $idxCaseTransvaginal = $i
        break
    }
}
Write-Host "Índice case TRANSVAGINAL na função: $idxCaseTransvaginal"

if ($idxCaseTransvaginal -ge 0) {
    $novoCasePelvicoV2 = "            } else if (exame === 'P\u00c9LVICO ABDOMINAL 2.0') {"
    $novoCasePelvicoV2Href = "                window.location.href = 'acrescente/pelvico_abdominal_elite_v2.html';"
    $novoCaseTransvaginalV2 = "            } else if (exame === 'TRANSVAGINAL 2.0') {"
    $novoCaseTransvaginalV2Href = "                window.location.href = 'acrescente/ustransvaginal_v2.html';"
    
    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxCaseTransvaginal) {
            $newLines += $lines[$i+1]  # href do TRANSVAGINAL existente
            $newLines += $novoCasePelvicoV2
            $newLines += $novoCasePelvicoV2Href
            $newLines += $novoCaseTransvaginalV2
            $newLines += $novoCaseTransvaginalV2Href
            $i++
        }
    }
    $lines = $newLines
    Write-Host "Cases Pélvico/Transvaginal 2.0 inseridos. Total linhas: $($lines.Count)"
}

# === PASSO 8: FUNÇÃO abrirLaudo - adicionar case para AXILAR ===
$idxCasePartesMoles = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "exame === 'PARTES MOLES'" -and $lines[$i] -match "else if") {
        $idxCasePartesMoles = $i
        break
    }
}
Write-Host "Índice case PARTES MOLES na função: $idxCasePartesMoles"

if ($idxCasePartesMoles -ge 0) {
    $novoCaseAxilar = "            } else if (exame === 'AXILAR') {"
    $novoCaseAxilarHref = "                window.location.href = 'acrescente/axilas.html';"
    
    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxCasePartesMoles) {
            $newLines += $lines[$i+1]  # href do PARTES MOLES existente
            $newLines += $novoCaseAxilar
            $newLines += $novoCaseAxilarHref
            $i++
        }
    }
    $lines = $newLines
    Write-Host "Case AXILAR inserido. Total linhas: $($lines.Count)"
}

# === PASSO 9: FUNÇÃO abrirLaudo - adicionar case para TORNOZELO ===
$idxCasePunho = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "exame === 'PUNHO'" -and $lines[$i] -match "else if") {
        $idxCasePunho = $i
        break
    }
}
Write-Host "Índice case PUNHO na função: $idxCasePunho"

if ($idxCasePunho -ge 0) {
    $novoCaseTornozelo = "            } else if (exame === 'TORNOZELO') {"
    $novoCaseTornozeloHref = "                window.location.href = 'acrescente/ultrassonografia_tornozelo_elite.html';"
    
    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxCasePunho) {
            $newLines += $lines[$i+1]  # href do PUNHO existente
            $newLines += $novoCaseTornozelo
            $newLines += $novoCaseTornozeloHref
            $i++
        }
    }
    $lines = $newLines
    Write-Host "Case TORNOZELO inserido. Total linhas: $($lines.Count)"
}

# === PASSO 10: FUNÇÃO abrirLaudo - adicionar cases para ARTERIAL MMSS e ARTERIAL MMII ===
$idxCaseArterial = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "exame === 'ARTERIAL DE MEMBROS'" -and $lines[$i] -match "else if") {
        $idxCaseArterial = $i
        break
    }
}
Write-Host "Índice case ARTERIAL DE MEMBROS na função: $idxCaseArterial"

if ($idxCaseArterial -ge 0) {
    $novoCaseArterialMMSS = "            } else if (exame === 'ARTERIAL MMSS') {"
    $novoCaseArterialMMSSHref = "                window.location.href = 'acrescente/arterial-mmss.html';"
    $novoCaseArterialMMII = "            } else if (exame === 'ARTERIAL MMII') {"
    $novoCaseArterialMMIIHref = "                window.location.href = 'acrescente/arterial-mmii-novo.html';"
    
    $newLines = @()
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $newLines += $lines[$i]
        if ($i -eq $idxCaseArterial) {
            $newLines += $lines[$i+1]  # href do ARTERIAL DE MEMBROS existente
            $newLines += $novoCaseArterialMMSS
            $newLines += $novoCaseArterialMMSSHref
            $newLines += $novoCaseArterialMMII
            $newLines += $novoCaseArterialMMIIHref
            $i++
        }
    }
    $lines = $newLines
    Write-Host "Cases ARTERIAL MMSS e MMII inseridos. Total linhas: $($lines.Count)"
}

# Salva o arquivo
$newContent = $lines -join "`r`n"
$newBytes = $encoding.GetBytes($newContent)
[System.IO.File]::WriteAllBytes($filePath, $newBytes)
Write-Host "Arquivo salvo com sucesso! Total de linhas: $($lines.Count)"
