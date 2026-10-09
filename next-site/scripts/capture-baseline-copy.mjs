import {execFileSync} from "node:child_process";
import {writeFileSync} from "node:fs";
import {authoredCopy} from "./copy-inventory.mjs";
const baseline="be6b15d93f2bae259a52e7b80d98a51018edb01d";
const files=execFileSync("git",["ls-tree","-r","--name-only",baseline],{encoding:"utf8",cwd:".."}).split("\n").filter(x=>/^next-site\/(app|components)\/.*\.tsx$/.test(x));
const inventory=Object.fromEntries(files.map(file=>[file,authoredCopy(execFileSync("git",["show",`${baseline}:${file}`],{encoding:"utf8"}),file)]).filter(([,copy])=>copy.length));
writeFileSync("docs/reimagining/authored-copy.json",JSON.stringify({baseline,inventory},null,2)+"\n");
console.log(`Captured authored text from ${Object.keys(inventory).length} baseline files.`);
