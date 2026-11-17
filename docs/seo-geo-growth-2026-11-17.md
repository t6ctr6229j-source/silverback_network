# Silverback: Rollen und transparente Kosten, 17.11.2026

## Umfang
- Zwei eigenständige Einstiege: `/sap-freelancer` und `/freelancer-softwareentwicklung`.
- Bestehende Expertenseite verlinkt beide Fachgebiete mit passenden Briefingfragen.
- Kostenratgeber ergänzt Stunden-, Tages- und Projektformel mit dem üblichen Netto-Aufschlag von 10 €/h. Das 160-Stunden-Beispiel ist ausdrücklich fiktiv, keine Marktpreis- oder Verfügbarkeitszusage.
- Canonical, Open Graph, Service-Entitäten, Sitemap und interne Links folgen der vorhandenen Architektur. Keine neuen Skripte oder externen Dienste.
- Bestehendes Design, gemeinsame Tally-Anfrage, Analytics-Zustimmung und Rechtstexte bleiben erhalten.

## Beleggrundlage und Grenzen
SAP und Softwareentwicklung sind bereits auf `main` in der Homepage-FAQ sowie `/externe-it-experten` als Fachgebiete genannt. Die neuen Seiten konkretisieren Fragen zur Auftragsklärung, ohne vollständige Modul-/Technologieabdeckung oder einen verfügbaren Kandidaten zu behaupten. Das Python/Docker-Beispiel ist als Formulierungsbeispiel, nicht Kundenfall, gekennzeichnet.

Es liegen weiterhin keine separat freigegebenen Silverback-Vermittlungsfälle vor. Deshalb wurden keine Referenzen, Projektergebnisse, Erfolgsquoten oder Kundenaussagen erfunden. Kundenlogos bleiben korrekt der wescaleIT-Praxis zugeordnet. Das bestehende `silverback-cases-pending.md` bleibt der Erfassungsweg für echte Fälle.

Keine freelancermap-Abfrage, kein automatisierter Datenimport und keine unbestätigte Marktpreisspanne. Leistungsseiten beschreiben eine Anfrage und persönliche Prüfung, kein buchbares Inventar.

## Prüfung
- `npm run check`, `npm run check:seo`, `npm run test:consent`, `python3 scripts/check_authorship.py`, `python3 scripts/check_growth_content.py`.
- Seitenrouterprüfung über `npm run test:pages`; neue URLs aus Sitemap werden einbezogen.
- `scripts/browser-qa.cjs` umfasst jetzt auch beide neuen Seiten (fünf Viewportbreiten, interne Ziele, Canonical/JSON-LD). Ausführung in bestehender CI.
- Lokale visuelle Prüfung via Sites-Preview war wegen Browser-Zugriffsfehler auf den gelieferten Preview-Endpunkt nicht möglich. Nicht als bestanden ausgeben.

Nur Draft-PR. Kein Merge und kein Produktionsdeployment ohne separate Freigabe.
