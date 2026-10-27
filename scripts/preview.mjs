// Render actual theme sections with clearly separated fixtures. Never processes orders.
import { Liquid } from 'liquidjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const R=path.resolve(import.meta.dirname,'..'),D=path.join(R,'preview');
await fs.mkdir(D,{recursive:true});
await fs.cp(path.join(R,'assets'),path.join(D,'assets'),{recursive:true});
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const engine=new Liquid({root:path.join(R,'snippets'),extname:'.liquid',strictFilters:false,strictVariables:false});
// Use Shopify's saved settings on top of schema defaults, including new patch settings.
const settingsSchema=JSON.parse(await fs.readFile(path.join(R,'config/settings_schema.json'),'utf8'));
const settingsData=JSON.parse(await fs.readFile(path.join(R,'config/settings_data.json'),'utf8'));
const themeSettings=Object.fromEntries(settingsSchema.flatMap(group=>group.settings||[]).filter(setting=>'default' in setting).map(setting=>[setting.id,setting.default]));
Object.assign(themeSettings,settingsData.current);
engine.registerFilter('json',x=>JSON.stringify(x??null));
engine.registerFilter('asset_url',x=>'assets/'+x);
engine.registerFilter('stylesheet_tag',href=>`<link rel="stylesheet" href="${esc(href)}">`);
engine.registerFilter('image_url',(x,...args)=>typeof x==='string'?x:x?.src||'');
engine.registerFilter('image_tag',(src,...args)=>{
 const a=Object.fromEntries(args.filter(Array.isArray));delete a.widths;delete a.sizes;
 return `<img src="${esc(src)}" ${Object.entries(a).filter(([k,v])=>v!=null).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>`;
});
engine.registerFilter('money',n=>n==null?'':new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(n/100));
engine.registerFilter('placeholder_svg_tag',()=>'<div class="muted">Sin imagen</div>');
engine.registerFilter('structured_data',p=>JSON.stringify({'@context':'https://schema.org','@type':'Product',name:p.title}));
engine.registerFilter('default_pagination',()=>'<span aria-current="page">1</span>');
engine.registerFilter('default_errors',()=> '');
const image={src:'assets/object-laptop.svg',alt:'Ilustración conceptual, producto de prueba'},image2={src:'assets/object-audio.svg',alt:'Segunda imagen de prueba'};
const variants=[{id:101,title:'Gris · ejemplo',price:10000,compare_at_price:null,available:true,featured_image:image,quantity_rule:{min:1,increment:1,max:3}},{id:102,title:'Azul · ejemplo',price:12000,compare_at_price:14000,available:true,featured_image:image2,quantity_rule:{min:1,increment:1,max:null}},{id:103,title:'Agotado · ejemplo',price:12000,available:false,quantity_rule:{min:1,increment:1}}];
function product(id,title,art='laptop'){
 const featured_image={src:'assets/object-'+art+'.svg',alt:'Ilustración conceptual · demostración'};
 return {id,title,url:'product.html',vendor:'Datos de prueba',type:'Demostración',price:10000,price_varies:true,compare_at_price:0,available:true,featured_image,selected_or_first_available_variant:variants[0],variants,has_only_default_variant:false,description:'<p>Contenido de demostración para verificar el tema. No constituye una oferta comercial.</p>',media:[{...featured_image,media_type:'image'},{...image2,media_type:'image'}],metafields:{custom:{subtitle:{value:'Referencia de diseño. No está a la venta.'},material:{value:'Dato de ejemplo'},dimensions:{value:'Sin especificar'},connectivity:{value:'Dato de ejemplo'},warranty:{value:'A definir'}}}};
}
const products=[product(1,'Producto de prueba A'),product(2,'Producto de prueba B','audio'),product(3,'Producto de prueba C','watch'),product(4,'Producto de prueba D','display')];
const collection={title:'Colección de prueba',url:'catalog.html',products,products_count:products.length,description:'<p>Datos ficticios, exclusivamente para verificar el tema.</p>',filters:[{type:'list',label:'Disponibilidad',active_values:[],values:[{param_name:'filter.v.availability',value:'1',label:'Disponible',count:4}]}],sort_options:[{value:'manual',name:'Destacados'},{value:'price-ascending',name:'Menor precio'}],default_sort_by:'manual'};
const base={settings:themeSettings,shop:{name:'zadra',policies:[]},cart:{item_count:0,currency:{iso_code:'ARS'}},localization:{country:{name:'Argentina'}},request:{locale:{iso_code:'es'},page_type:'index'},routes:{root_url:'index.html',all_products_collection_url:'catalog.html',collections_url:'collections.html',search_url:'search.html',cart_url:'cart.html'},template:{suffix:''},form:{},paginate:{pages:1},page:{title:'Contactanos',content:'<p>Esta vista previa no envía mensajes.</p>'},product:products[0],collection,search:{performed:true,terms:'ejemplo',results:products,results_count:4,filters:[],sort_options:collection.sort_options}};
function source(raw){
 return raw.replace(/{%\s*schema\s*%}[\s\S]*?{%\s*endschema\s*%}/g,'').replace(/{%\s*form\s+([^%]+)%}/g,(_,args)=>`<form method="get" action="#" ${args.includes('product')?'class="product-form" id="ProductForm"':'class="preview-only-form"'}>`).replace(/{%\s*endform\s*%}/g,'</form>').replace(/{%\s*paginate\s+[^%]+%}/g,'').replace(/{%\s*endpaginate\s*%}/g,'');
}
async function renderSection(type,settings={},blocks={},context={}){
 const raw=await fs.readFile(path.join(R,'sections',type+'.liquid'),'utf8');
 const match=raw.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
 const schema=JSON.parse(match[1]);
 const defaults=Object.fromEntries(schema.settings.filter(x=>'default'in x).map(x=>[x.id,x.default]));
 const resolvedBlocks=Object.entries(blocks).map(([id,b])=>{const def=schema.blocks?.find(x=>x.type===b.type);return {id,...b,settings:{...Object.fromEntries((def?.settings||[]).filter(x=>'default'in x).map(x=>[x.id,x.default])),...b.settings}};});
 return engine.parseAndRender(source(raw),{...base,...context,section:{id:type,settings:{...defaults,...settings},blocks:resolvedBlocks}});
}
const head=await renderSection('header'),foot=await renderSection('footer');
const note=`<aside class="preview-note">VISTA PREVIA · Contenido demostrativo · Sin conexión a Shopify ni compras reales. <a href="qa.html">Probar tamaños</a> · <a href="catalog.html">Catálogo</a> · <a href="product.html">Ficha</a> · <a href="compare.html">Comparador</a> · <a href="cart.html">Bolsa</a> · <a href="search.html">Buscador</a> · <a href="contact.html">Contacto</a></aside>`;
const fixtureScript=`<script>document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();const status=e.target.querySelector('.form-feedback')||document.getElementById('LiveStatus');status.className='preview-feedback';status.textContent='Vista previa: esta operación requiere una tienda Shopify conectada.';},true);</script>`;
// Render the actual layout as well as sections. Rebuilding a second <head> here
// silently omitted patch assets (for example, the motion stylesheet and script).
const layout=(await fs.readFile(path.join(R,'layout/theme.liquid'),'utf8'))
 .replace(/{%\s*sections\s+'header-group'\s*%}/g,'{{ preview_header }}')
 .replace(/{%\s*sections\s+'footer-group'\s*%}/g,'{{ preview_footer }}')
 .replace(/<body>/,'<body>{{ preview_note }}');
