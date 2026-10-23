# SEO- und GEO-Bestandsaufnahme: Silverback Network

**Stand:** 23.10.2026. **Markt:** Deutschland. **Freigabe:** Nur Branch und PR; keine Veröffentlichung.
**Quellen:** GitHub-/Cloudflare-Stand, Search Console und GA4 über Windsor.ai, 22.09.–19.10.2026.

## Ausgangslage

- 29 Impressionen, 5 Klicks, durchschnittliche Google-Position 4,45 im Zeitraum. Die geringe Zahl macht die Positionsangabe wenig aussagekräftig. Einzige offengelegte Suchanfrage: `silverback networks` (1 Impression). Nicht als allgemeine SEO-Position interpretieren.
- GA4: 46 Sitzungen über Direct, Referral und Organic Search, davon 3 organische; **0 als Key Events gemeldete Conversions**. Consent-Abhängigkeit. Das Tally-Projektformular ist veröffentlicht und im aktuellen Tally-Zähler noch ohne abgeschlossene Einreichungen; keine Schlussfolgerung über E-Mail-Anfragen.
- Vor Branch 5 Sitemap-URLs (Startseite, zwei Ratgeber, Datenschutz, Impressum); nach neuem Serviceangebot 6. Search Console meldet keine Sitemap-Fehler für die eingereichte Sitemap.
- Startseite hat starken Editorial-Claim „Wir wollten nie Staffing machen.“ plus sichtbare Zwischenzeile „Externe Experten und Interim Management. Persönlich empfohlen.“ Title und Description benennen Dienstleistungen. Canonical vorhanden, kein Noindex. JSON-LD mit Organization, Brand, WebSite, Service und FAQ.
- Die Farbwelt Aubergine/Limette, Gestaltung, Animationen und Tally-Verfahren bleiben unverändert.

## Keyword-Mapping und klare Rollen

| Suchintention | Zielseite | Status |
| --- | --- | --- |
| Silverback Network / IT-Experten persönlich empfohlen | / | vorhanden |
| Externe IT-Experten für Projektaufgaben | /externe-it-experten.html | **neu im PR** |
| Vermittlung von IT-Projektmanagement, SAP, Softwareentwicklung, Infrastruktur, IT-Leitung | /externe-it-experten.html | nur belegte Rollen nennen |
| Wie funktioniert persönliche Expertenvermittlung? | /vermittlung-bei-silverback.html | bestehender Praxis-/Ablaufartikel |
| Interim Manager Kosten / Tagessatz | /interim-manager-tagessatz.html | bestehender Informationsartikel |
| Interim CIO, CISO, CFO, konkrete Branchen-Cases | keine neue Zielseite | **Freigabe und fachliche Bestätigung fehlen** |

Weitere Keywords zur Verifikation, **ohne behauptetes Suchvolumen/geringe Schwierigkeit**: `externe IT Experten für Projekte`, `IT Projektmanager auf Zeit`, `SAP Experte für Projekt`, `Service Management Interim`, `IT Freelancer Vermittlung Kosten`. Die exakte Beauftragungs-/Vertragsart ist vor engerem „Freelancer“-Wording zu bestätigen.

## Änderungen im Branch

- Eine Service-Landingpage für tatsächlich genannte Expertise mit `Service`-JSON-LD, Canonical, klarer Aufgabenklärung, persönlicher Empfehlung und Open-Books-Modell.
- Startseite und Vermittlungsartikel verlinken die neue Seite; Sitemap ergänzt.
- Üblicher Vermittlungsanteil aus bereits veröffentlichter Unternehmensinformation: 10 Euro netto je geleisteter Expertenstunde zusätzlich zum Expertenhonorar, keine weiteren Vermittlungsgebühren. Kein behaupteter Branchenbenchmark, keine erfundenen Schnellbesetzungsfristen.
- Kein neues Design und keine Änderung an Tally oder Kundenzitaten.

## Offene Fragen / Freigaben

1. Welche zwei echten Vermittlungen können mit Aufgabe, Branche, Beitrag, Ergebnis und Kundenfreigabe belegt werden? `docs/silverback-cases-pending.md` bleibt maßgeblich.
2. Welche spezifischen Rollen darf Silverback als aktiv angeboten ausweisen, welche nur als Fälle aus dem Netzwerk?
3. Welche Vertragstypen sind verbindlich angeboten? Für „Freelancer-Vermittlung“ als zentrale Suchintention brauchen wir die genaue Leistungs-/Haftungsabgrenzung.
4. Ist die Angabe zum üblichen 10-Euro-Anteil weiterhin gültig?
5. Tally-Abschlüsse müssen consent-konform als echte Lead-Events definiert werden, nicht Formaufrufe oder Buttonklicks als Abschluss deklarieren.

## Grenzen der Bestandsaufnahme

Kein valides Long-Tail-Suchvolumen, keine Keyword-Difficulty, keine Browser-LCP/INP/CLS-Trace, kein verifiziertes AI-Antwort-Ranking. Sitemap ohne Fehler bedeutet nicht zwingend Indexierung jeder Seite.

## Abnahme

Neue statische HTML-Seite erhält den vorhandenen Editorial-Artikellook aus `dist/styles.css`; Schema.org Service, Meta-Daten, eine H1 und Canonical. `dist/sitemap.xml` und die internen Links müssen passen. `scripts/build-cloudflare-pages.sh` kopiert `dist/`; `main` nicht verändern, CI und mobile Sichtprüfung vor Merge.
