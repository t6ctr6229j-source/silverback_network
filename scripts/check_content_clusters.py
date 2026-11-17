"""Guard complete topic clusters, clear fiction, and NDA-safe presentation."""
from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1]; D=R/'dist'
items=json.loads((D/'content-clusters.json').read_text())
assert len(items)==15 and len({x['slug'] for x in items})==15
assert len({x['cluster'] for x in items})==5
hub=(D/'externe-it-experten.html').read_text()
for item in items:
 source=(D/(item['slug']+'.html')).read_text()
 assert '<iframe' not in source and 'href="/#anfrage-formular"' in source
 assert source.count('<h1>')==1
 assert 'href="/styles.css?v=' in source and 'src="/analytics.js?v=' in source
 assert len(re.sub('<[^>]+>',' ',source.split('<main')[1].split('</main>')[0]).split())>=250
 assert '<img' not in source.split('<main')[1].split('</main>')[0], 'No customer logos in new content'
 assert 'IT.NRW' not in source and '30+' not in source
 siblings=[x for x in items if x['cluster']==item['cluster'] and x!=item]
 for sibling in siblings: assert 'href="/'+sibling['slug']+'"' in source
 if item['type']=='Fiktives Szenario':
  intro=source.split('</h1>',1)[1].split('<div class="article-body"',1)[0]
  assert 'Fiktives Anwendungsszenario.' in intro
  assert 'Vollständig konstruiert' in intro and 'keinen Kundenauftrag' in intro
  assert 'anonymisierte Referenz' not in source
 if item['type']=='Leistung':
  assert 'href="/'+item['slug']+'"' in hub
  assert '10 Euro netto' in source and 'keine Zusage' in source
print('PASS: 15 pages, 5 complete linked clusters, fiction prominence, NDA and availability guardrails')
