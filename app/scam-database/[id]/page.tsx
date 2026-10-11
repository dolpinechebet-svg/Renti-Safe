import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DisputeForm } from "@/components/dispute-form";
import { listPublishedFlags } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const flags = await listPublishedFlags();
  const flag = flags.find((item) => item.id === id);
  return {
    title: flag ? "Published rental warning entry" : "Entry unavailable",
    description: flag ? "Review a masked rental warning entry and submit a challenge." : "This entry is not publicly available.",
    robots: { index: Boolean(flag), follow: Boolean(flag) },
  };
}

export default async function ScamEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flags = await listPublishedFlags();
  const flag = flags.find((item) => item.id === id);
  if (!flag) notFound();
  const digits = flag.landlord_phone.replace(/\D/g, "");
  const masked = digits.length >= 7 ? `${digits.slice(0, 4)} XXX ${digits.slice(-3)}` : "••• XXX •••";
  return <section className="wrap" style={{ padding: "42px 0" }}>
    <span className="eyebrow">Published · phone masked</span><h1 style={{ fontSize: "2.5rem" }}>Rental warning entry</h1>
    <div className="grid2"><article className="card"><h2 style={{ fontSize: "1.5rem" }}>{masked}</h2><p>{flag.reason}</p><p className="hint">Published {new Date(flag.flagged_at).toLocaleDateString("en-KE")}. This is a reviewed report, not a legal finding. No flags found is not proof of safety.</p><Link href="/scam-database">Back to search</Link></article><DisputeForm flagId={flag.id} /></div>
  </section>;
}
