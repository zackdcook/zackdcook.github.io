"use client";

import { useRef, useState } from "react";

export function BeBraveSecurityQAControl(){
  const running=useRef(false);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<Record<string,unknown>|null>(null);
  async function run(){
    if(running.current)return;
    running.current=true;setBusy(true);setResult(null);
    try{
      const response=await fetch("/api/bebrave/test/security",{method:"POST"});
      const data=await response.json();
      setResult(data);
    }catch{
      setResult({passed:false,error:"The test response could not be loaded."});
    }finally{running.current=false;setBusy(false);}
  }
  return <section aria-label="Anti-abuse checks" aria-busy={busy}>
    <button className="button" type="button" onClick={run} disabled={busy}>{busy?"Checking…":"Run anti-abuse checks"}</button>
    <p role="status">{busy?"Running checks on the isolated test database…":result?result.passed?"All deployed anti-abuse checks passed.":"The checks found a problem.":"Ready to test."}</p>
    {result?<pre aria-label="QA results" style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(result,null,2)}</pre>:null}
  </section>;
}
