# Silverback: SEO- und GEO-Verbesserungen vom 4. November 2026

## Ausgangslage und Umfang

Bearbeitungsbasis ist der veröffentlichte `main`-Stand `b0ac91a344eb87e76a67258d181bccf21877ac4d`. Die isolierte Arbeitskopie wurde vor der Bearbeitung gegen diesen Quellstand geprüft. Dieses Dokument beschreibt vorbereitete Website-Änderungen; es behauptet keinen bereits erfolgten Produktionsdeploy.

Das Angebot ist auf der Startseite und im Vermittlungsratgeber bereits mit IT-Leitung, Entwicklungsleitung, Service Management, Projektmanagement, SAP, Softwareentwicklung und Infrastruktur beschrieben. Auch Open Books mit üblicherweise 10 Euro netto je geleisteter Expertenstunde ist dort veröffentlicht. Diese vorhandenen Aussagen bilden die Grenze der neuen Texte.

## Änderungen

- `/externe-it-experten` beantwortet die Entscheidung zwischen zusätzlicher Fachunterstützung und Führung auf Zeit. Die Seite erläutert die Auftragsklärung für Projekt- und Service Management, Softwareentwicklung/SAP und Infrastruktur. Ein Briefing mit fünf konkreten Fragen verbindet Aufgabe, Ergebnis, Erfahrung, Umfang, Zusammenarbeit und Budget.
- `/it-management-auf-zeit` ist eine eigenständige Leistungsseite für IT-Leitung, Service Management und Projektmanagement auf Zeit. Sie erklärt Auftrag, Mandat, Entscheidungswege, Einsatzumfang und Übergabe. Die tatsächliche Person, Verfügbarkeit und der Leistungsumfang bleiben Gegenstand der individuellen Abstimmung.
- Die Startseite führt aus den bestehenden Angebotsbeschreibungen zu beiden Leistungsseiten. Ihre Service-Verweise nutzen dieselben kanonischen Seiten-IDs wie die jeweiligen Leistungsseiten.
- Die beiden vorhandenen Ratgeber verlinken die Leistungsseiten im fachlichen Kontext. Die Autorenbeschreibung nennt Florians belegte Vorstandsfunktion und den Bezug zur Marke statt einer für diese Artikel unpassenden Beschreibung seiner Informationssicherheitsberatung.
- Beide Ratgeber behalten `datePublished: 2026-09-29`. Die tatsächliche Überarbeitung ist als `dateModified: 2026-11-04`, sichtbares Aktualisierungsdatum und Open-Graph-Datum einheitlich angegeben.
- Die Sitemap enthält sieben endungslose kanonische URLs. `lastmod` wurde für die veränderten Inhalte gesetzt; Impressum und Datenschutz erhalten kein erfundenes Änderungsdatum.
- Das interne Fallbriefing ist konkretisiert. Keine Kundenfälle, Kundenstimmen, Erfolgsquoten oder neuen persönlichen Qualifikationen wurden öffentlich ergänzt.

## Erhaltenes Verhalten

Das Design, die vorhandenen Bilder und die Bewegungslogik bleiben erhalten. Die Seiten nutzen die vorhandenen Artikel- und Leistungsstile. Die gemeinsame Tally-Anfrage `LDDoxJ`, die kompatiblen Kontaktanker, die bewusste iframe-Aktivierung und die direkte Formularalternative bleiben bestehen.

`dist/app.js` und `dist/analytics.js` werden für diese Inhaltsänderung nicht angepasst. Consent, Produktionshost-Prüfung, Origin- und iframe-Prüfung, Deduplizierung sowie die Beschränkung der Lead-Parameter auf feste technische Werte bleiben erhalten. Alle öffentlichen Seiten referenzieren weiterhin den bestehenden aktuellen Content-Hash von `analytics.js`. CSS und andere ausführbare Assets sind unverändert.

## Prüfung

Die vorhandenen SEO- und Browserprüfungen berücksichtigen die neue Leistungsseite. Lokal geprüft am 4. November 2026:

| Prüfung | Ergebnis |
| --- | --- |
| `python3 scripts/check_seo_consistency.py` | Bestanden: sieben kanonische Seiten, passende Open-Graph- und Service-/Artikel-URLs, Sitemap, interne Links und Anker, gemeinsames Formular und aktueller Analytics-Hash. |
| `python3 scripts/check_authorship.py` | Bestanden: zwei bestehende Ratgeber mit übereinstimmender sichtbarer Autorenbeschreibung, ursprünglichem Veröffentlichungsdatum und aktuellem Änderungsdatum in HTML, JSON-LD und Open Graph. |
| `node scripts/check-consent-lifecycle.cjs` | Alle 16 Verhaltensprüfungen bestanden. Isolierter Test ohne Google-Netzwerk oder Formularversand. |
| `sh scripts/build-cloudflare-pages.sh` | Bestanden: statischer Build mit 49 Dateien. |
| `python3 scripts/check_pages_runtime.py` | Bestanden mit dem vorhandenen Wrangler 4.156.0: alle sieben kanonischen URLs direkt erreichbar, permanente `.html`-Weiterleitungen samt Query und tatsächliche 404-Antwort. |
| `git diff --check` | Bestanden. |
| `node scripts/browser-qa.cjs` | Lokal nicht ausführbar: Playwright ist vorhanden, die zugehörige Chromium-Datei fehlt. Der Abbruch erfolgt vor dem Seitenaufruf. Die aktualisierte Prüfung der fünf Inhaltsseiten muss in der bestehenden CI-Browserumgebung erfolgen. |

Der Browsertest enthält die bestehenden Kontakt- und Consent-Gates sowie Ansichten mit 1440, 1024, 800, 390 und 320 Pixeln Breite. Externe Tally- und Analytics-Aufrufe werden dort ersetzt. Ein neues lokales visuelles Prüfergebnis wird für diesen Stand deshalb nicht behauptet. Die bereits bestandenen Router- und statischen Prüfungen ersetzen diese Browserprüfung nicht.

## Noch externe Abhängigkeiten

Für veröffentlichbare Vermittlungsfälle fehlen reale Fallunterlagen und konkrete Freigaben. Das interne Briefing hält die benötigten Angaben fest. Der aktuelle Google-Sitemap-Abruf, die vollständige Indexierung, tatsächliche Rankings und das Eintreffen realer Leads sind keine durch den Quellcode belegten Ergebnisse und werden getrennt überprüft. Die Kennzeichnung von `generate_lead` als Schlüsselereignis ist eine Einstellung der GA4-Property.

Es wurden keine synthetischen Formulare abgesendet, keine produktiven Kontakte ausgelöst und keine entfernten Repositories oder Deployments verändert.
