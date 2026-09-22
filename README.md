# Silverback Network

Statische Website für https://silverback-network.com. Design: Aubergine, Limette und Offwhite.

## Website und Vorschau

`dist/` enthält die vollständige Website einschließlich aller Bilder und Logos. Kein Build oder Node-Server erforderlich. Lokal: `python -m http.server 8080 --directory dist`.

## Google Analytics

GA4-Mess-ID: `G-RWGM8X6QGH`. `dist/analytics.js` lädt Google ausschließlich nach Zustimmung und nur auf silverback-network.com bzw. www.silverback-network.com. In lokalen und ChatGPT-Vorschauen bleibt Analytics aus. Ablehnen, Zustimmen und Widerruf sind auf allen Seiten verfügbar. Auswahl und Analytics-Cookies sind auf höchstens 180 Tage begrenzt; Werbung und Google Signals werden nicht freigegeben. Änderungen der Auswahl werden zwischen offenen Tabs berücksichtigt. Tally wird unabhängig davon nur nach Aktivierung des jeweiligen Formulars geladen.

In der GA4-Verwaltung sind die organisatorischen Einstellungen (Auftragsverarbeitung, Datenaufbewahrung und Freigaben) durch den Property-Verantwortlichen zu prüfen. Diese Repository-Konfiguration ändert keine Google-Kontoeinstellungen. Den Eingang echter Ereignisse im Echtzeitbericht nach dem öffentlichen Launch prüfen.

## Deployment

Pushes nach `main` starten `.github/workflows/deploy-united-domains.yml`. Der Workflow prüft JavaScript und testet Einwilligung und responsives Layout im Browser. Erst danach wird der Inhalt von `dist/` per SFTP in den dedizierten Unterordner `silverback` des SFTP-Homeverzeichnisses übertragen. Vorhandene andere Dateien und Websites werden nicht gelöscht. Die Serverunterstützung für atomare SFTP-Umbenennungen wird vorausgesetzt.

Repository-Secrets: `UD_SFTP_HOST`, `UD_SFTP_USER`, `UD_SFTP_PASSWORD`. Optional `UD_SFTP_KNOWN_HOSTS` für einen vorab geprüften SSH-Hostschlüssel. Ohne diesen optionalen Wert wird der neue Server beim ersten Verbindungsaufbau akzeptiert. Zugangsdaten nie in Dateien oder Logs schreiben.

Bei United Domains muss silverback-network.com auf diesen Ordner zeigen; HTTPS muss dort aktiviert sein. Die Domain-Zuordnung wird durch den Datei-Upload nicht geändert. Details: `docs/united-domains-go-live.md`.
