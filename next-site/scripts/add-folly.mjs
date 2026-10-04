import { randomInt } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const [text, suppliedDate] = process.argv.slice(2);
const date = suppliedDate ?? new Date().toISOString().slice(0,10);
if (!text?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date) {
  console.error('Usage: npm run add:folly -- "Your new note" [YYYY-MM-DD]');
  process.exit(1);
}
const file = new URL("../content/folly.json", import.meta.url);
const entries = JSON.parse(await readFile(file,"utf8"));
const slug = text.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60) || "note";
let id=slug, suffix=2;
while(entries.some(entry=>entry.id===id)) id=`${slug}-${suffix++}`;
entries.push({id,text:text.trim(),date,shape:randomInt(5)});
await writeFile(file,JSON.stringify(entries,null,2)+"\n");
console.log(`Added leaf-${id}; its randomly chosen shape is saved with the note.`);
