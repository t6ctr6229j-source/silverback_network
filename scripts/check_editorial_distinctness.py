"""Keep cluster editorial paragraphs distinct; shared legal caveats are intentional."""
from pathlib import Path
import json,re,html
D=Path(__file__).resolve().parents[1]/'dist'
items=json.loads((D/'content-clusters.json').read_text()); seen={}; errors=[]
for item in items:
    source=(D/(item['slug']+'.html')).read_text()
    body=source.split('<div class="article-body" id="briefing">',1)[1].split('<aside class="article-cta">',1)[0]
    for raw in re.findall(r'<p[^>]*>(.*?)</p>',body,re.S):
        text=' '.join(html.unescape(re.sub('<[^>]*>',' ',raw)).split())
        if len(text.split())<25 or 'Fiktives Anwendungsszenario' in text: continue
        if text in seen: errors.append((seen[text],item['slug'],text[:80]))
        seen[text]=item['slug']
assert not errors, errors
print('PASS: no identical substantive paragraphs across 15 cluster pages (fiction notices exempt)')
