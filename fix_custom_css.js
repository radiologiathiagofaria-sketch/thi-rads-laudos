const fs = require('fs');
const path = require('path');

const files = [
    'carotidas.html', 
    'tvp_membros_inferiores (2).html', 
    'tireoide elite.html', 
    'cervical_elite.html', 
    'cervical_linfonodos_elite.html', 
    'thirads-venoso-corrigido.html'
];
const backupDir = 'c:\\Users\\thiag\\Downloads\\obs\\_backup_antes_layout\\acrescente';
const targetDir = 'c:\\Users\\thiag\\Downloads\\obs\\acrescente';
const refPath = 'c:\\Users\\thiag\\Downloads\\obs\\_referencia_layout.html.html';

const refContent = fs.readFileSync(refPath, 'utf8');
const refMatch = refContent.match(/<style>([\s\S]*?)<\/style>/);
if (!refMatch) process.exit(1);
const refStyle = refMatch[1];

// Extract selectors from reference
const refSelectors = new Set();
const refRuleRegex = /([^{}]+)\{/g;
let m;
while ((m = refRuleRegex.exec(refStyle)) !== null) {
    let sel = m[1].trim();
    if (sel && !sel.startsWith('@') && !sel.startsWith(':root')) {
        refSelectors.add(sel.replace(/\s+/g, ' '));
    }
}

for (const f of files) {
    const bkpPath = path.join(backupDir, f);
    const tgtPath = path.join(targetDir, f);
    if (!fs.existsSync(bkpPath) || !fs.existsSync(tgtPath)) continue;

    const bkpContent = fs.readFileSync(bkpPath, 'utf8');
    const bkpMatch = bkpContent.match(/<style>([\s\S]*?)<\/style>/);
    if (!bkpMatch) continue;
    const bkpStyle = bkpMatch[1];

    let customCss = '\n/* --- CUSTOM COMPONENTS --- */\n';
    
    // Simple parser for CSS rules, ignoring @media and :root
    // We just find everything like selector { ... }
    const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
    let rm;
    while ((rm = ruleRegex.exec(bkpStyle)) !== null) {
        let selOriginal = rm[1].trim();
        if (selOriginal.startsWith('@') || selOriginal.startsWith(':root')) continue;
        
        let selNormalized = selOriginal.replace(/\s+/g, ' ');
        // If this selector does not exist in reference, it's custom
        if (!refSelectors.has(selNormalized) && !refStyle.includes(selNormalized)) {
            // Add it to our custom block!
            // Wait, we should exclude .laudo-doc, .doc-titulo, etc., but those ARE in reference!
            customCss += selOriginal + ' {' + rm[2] + '}\n';
        }
    }

    const tgtContent = fs.readFileSync(tgtPath, 'utf8');
    // Inject the custom css before the first </style>
    const newContent = tgtContent.replace(/<\/style>/i, customCss + '\n</style>');
    
    fs.writeFileSync(tgtPath, newContent, 'utf8');
    console.log('Fixed ' + f);
}
