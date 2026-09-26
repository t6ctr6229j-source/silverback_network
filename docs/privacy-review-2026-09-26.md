# Datenschutz-Korrekturen vom 26. September 2026

## Umgesetzt

- Einwilligung und Analytics-Cookies: höchstens 180 Tage; kein automatisches Verlängern der Analytics-Cookies.
- Abgelaufene oder ungültige Entscheidungen aktivieren keine Messung. Ablauf wird auch auf geöffneten Seiten berücksichtigt.
- Widerruf in einem anderen Tab derselben Origin wird berücksichtigt; aus dem Back-Forward-Cache zurückkehrende Seiten prüfen die Entscheidung durch Neuladen erneut.
- FCTH und Psoydo fragen bei alten unbefristeten Entscheidungen erneut. Psoydo behält getrennte Freigaben für Analytics und Ads.
- Google-Übermittlungsgrundlagen mit Verweis auf Googles aktuelle Anbieterinformationen erläutert; kein Abschluss von Verträgen behauptet.
- Hostinganbieter vollständig benannt; Ablaufprüfung auch für Ablehnung und bei erneuter Zustimmung korrigiert.

## Nachgereichte Nachweise vom 26. September 2026

- Registerauszug vom 9. Juli 2026: wescaleIT AG, Amtsgericht Stuttgart HRB 755825, Sitz Ostfildern, Geschäftsanschrift Magirus-Deutz-Straße 12, 89077 Ulm. Alleiniger Vorstand Florian Zegar. Alexander Ennen und Jörg Thomas Pech haben jeweils Einzelprokura; die bisherige Angabe Gesamtprokura wurde korrigiert. Weitergehende Befugnisse Ennen sind im Register dokumentiert.
- Stephan Unser als Aufsichtsratsvorsitzender vom Betreiber bestätigt. Keine erneute Bestätigung der übrigen Aufsichtsratsmitglieder aus dem Register abgeleitet.
- Betreiber bestätigt Abschluss der Standardverträge mit den eingesetzten Anbietern. united-domains-AVV Version 1.5.11 liegt für wescaleIT AG vor, einschließlich Unterauftragnehmern und TOMs. Anlage 2, Abschnitt 4.1 nennt für die Auftragsverarbeitung ausschließlich die EU. Der vorgelegte Vertrag wird nicht in das Repository übernommen.
- Tally: Standard-DPA als Vertragsgrundlage bestätigt. Laut Tally wird er bei professioneller Nutzung mit den Kontobedingungen angenommen; eine separate Unterschrift ist nicht erforderlich. Gilt für die Tally-Nutzung bei CISO2Hero und Silverback; nicht für den entfernten Psoydo-Dienst Typeform.
- Google: Abschluss der Standardverträge laut Betreiber; keine gesonderte Kontrolle des Annahmestatus im Google-Konto durchgeführt.
- Analytics-Screenshot: Ereignisdaten 2 Monate, Nutzerdaten 14 Monate, Zurücksetzen bei neuer Nutzeraktivität aktiviert. Property-Name und Mess-ID sind im Bild nicht sichtbar. Diese Werte werden bis zur Zuordnung nicht pauschal in alle vier Datenschutzerklärungen übernommen. Cookie-Laufzeit und Kontoeinstellung sind verschiedene Fristen.

## Verbleibende Prüfpunkte

- Gelten die abgebildeten GA4-Aufbewahrungseinstellungen für alle vier Properties? Mess-IDs: wescaleIT G-7QYEF752NM, Psoydo G-EYFT82SFN7, CISO2Hero G-2Z0DKLDG8P, Silverback G-RWGM8X6QGH. Anschließend konkrete serverseitige Fristen ergänzen. Datenfreigaben, Ads-Verknüpfungen und erweiterte Messung sind damit nicht geprüft.
- Ist ein Datenschutzbeauftragter bestellt und ist datenschutz@wescaleit.com dessen bestätigte Kontaktadresse? Psoydo enthält bereits diese Aussage; die übrigen Texte sind nach Bestätigung abzugleichen.

## Prüfung

`node scripts/check-consent-lifecycle.cjs`

Die Tests führen den Einwilligungscode mit isoliertem DOM, Speicher und kontrollierter Uhr aus. Sie prüfen Ablehnung, Zustimmung, Widerruf, Ablauf, ungültige Daten, gesperrten Speicher, Änderungen aus anderen Tabs und Cache-Rückkehr. Bei Psoydo zusätzlich getrennte Analytics-/Ads-Auswahl; bei FCTH/Psoydo alte Entscheidungen. Kein Google-Netzwerkverkehr, kein Browser-Rendering-Test und keine Prüfung der GA-Kontoeinstellungen. JavaScript-Syntax separat geprüft.

Nach Veröffentlichung: frisches Browserprofil, keine Google-Anfragen vor Zustimmung/bei Ablehnung, richtiger Messdienst nach Freigabe, Widerruf inklusive zweitem Tab und tatsächliche Cookie-Laufzeiten per Netzwerkmitschnitt überprüfen. Diese Änderungen sind keine vollständige rechtliche Freigabe.

## Quellen der sachlichen Korrekturen

- https://www.gesetze-im-internet.de/ddg/__7.html
- https://www.united-domains.de/unternehmen/kontakt/
- https://www.baden-wuerttemberg.datenschutz.de/kontakt-aufnehmen/
- https://policies.google.com/privacy/frameworks?hl=de
- https://policies.google.com/technologies/cookies?hl=de
- https://support.google.com/analytics/answer/7667196?hl=de

- https://tally.so/help/data-processing-agreement
- https://tally.so/help/gdpr
