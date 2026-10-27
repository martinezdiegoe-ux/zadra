import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const preview=path.join(root,'preview');
const schema=JSON.parse(await fs.readFile(path.join(root,'config/settings_schema.json'),'utf8'));
const saved=JSON.parse(await fs.readFile(path.join(root,'config/settings_data.json'),'utf8')).current;
const motionDefault=schema.flatMap(group=>group.settings||[]).find(setting=>setting.id==='motion_enabled')?.default;
const motionEnabled=saved.motion_enabled??motionDefault;
let pages=0;
for(const name of await fs.readdir(preview)){
 if(!name.endsWith('.html')||name==='qa.html')continue;
 const html=await fs.readFile(path.join(preview,name),'utf8');
 assert.match(html,/<meta name="robots" content="noindex">/,name+' must remain a demo');
 const hasMotionJS=html.includes('src="assets/zadra-motion.js"');
 const hasMotionCSS=html.includes('href="assets/zadra-motion.css"');
 assert.equal(hasMotionJS,!!motionEnabled,name+' motion script must follow theme settings');
 assert.equal(hasMotionCSS,!!motionEnabled,name+' motion stylesheet must follow theme settings');
 for(const match of html.matchAll(/(?:src|href)="(assets\/[^"?#]+)(?:[?#][^"]*)?"/g)){
  await fs.access(path.join(preview,match[1]));
 }
 for(const match of html.matchAll(/<script type="application\/(?:ld\+)?json"[^>]*>([\s\S]*?)<\/script>/g))JSON.parse(match[1]);
 pages++;
}
assert.ok(pages>=10,'Expected the storefront preview pages');
console.log(`Preview checks passed: ${pages} pages, assets, variant JSON and motion settings.`);
