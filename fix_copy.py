import re

def fix_copiar(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the old copiar function using regex
    pattern_old = re.compile(r'function copiar\(\) \{[\s\S]*?showToast\(\'Falha ao copiar\. Use Ctrl\+A e Ctrl\+C no texto do laudo\.\'\);\s*\}\s*\}', re.MULTILINE)
    
    # Read the good copiar pattern from another file
    with open(r'c:\Users\thiag\Downloads\obs\acrescente\abdome_superior_elite.html', 'r', encoding='utf-8') as f2:
        abdome = f2.read()
    
    # Extract the full rich-text copiar pattern
    pattern_new = re.compile(r'(function copiar\(\) \{[\s\S]*?// --- FIM: FUN[^ ]* DE C[^ ]*PIA RICH-TEXT ---)')
    match_new = pattern_new.search(abdome)
    
    if match_new:
        new_copiar_code = match_new.group(1)
        
        # Replace the old one with the new one
        new_content = pattern_old.sub(new_copiar_code, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Updated " + file_path)
    else:
        print("Could not find the new copy pattern in abdome_superior_elite.html")

fix_copiar(r'c:\Users\thiag\Downloads\obs\acrescente\ultrassonografia_joelho_elite.html')
fix_copiar(r'c:\Users\thiag\Downloads\obs\acrescente\ultrassonografia_punho.html')
