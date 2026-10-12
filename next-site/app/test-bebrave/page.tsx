import {notFound} from "next/navigation";
import {BeBraveBenchmark} from "@/components/bebrave-benchmark";
import {beBraveTestMode} from "@/lib/bebrave-server";

export const metadata={title:"Be Brave · Browser QA",robots:{index:false,follow:false}};
export default function BeBraveBenchmarkPage(){
  if(!beBraveTestMode())notFound();
  return <BeBraveBenchmark/>;
}
