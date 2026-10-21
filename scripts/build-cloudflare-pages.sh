#!/bin/sh
# Create a deterministic static Cloudflare Pages build without Apache-specific configuration.
set -eu
cd "$(dirname "$0")/.."
test -f dist/index.html
test -f dist/_headers
rm -rf cf-dist
mkdir cf-dist
cp -R dist/. cf-dist/
rm -f cf-dist/.htaccess
test -s cf-dist/index.html
test -s cf-dist/_headers
test ! -e cf-dist/.htaccess
printf 'Prepared static Cloudflare Pages build with %s files.\n' "$(find cf-dist -type f | wc -l)"
