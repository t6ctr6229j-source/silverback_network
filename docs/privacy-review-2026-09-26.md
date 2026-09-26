# Datenschutz-Korrekturen vom 26. September 2026

## Umgesetzt

- Einwilligung und Analytics-Cookies: höchstens 180 Tage; kein automatisches Verlängern der Analytics-Cookies.
- Abgelaufene oder ungültige Entscheidungen aktivieren keine Messung. Ablauf wird auch auf geöffneten Seiten berücksichtigt.
- Widerruf in einem anderen Tab derselben Origin wird berücksichtigt; aus dem Back-Forward-Cache zurückkehrende Seiten prüfen die Entscheidung durch Neuladen erneut.
- FCTH und Psoydo fragen bei alten unbefristeten Entscheidungen erneut. Psoydo behält getrennte Freigaben für Analytics und Ads.
- Google-Übermittlungsgrundlagen mit Verweis auf Googles aktuelle Anbieterinformationen erläutert; kein Abschluss von Verträgen behauptet.
- Hostinganbieter vollständig benannt; Ablaufprüfung auch für Ablehnung und bei erneuter Zustimmung korrigiert.

## Vom Betreiber noch zu bestätigen

- Tatsächliche GA4-Aufbewahrung je Property (Nutzer-/Ereignisdaten, Zurücksetzen bei neuer Aktivität), Datenfreigaben, verknüpfte Ads-Produkte und erweiterte Messung. Konkrete serverseitige Löschfristen wurden nicht erfunden oder im Google-Konto geändert. Die Datenschutzerklärung bleibt in diesem Punkt zu vervollständigen.
- Bestand und Geltung der AV-Verträge mit Google, united-domains und dem jeweiligen Formulardienst; tatsächlich verwendete Übermittlungsgrundlagen.
- Ist ein Datenschutzbeauftragter bestellt? Falls ja, bestätigte Kontaktadresse in allen vier Datenschutzerklärungen ergänzen. Psoydo nennt bereits datenschutz@wescaleit.com.
- Aktueller Registerauszug: Registergericht, HRB, Vertretung und Aufsichtsrat. Keine ungeprüfte Änderung dieser Stammdaten.

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
