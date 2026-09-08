"""Read-only audit of tracked public HTML pages and their internal links."""
import json, subprocess
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.assets=[]; self.ids=set(); self.h1=0; self.alt=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ('img','script') and a.get('src'): self.assets.append(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet': self.assets.append(a.get('href',''))
        if tag=='img' and 'alt' not in a: self.alt.append(a.get('src',''))

names=subprocess.check_output(['git','ls-files','*.html'],cwd=ROOT,text=True).splitlines()
names=[n for n in names if not n.startswith(('ads/','ads_launch/','output/','tmp/'))]
pages={}
for n in names:
    parser=Page();parser.feed((ROOT/n).read_text(encoding='utf-8'));pages[n]=parser
issues=[]
for n,p in pages.items():
    if p.h1!=1: issues.append([n,'h1 count',p.h1])
    for img in p.alt: issues.append([n,'missing image alt',img])
    for url in p.links+p.assets:
        u=urlsplit(url)
        if u.scheme or u.netloc or not u.path and not u.fragment: continue
        target=(ROOT / unquote(u.path.lstrip('/'))) if u.path.startswith('/') else (ROOT/n).parent / unquote(u.path)
        if not u.path: target=ROOT/n
        if target.is_dir(): target=target/'index.html'
        if not target.exists() and not target.suffix: target=target.with_suffix('.html')
        if not target.exists():
            if not u.path.startswith(('/api/','/.netlify/')): issues.append([n,'missing local target',url])
            continue
        rel=target.resolve().relative_to(ROOT).as_posix()
        if u.fragment and rel in pages and unquote(u.fragment) not in pages[rel].ids: issues.append([n,'missing anchor',url])
report={'pages':len(pages),'issues':issues}
print(json.dumps(report,ensure_ascii=False,indent=2))