const previewHeader=`<meta name="robots" content="noindex"><style>.preview-note{font:11px/1.5 Arial;background:#17223b;color:#fff;padding:9px 20px;text-align:center}.preview-note a{text-decoration:underline;margin-left:6px}.preview-feedback{display:block!important;font-size:14px;color:#0066cc;padding:16px}.site-header{top:0}</style>${fixtureScript}`;
async function page(name,body){
 const html=await engine.parseAndRender(layout,{...base,current_page:1,page_title:'Vista previa',canonical_url:name,content_for_header:previewHeader,content_for_layout:body,preview_header:head,preview_footer:foot,preview_note:note});
 await fs.writeFile(path.join(D,name),html);
}
const index=JSON.parse(await fs.readFile(path.join(R,'templates/index.json'),'utf8'));let home='';
for(const id of index.order){const s=index.sections[id];home+=await renderSection(s.type,s.settings,s.blocks||{});}
await page('index.html',home);
await page('catalog.html',await renderSection('main-collection'));
await page('product.html',await renderSection('main-product'));
await page('compare.html',await renderSection('comparison',{collection,title:'Compará los detalles.'},index.sections.compare.blocks));
await page('cart.html',await renderSection('main-cart'));
const item={key:'fixture',url:'product.html',url_to_remove:'cart.html',image,product:products[0],variant:variants[0],quantity:2,final_line_price:20000,original_line_price:20000,properties:[]};
await page('cart-filled.html',await renderSection('main-cart',{},{},{cart:{item_count:2,items:[item],currency:{iso_code:'ARS'},total_price:20000,note:'',taxes_included:true}}));
await page('search.html',await renderSection('main-search'));
await page('contact.html',await renderSection('main-contact'));
await page('collections.html','<section class="shell section"><h1>Colecciones.</h1><p><a class="text-link" href="catalog.html">Ver colección de demostración ↗</a></p></section>');
await page('empty.html',await renderSection('main-collection',{},{},{collection:{...collection,products:[],products_count:0}}));
await page('404.html',await renderSection('main-404'));
await fs.writeFile(path.join(D,'qa.html'),`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>zadra · revisión responsive</title><style>body{margin:0;font:14px Arial;background:#ddd}header{padding:14px;background:white;display:flex;gap:20px;flex-wrap:wrap}label{display:flex;gap:8px;align-items:center}#stage{overflow:auto;padding:16px}iframe{border:0;background:white;display:block;margin:auto;max-width:none}button,select{padding:8px}</style></head><body><header><strong>zadra · revisión responsive</strong><label>Ancho <select id="width">${[320,375,390,768,1024,1440].map(w=>'<option>'+w+'</option>').join('')}</select></label><label>Página <select id="page">${['index','catalog','product','compare','cart','cart-filled','search','contact','empty','404'].map(n=>'<option>'+n+'</option>').join('')}</select></label><button id="check">Verificar desbordamientos</button><output id="result"></output></header><div id="stage"><iframe title="Vista de zadra" id="view" width="320" height="900" src="index.html"></iframe></div><script>const frame=document.getElementById('view');document.getElementById('width').onchange=e=>frame.width=e.target.value;document.getElementById('page').onchange=e=>frame.src=e.target.value+'.html';document.getElementById('check').onclick=()=>{const d=frame.contentDocument;document.getElementById('result').textContent='Ancho '+d.documentElement.clientWidth+' · Contenido '+d.documentElement.scrollWidth+(d.documentElement.scrollWidth>d.documentElement.clientWidth?' · REVISAR':' · OK');};</script></body></html>`);
console.log('Preview built from actual Liquid sections, with labelled local fixtures.');
