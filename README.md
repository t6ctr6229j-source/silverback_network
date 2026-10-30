# Silverback Network

Statische Website für https://www.silverback-network.com. Design: Aubergine, Limette und Offwhite.

## Website und Veröffentlichung

`dist/` enthält die Website einschließlich Bilder und Logos. Cloudflare Pages baut den freigegebenen `main`-Stand mit `sh scripts/build-cloudflare-pages.sh` und veröffentlicht `cf-dist/`. Pull Requests dienen der Prüfung; ihr Merge veröffentlicht den neuen Produktionsstand über die bestehende Pages-Integration.

Physische Dateien behalten `.html`; öffentliche Seiten verwenden endungslose URLs. Cloudflare Pages leitet die alten `.html`-Adressen dauerhaft um. Canonical, Open Graph, Schema, Sitemap und interne Links müssen die endgültigen URLs verwenden. Die bestehenden Kontaktanker bleiben erhalten.

Der alte United-Domains-Workflow führt bei `main`-Pushes weiterhin QA aus. Sein SFTP-Upload läuft ausschließlich nach einem ausdrücklich ausgelösten `workflow_dispatch` als vorhandener Rückfallweg. Dieser Workflow ist kein zusätzlicher automatischer Produktionsupload.

## Lokale Prüfung

```sh
npm ci
sh scripts/build-cloudflare-pages.sh
npm run check:seo
npm run test:pages
npm run test:consent
python3 scripts/check_authorship.py
```

`test:pages` startet den gepinnten Wrangler-Router ausschließlich lokal. Es prüft direkte Canonical-URLs, erhaltene `.html`-Weiterleitungen samt Query und die echte 404-Antwort. `check:seo` prüft zusätzlich interne Links und Anker, Sitemap, Entity-IDs und das gemeinsame Formular. Der CI-Browsertest prüft die lokalen Dateien in Chromium und WebKit; Tally und Analytics sind dort ersetzt, sodass keine Formulardaten oder QA-Besuche an die Dienste gehen.

## Analytics und Formularabschlüsse

GA4-Mess-ID: `G-RWGM8X6QGH`. `dist/analytics.js` lädt Google ausschließlich nach gültiger Zustimmung und nur über HTTPS auf `silverback-network.com` bzw. `www.silverback-network.com`. In lokalen und Pages-Vorschauen bleibt Analytics aus. Ablehnen, Zustimmen und Widerruf sind auf allen Seiten verfügbar; die Auswahl gilt höchstens 180 Tage. Werbung und Google Signals bleiben deaktiviert.

Seitenadressen werden ohne Query/Fragment verwendet. Von externen Referrern wird ausschließlich die HTTP(S)-Origin übergeben; dieselbe Origin wird unterdrückt. Ein `generate_lead` entsteht nur bei `Tally.FormSubmitted` des aktuell eingebundenen, bekannten Formulars `LDDoxJ`: erwartete Origin, iframe-Quelle und Formular-ID müssen übereinstimmen. Die Submission-ID dient nur einem flüchtigen Dedup-Set und wird ebenso wenig wie Antworten oder Respondentenangaben an Analytics übertragen. Ereignisse vor Zustimmung werden nicht nachgesendet; ein Formularaufruf ist kein Abschluss.

Das Markieren von `generate_lead` als GA4-Schlüsselereignis ist eine separate Property-Einstellung. Diese Repository-Änderungen richten sie nicht ein und behaupten keinen getesteten echten Formularversand. Siehe `docs/tally-forms.md`.

## Inhaltsdaten und Nachweise

Die zwei bestehenden Ratgeber wurden am 29.09.2026 angelegt und am 30.09.2026 inhaltlich überarbeitet. Ihre belegten Artikel-Daten bleiben erhalten. Die am 29.10.2026 veröffentlichte Leistungsseite verwendet Service-Metadaten und keine aus einer Artikelvorlage übernommenen September-Daten. Kundenlogos der wescaleIT AG werden nicht als Silverback-Vermittlungsfälle ausgegeben; dafür fehlen weiterhin separat freigegebene reale Fälle.
