/** Offline administrator tool. Emits private distribution CSV + verifier-only SQL.
 * Run: node --import tsx scripts/issue-legendary-codes.ts /private/output/directory
 * Never writes into the repository and never prints the plaintext codes. */
import {mkdirSync,writeFileSync,existsSync,realpathSync} from "node:fs";
import {resolve,relative} from "node:path";
import {createLegendaryCode} from "../lib/bebrave/legendary-code";

const destination=process.argv[2];
if(!destination)throw new Error("Supply a private output directory outside the repository.");
mkdirSync(resolve(destination),{recursive:true,mode:0o700});
const directory=realpathSync(resolve(destination));
const repository=resolve(import.meta.dirname,"../..");
if(!relative(repository,directory).startsWith(".."))throw new Error("Codes must stay outside the repository.");
const csv=resolve(directory,"zackdcook-legendary-codes-private.csv");
const sql=resolve(directory,"legendary-verifiers.sql");
if(existsSync(csv)||existsSync(sql))throw new Error("Existing issuance found; refuse to replace or regenerate codes.");
const codes=Array.from({length:50},createLegendaryCode);
if(new Set(codes.map(x=>x.code)).size!==50)throw new Error("Duplicate code; abort issuance.");
writeFileSync(csv,"identifier,unlock_code,default_effect,test_project\n"+codes.map(x=>`${x.id},${x.code},will-o-wisp-v1,qkkgcoejkqvthbjcldcw`).join("\n")+"\n",{mode:0o600,flag:"wx"});
const values=codes.map(x=>`('${x.id}','${x.digest}','immersive-world-2026-10-09')`).join(",\n");
writeFileSync(sql,`begin;\ninsert into private.bebrave_legendary_codes(id,code_digest,campaign) values\n${values};\ncommit;\n`,{mode:0o600,flag:"wx"});
console.log("Created 50 private codes and verifier-only registration SQL; no database writes performed.");
