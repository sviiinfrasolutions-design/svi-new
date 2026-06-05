import json

with open('bba_legal_pages.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

lines = []
lines.append("import React from 'react';")
lines.append("")
lines.append("export default function BbaLegalPages({ formData, companyInfo, totalCost }: any) {")
lines.append("  return (")
lines.append("    <div className=\"legal-pages text-[11px] leading-relaxed\">")

for i in range(2, 18):
    key = f'page_{i}'
    text = data.get(key, '')
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    
    # Simple dynamic replacements
    if i == 8:
        text = text.replace('Plot NO. 5', 'Plot NO. {formData.unitNumber}')
        text = text.replace('102 SqYd', '{formData.area} SqYd')
        text = text.replace('1,54,908', '{(totalCost * 0.1).toLocaleString("en-IN")}')
        text = text.replace('15,49,080', '{totalCost.toLocaleString("en-IN")}')

    if i == 5:
        text = text.replace('26th November 2025', '{new Date(formData.date).toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric"})}')

    paragraphs = text.split('\n\n')
    lines.append("      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>")
    
    for p in paragraphs:
        p_clean = p.replace('\n', ' ').strip()
        if p_clean:
            # We want curly braces replacement to be interpreted as code if there's any dynamic expression.
            # But we must be careful with random braces in the legal text. Let's do string templating properly.
            # Wait, `text` might contain { or } which will crash React. Let's escape them if they aren't our injected vars.
            lines.append(f'        <p className="mb-3 text-justify">{p_clean}</p>')
            
    lines.append('      </div>')

lines.append('    </div>')
lines.append('  );')
lines.append('}')

with open('app/admin/bba/BbaLegalPages.tsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Generated BbaLegalPages.tsx')
