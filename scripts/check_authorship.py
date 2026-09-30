"""Keep visible article authorship, dates and machine-readable metadata aligned."""
import json,re
from pathlib import Path
from html.parser import HTMLParser
from datetime import date
ROOT=Path(__file__).resolve().parents[1]
PROFILE='https://wescaleit.com/florian-zegar'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.times=[];self.authors=[];self.h1=0;self.credit=0;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='time':self.times.append(a.get('datetime'))
  if tag=='a' and a.get('rel')=='author':self.authors.append(a.get('href'))
  if tag=='h1':self.h1+=1
  if 'author-credit' in a.get('class','').split():self.credit+=1
count=0
for path in ROOT.rglob('*.html'):
 if any(part in ['docs','node_modules','.git','previous-search-release'] for part in path.relative_to(ROOT).parts):continue
 text=path.read_text();page=Page(text)
 for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S):
  data=json.loads(raw)
  for node in data.get('@graph',[data]):
   if node.get('@type') not in ['Article','BlogPosting','TechArticle']:continue
   count+=1
   assert page.h1==1 and page.credit==1,(path,'heading/byline')
   author=node['author']
   assert author['@type']=='Person' and author['name']=='Florian Zegar',path
   assert author['@id']==PROFILE+'#person' and author['url']==PROFILE,path
   assert page.authors==[PROFILE],(path,'visible author link')
   assert author['description'] in text,(path,'biography mismatch')
   published=node['datePublished'];modified=node['dateModified']
   assert published in page.times and modified in page.times,(path,'visible date mismatch')
   assert date.fromisoformat(published)<=date.fromisoformat(modified)<=date.today(),(path,'date order')
   for prop,value in [('published_time',published),('modified_time',modified),('author',PROFILE)]:
    assert f'<meta property="article:{prop}" content="{value}">' in text,(path,'Open Graph mismatch')
profile=ROOT/'florian-zegar.html'
if profile.exists():
 text=profile.read_text();assert '"ProfilePage"' in text and PROFILE+'#person' in text
 assert 'florian-zegar' in (ROOT/'scripts/build_release.py').read_text()
print(f'Authorship passed: {count} articles; visible Person identity, biography, dates and Open Graph agree.')
