import { redirect } from "next/navigation";
export default async function Guestbook({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  redirect("/tree" + (id && /^[a-f0-9-]{36}$/i.test(id) ? "?id=" + id : ""));
}
