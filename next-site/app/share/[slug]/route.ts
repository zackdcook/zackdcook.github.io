import { shareRecords } from "@/lib/page-metadata";
import { socialImage } from "@/lib/social-image";

export function generateStaticParams() { return shareRecords.map(record => ({ slug: record.id })); }
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = shareRecords.find(record => record.id === slug);
  if (!record) return new Response("Not found", { status: 404 });
  return socialImage(record);
}
