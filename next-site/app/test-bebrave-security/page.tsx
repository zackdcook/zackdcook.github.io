import { notFound } from "next/navigation";
import { beBraveTestMode } from "@/lib/bebrave-server";
import { BeBraveSecurityQAControl } from "@/components/bebrave-security-qa";

export default function BeBraveSecurityQA(){
  if(!beBraveTestMode())notFound();
  return <div className="shell page-wrap prose-page">
    <h1>BeBrave anti-abuse QA</h1>
    <p>This uses disposable blank sessions in the isolated test database. It checks simultaneous identities, timer starts, blank retries, token replay and expired deadlines.</p>
    <BeBraveSecurityQAControl/>
  </div>;
}
