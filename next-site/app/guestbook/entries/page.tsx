import { redirect } from "next/navigation";
export default async function LegacyEntries({searchParams}:{searchParams:Promise<{after?:string}>}){const {after}=await searchParams;redirect("/tree/entries"+(after&&/^\d+$/.test(after)?"?after="+after:""));}
