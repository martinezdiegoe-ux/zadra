import { check } from '@shopify/theme-check-node';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const offenses=await check(root);
for(const o of offenses)console.log(`${o.severity===0?'ERROR':'WARN'} ${o.check}: ${o.message} (${o.uri}:${o.start.line+1})`);
for(const name of await readdir(resolve(root,'templates'))){
 if(!name.endsWith('.json'))continue;
 const template=JSON.parse(await readFile(resolve(root,'templates',name),'utf8'));
 for(const id of template.order)if(!template.sections[id])throw new Error(`Missing section ${id} in ${name}`);
 for(const section of Object.values(template.sections))await readFile(resolve(root,'sections',section.type+'.liquid'));
}
console.log(`Theme Check: ${offenses.length} observaciones. Plantillas JSON y referencias verificadas.`);
if(offenses.some(o=>o.severity===0))process.exitCode=1;
