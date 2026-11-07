# Silverback: Snippets und responsive Porträts, 7. November 2026

## Änderungen

- Zwei Seitentitel verkürzt: „Interim Manager: Tagessätze & Kosten | Silverback Network“ und „Vermittlung: Ablauf & Konditionen | Silverback Network“. Die sichtbaren Überschriften und Artikelinhalte bleiben erhalten.
- Die Meta- und Open-Graph-Beschreibung von `/externe-it-experten` ist knapper. Keine zusätzlichen Leistungsversprechen oder Kundenfälle.
- `robots.txt` schließt nur `/cdn-cgi/l/email-protection` aus. Cloudflare erzeugt diese Hilfsadresse für den E-Mail-Schutz. Der Schutz, das Decode-Skript und alle Inhaltsseiten bleiben unverändert erreichbar. Grundlage: [Cloudflare: Cdn Cgi Endpoint](https://developers.cloudflare.com/fundamentals/reference/cdn-cgi-endpoint/). Der Crawl-Befund ist kein fehlender redaktioneller Inhalt.
- Anja, Eva, Alex und Udo werden mit WebP-Varianten in drei Breiten ausgeliefert. Unveränderte PNG-Originale bleiben im Repository. Zuschnitt, Transparenz, Bildabmessungen im HTML, Lazy Loading, Texte und CSS bleiben erhalten. `sizes` und `srcset` steuern die Auswahl passend zur Ansicht.
- Reproduzierbare Bildkonvertierung mit `scripts/optimize-portraits.py` (Pillow, Qualität 85, keine Vergrößerung, verlustfrei erhaltener Alpha-Kanal). Im Produktionsbuild wird kein Bildprozessor benötigt.

## Gemessene Asset-Größen

Die drei Team-PNGs umfassen 4.567.720 Bytes. Selbst die größten WebP-Varianten umfassen zusammen 444.338 Bytes, rund 90,3 % weniger. Die 480-Pixel-Varianten benötigen zusammen 87.348 Bytes. Einschließlich Udo sinkt die größte Auswahl von 5.101.424 auf 538.954 Bytes (89,4 %). Dies ist eine Dateigrößenmessung, kein behaupteter Core-Web-Vitals- oder Ladezeitgewinn. Der Browser wählt abhängig von Ansichtsbreite und Pixeldichte.

## Prüfung vor Veröffentlichung

- JavaScript-Syntax, SEO-/Metadaten-/Sitemap-/Ankerprüfung und Autorenprüfung bestanden.
- 16 isolierte Consent- und Lead-Ereignisprüfungen bestanden. Keine Google-Aufrufe und keine echten Formulareingaben.
- Statischer Build und lokaler Cloudflare-Pages-Router bestanden: sieben kanonische Seiten, permanente `.html`-Weiterleitungen mit Query-Erhalt und echte 404-Antwort.
- Alpha-Kanäle und Dimensionen aller Bildvarianten geprüft. Originale und Derivate visuell verglichen; kein neuer Zuschnitt und keine Änderung an den Personen.
- Statische Regressionen prüfen responsive Kandidaten, Bilddateien, Bytebudget und die eng begrenzte Robots-Regel.
- Bestehende CI-Browserprüfungen werden um dekodierte WebP-Bilder und Überlaufprüfungen bei 320, 390, 800 und 1440 Pixeln ergänzt. Chromium/WebKit-CI ist vor Merge zu prüfen. Ein lokaler Browser-Preview war aus dem Browser nicht erreichbar; daraus wird kein visueller Browsertest abgeleitet.

## Externe Befunde und Grenzen

`assets/customer-logos/remira.svg` antwortete bei der erneuten HTTP-Prüfung mit 200 und `image/svg+xml`; der frühere Crawl hatte 500 gemeldet. Keine unbegründete Änderung der Datei oder Sicherheitskonfiguration.

Diese Änderung bestätigt keine vollständige Google-Indexierung, Rankings oder echten Kontaktabschlüsse. Search-Console-URL-Prüfung und GA4-Schlüsselereignis-Konfiguration sind getrennte Kontoprüfungen. Consent und Trackingcode bleiben unverändert. Veröffentlichung erfolgt erst über den freigegebenen Repository-Workflow nach bestandenen Prüfungen und Freigabe.
