import { notFound } from "next/navigation";
import { beBraveTestMode } from "@/lib/bebrave-server";

export default function BeBraveSecurityQA(){
  if(!beBraveTestMode())notFound();
  return <main className="shell page-wrap prose-page">
    <h1>BeBrave anti-abuse QA</h1>
    <p>This uses disposable blank sessions in the isolated test database. It checks simultaneous identities, timer starts, blank retries, token replay and expired deadlines.</p>
    <form action="/api/bebrave/test/security" method="post"><button className="button" type="submit">Run anti-abuse checks</button></form>
  </main>;
}
