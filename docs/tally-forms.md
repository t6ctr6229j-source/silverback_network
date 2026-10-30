# Silverback-Anfrageformular

Stand: 30. Oktober 2026.

Die Website verwendet genau ein veröffentlichtes Formular für Unternehmen und externe Experten:

- Gemeinsame Anfrage: https://tally.so/r/LDDoxJ (Formular `LDDoxJ`)
- Einstieg auf der Website: `/#anfrage-formular`
- Vorhandene Links `/#projekt-formular` und `/#experten-formular` bleiben als kompatible Anker am gemeinsamen Bereich erhalten.

Das iframe wird erst nach bewusster Aktivierung geladen. Deaktivieren entfernt das iframe; die Freigabe wird nicht dauerhaft gespeichert. Ein direkter Formularlink bleibt als Alternative verfügbar. Ein externes Embed-Skript wird nicht geladen. Eingehende Höhen- und Abschlussmeldungen werden gegen die tatsächliche iframe-Quelle und `https://tally.so` geprüft.

## Analytics

Eine Tally-Aktivierung ist keine Analytics-Zustimmung. Nur bei zusätzlicher gültiger Analytics-Zustimmung auf einem Produktionshost wird ein bestätigtes `Tally.FormSubmitted` des eingebundenen Formulars als `generate_lead` erfasst. Die Payload-ID wird nur im Arbeitsspeicher zur Deduplizierung verwendet. An GA4 gehen ausschließlich die feste Formular-ID, `method: tally` und die feste Ziel-Property. Keine Antworten, Kontaktdaten, Respondenten- oder Submission-IDs. Vor Zustimmung empfangene Abschlüsse werden nicht nachträglich übertragen.

Offizielle Event-Dokumentation: https://developers.tally.so/widgets/events

Automatisierte lokale Tests verwenden synthetische Meldungen; sie versenden keine Formulare. Die separaten öffentlichen Tally-Prüfungen lesen veröffentlichte Formulare und Einbettungen. Eine echte Zustellung oder Benachrichtigung wird damit nicht behauptet. Die GA4-Key-Event-Konfiguration erfolgt separat.

## Frühere Formulare

Diese veröffentlichten Formulare wurden durch die Zusammenführung auf der Website nicht gelöscht oder verändert:

- Frühere Projektanfrage: https://tally.so/r/pbgYgP
- Frühere Expertenvorstellung: https://tally.so/r/yPO8Od

Sie sind nicht mehr parallel in der produktiven Website eingebunden.
