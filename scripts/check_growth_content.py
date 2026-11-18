"""Regression checks for role pages and transparent budget examples."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1] / 'dist'
for slug, term in [('sap-freelancer', 'SAP'), ('freelancer-softwareentwicklung', 'Softwareentwicklung')]:
    text = (root / (slug + '.html')).read_text()
    assert term in text
    assert 'id="briefing"' in text
    assert len(re.findall(r'href="/(?:\?anliegen=kunde&amp;thema=[a-z-]+)?#anfrage-formular"', text)) == 2
    assert '10 Euro netto' in text
    assert 'tatsächlichen Verfügbarkeit' in text
    assert 'budgetformel' in text
    assert f'href="/{slug}"' in (root / 'externe-it-experten.html').read_text()
    assert f'/{slug}</loc>' in (root / 'sitemap.xml').read_text()
    assert '<iframe' not in text
budget = (root / 'interim-manager-tagessatz.html').read_text()
assert 'id="budgetformel"' in budget
assert 'Fiktives Planungsbeispiel, kein Angebot' in budget
assert '17.600 Euro netto' in budget and (100 + 10) * 8 * 20 == 17600
assert '16.000 Euro Expertenhonorar' in budget and 100 * 160 == 16000
assert '1.600 Euro Silverback-Anteil' in budget and 10 * 160 == 1600
assert 'keine automatische Tagesdefinition' in budget
print('PASS: role-page navigation, contact paths, availability caveats and net budget arithmetic')
