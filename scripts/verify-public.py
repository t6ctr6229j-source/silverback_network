"""Verify that the domain serves the uploaded version over valid HTTPS."""
import hashlib
import time
from pathlib import Path
from urllib.request import Request, urlopen

origin = 'https://www.silverback-network.com'
paths = ('index.html', 'datenschutz.html', 'impressum.html', 'analytics.js',
         'styles.css', 'robots.txt', 'sitemap.xml', 'assets/silverback-dark.png')
for path in paths:
    expected = hashlib.sha256((Path('dist') / path).read_bytes()).hexdigest()
    url = origin + ('/' if path == 'index.html' else '/' + path)
    for attempt in range(3):
        try:
            request = Request(url, headers={'User-Agent': 'Silverback-Deployment-Check', 'Cache-Control': 'no-cache'})
            with urlopen(request, timeout=20) as response:
                if not response.url.startswith(origin + '/'):
                    raise RuntimeError('Unexpected redirect: ' + response.url)
                if hashlib.sha256(response.read()).hexdigest() != expected:
                    raise RuntimeError('Public response does not match uploaded file: ' + path)
            print('PASS HTTPS and content:', path)
            break
        except Exception as error:
            if attempt == 2:
                raise SystemExit('Upload completed, but public verification failed: ' + str(error))
            time.sleep(5)

for url in ('http://silverback-network.com/', 'https://silverback-network.com/', 'http://www.silverback-network.com/'):
    with urlopen(Request(url, headers={'User-Agent': 'Silverback-Deployment-Check'}), timeout=20) as response:
        if response.url != origin + '/':
            raise SystemExit('Set the domain redirect to ' + origin + '/; currently: ' + response.url)
    print('PASS canonical redirect:', url)
print('Public Silverback website verified successfully.')
