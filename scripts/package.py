from pathlib import Path
import zipfile,hashlib,json
R=Path(__file__).resolve().parents[1]
out=R/'release';out.mkdir(exist_ok=True)
dest=out/'zadra-shopify-theme-1.1.0.zip'
entries=[]
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as z:
 for directory in ['assets','config','layout','locales','sections','snippets','templates']:
  for p in sorted((R/directory).rglob('*')):
   if p.is_file() and not p.name.startswith('.'):
    z.write(p,p.relative_to(R));entries.append(str(p.relative_to(R)))
with zipfile.ZipFile(dest) as z:
 assert z.testzip() is None
 assert 'layout/theme.liquid' in z.namelist()
 assert all(n.split('/')[0] in ['assets','config','layout','locales','sections','snippets','templates'] for n in z.namelist())
sha=hashlib.sha256(dest.read_bytes()).hexdigest()
(out/'SHA256SUMS').write_text(f'{sha}  {dest.name}\n')
print(json.dumps({'zip':str(dest),'files':len(entries),'bytes':dest.stat().st_size,'sha256':sha},indent=2))
