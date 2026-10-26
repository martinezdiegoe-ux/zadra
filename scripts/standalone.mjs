import fs from 'node:fs/promises';
import path from 'node:path';
const R=path.resolve(import.meta.dirname,'..');
const css=await fs.readFile(path.join(R,'assets/zadra.css'),'utf8');
const themeJS=await fs.readFile(path.join(R,'assets/zadra.js'),'utf8');
const pages={};
for(const file of (await fs.readdir(path.join(R,'preview'))).filter(x=>x.endsWith('.html')&&x!=='qa.html')){
 let html=await fs.readFile(path.join(R,'preview',file),'utf8');
 html=html.match(/<body>([\s\S]*)<\/body>/)[1];
 for(const asset of await fs.readdir(path.join(R,'assets'))){
  if(!asset.endsWith('.svg'))continue;
  const data='data:image/svg+xml;base64,'+(await fs.readFile(path.join(R,'assets',asset))).toString('base64');
  html=html.split('assets/'+asset).join(data);
 }
 html=html.replace('<a href="qa.html">Probar tamaños</a> · ','');
 pages[file]=html;
}
await fs.mkdir(path.join(R,'release'),{recursive:true});
const router=`const pages=${JSON.stringify(pages).replaceAll('<','\\u003c')};const container=document.getElementById('App');function show(name='index.html',anchor=''){container.innerHTML=pages[name]||pages['404.html'];document.dispatchEvent(new CustomEvent('shopify:section:load',{bubbles:true}));if(anchor)document.getElementById(anchor)?.scrollIntoView();else window.scrollTo(0,0);}show();document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;const href=link.getAttribute('href');if(!href||href.startsWith('mailto:')||href.startsWith('data:'))return;if(href.startsWith('#')){event.preventDefault();const id=href.slice(1);if(!document.getElementById(id))show('index.html',id);else document.getElementById(id).scrollIntoView();return;}const [name,hash]=href.split('#');if(pages[name]){event.preventDefault();show(name,hash);}});document.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();const status=event.target.querySelector('.form-feedback')||document.getElementById('LiveStatus');if(status){status.className='preview-feedback';status.textContent='Vista previa: esta operación requiere una tienda Shopify conectada.';}},true);`;
await fs.writeFile(path.join(R,'release/zadra-vista-previa.html'),`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>zadra · Vista previa</title><style>${css}.preview-note{font:11px/1.5 Arial;background:#17223b;color:#fff;padding:9px 20px;text-align:center}.preview-note a{text-decoration:underline;margin-left:6px}.preview-feedback{font-size:14px;color:#0066cc;padding:16px}</style></head><body><div id="App"></div><script>${router}</script><script>${themeJS}</script></body></html>`);
console.log('Standalone preview generated; all assets embedded, no shopping connection.');
