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

Die zwei bestehenden Ratgeber wurden am 29.09.2026 angelegt. Das ursprüngliche Veröffentlichungsdatum bleibt erhalten; die Überarbeitung vom 04.11.2026 ist in sichtbarem Datum, Open Graph und JSON-LD einheitlich ausgewiesen. Die Autorenbeschreibung nennt Florians belegte Vorstandsfunktion und den Bezug zur Marke Silverback.

Die Leistungsseiten `/externe-it-experten` und `/it-management-auf-zeit` verwenden Service-Metadaten. Die erste Seite hilft bei der Auswahl externer Fachunterstützung und dem Projektbriefing. Die zweite beschreibt die Auftragsklärung für IT-Leitung, Service Management und Projektmanagement auf Zeit. Diese Rollen sind bereits im bisherigen veröffentlichten Angebot genannt. Verfügbarkeit, Leistungsumfang und konkrete Konditionen werden je Anfrage geklärt. Beide Seiten führen zum bestehenden gemeinsamen Anfrageformular.

Kundenlogos der wescaleIT AG werden nicht als Silverback-Vermittlungsfälle ausgegeben; dafür fehlen weiterhin separat freigegebene reale Fälle. `docs/silverback-cases-pending.md` enthält das interne Erfassungsbriefing. Umfang, Beleggrundlage und Prüfungen der aktuellen Änderungen stehen in `docs/seo-geo-release-2026-11-04.md`.
