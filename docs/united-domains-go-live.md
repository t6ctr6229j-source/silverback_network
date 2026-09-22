# Go-live: silverback-network.com

- Statische Dateien in `dist/`; Zielordner `silverback` relativ zum SFTP-Homeverzeichnis.
- GitHub Actions führt vor jedem Upload Syntax- und Browserprüfungen durch.
- Secrets: `UD_SFTP_HOST`, `UD_SFTP_USER`, `UD_SFTP_PASSWORD`; optional `UD_SFTP_KNOWN_HOSTS`.
- Der Upload verändert keine anderen Website-Verzeichnisse und löscht keine Remote-Dateien.
- United-Domains-Domainzuordnung auf `silverback` sowie SSL-Zertifikat und HTTP-/www-Weiterleitungen im Hosting prüfen.
- GA4 `G-RWGM8X6QGH` lädt nur nach Einwilligung auf der Produktionsdomain. Vorschauen senden keine Analytics-Daten.
- Datenschutzerklärung beschreibt Produktionshosting und Analytics. Hosting-/Google-Vertrags- und Aufbewahrungseinstellungen müssen den tatsächlichen Anbietervereinbarungen entsprechen.
- Nach Veröffentlichung: /, /datenschutz.html, /impressum.html, /analytics.js, /sitemap.xml und /robots.txt über HTTPS prüfen; in GA4 den Echtzeitbericht kontrollieren.
- Beide Tally-Formulare bleiben separat zustimmungspflichtig. Öffentliche Datenschutzlinks und Benachrichtigungen in Tally separat prüfen.
