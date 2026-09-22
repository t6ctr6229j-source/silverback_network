# Silverback Network

Website für https://silverback-network.com, vorgesehen für Hosting bei United Domains.

## Website

`dist/` enthält die vollständige statische Website inklusive Bildern, Logos, Formularanbindung und SEO-Dateien. Zum Veröffentlichen wird der **Inhalt** von `dist/` in das Webroot geladen. Kein Node-Server und kein Build erforderlich.

## Stand

Freigegebenes Design: Aubergine #35243D, Limette #D7EF52 und Off-White #F5F3EB, inklusive Wort-Highlights. Tally-Formulare werden erst nach Aktivierung geladen.

## Vor dem Go-live

Siehe `docs/united-domains-go-live.md`. Insbesondere muss die Datenschutzerklärung von der bisherigen privaten Vorschau auf das tatsächliche United-Domains-Hosting angepasst werden. HTTPS/Weiterleitungen, Formularbenachrichtigungen und Browser-/Performanceprüfung stehen noch aus.

Es ist noch kein automatischer Upload zu United Domains eingerichtet. Zugangsdaten gehören ausschließlich in GitHub Actions Secrets, niemals in dieses Repository.
