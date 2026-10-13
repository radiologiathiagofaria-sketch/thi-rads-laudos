import os
import re
import glob

ref_file = r'c:\Users\thiag\Downloads\obs\_referencia_layout.html.html'
target_dir = r'c:\Users\thiag\Downloads\obs\acrescente'
partes_moles_css = r'c:\Users\thiag\Downloads\obs\css\partes-moles.css'

with open(ref_file, 'r', encoding='utf-8') as f:
    ref_content = f.read()

match = re.search(r'<style>(.*?)</style>', ref_content, flags=re.DOTALL)
if not match:
    print('Style block not found in reference.')
    exit(1)

ref_style = match.group(1)

# Process HTML files
html_files = glob.glob(os.path.join(target_dir, '*.html'))
count = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace ONLY the first <style>...</style> block
    new_content = re.sub(r'<style>.*?</style>', f'<style>{ref_style}</style>', content, count=1, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1

print(f'Updated {count} HTML files.')

# Update css/partes-moles.css
with open(partes_moles_css, 'w', encoding='utf-8') as f:
    f.write(ref_style.strip())
print('Updated css/partes-moles.css')

