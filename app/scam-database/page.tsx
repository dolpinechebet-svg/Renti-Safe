import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedFlags } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Landlord scam database search",
  description: "Search reviewed, published RentiSafe rental warning entries. No flags found is not proof of safety.",
  alternates: { canonical: "/scam-database" },
  robots: { index: true, follow: true },
  openGraph: { title: "RentiSafe scam database", description: "Search published, masked rental warning entries.", url: "/scam-database" },
  twitter: { card: "summary", title: "RentiSafe scam database", description: "Search published rental warning entries." },
};

function mask(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "••• XXX •••";
  return `${digits.slice(0, 4)} XXX ${digits.slice(-3)}`;
}

export default async function ScamDatabasePage({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  const { phone = "" } = await searchParams;
  const publishedFlags = await listPublishedFlags();
  const query = phone.replace(/\D/g, "");
  const flags = publishedFlags.filter((flag) => !query || flag.landlord_phone.replace(/\D/g, "").includes(query.slice(-7)));
  return <section className="wrap" style={{ padding: "42px 0" }}>
    <span className="eyebrow">Public · reviewed entries only</span><h1 style={{ fontSize: "2.8rem" }}>Scam database</h1>
    <p className="lead">Search for a published rental warning. Phone numbers are masked to protect privacy.</p>
    <form method="get" className="form-card stack" style={{ maxWidth: 590 }}>
      <div className="field"><label htmlFor="phone">Landlord phone number</label><input id="phone" name="phone" type="tel" defaultValue={phone} placeholder="07XX XXX XXX" /></div>
      <button className="btn">Search published flags</button>
    </form>
    {!flags.length ? <div className="card" style={{ marginTop: 18 }}>
      <strong>{query ? "No published flags found for that search." : "No public entries to show yet."}</strong>
      <p>No flags found is not proof of safety. Verify the house, the caretaker and all payment details independently.</p>
    </div> : <div className="stack" style={{ marginTop: 22 }}>{flags.map((flag) => <article className="card" key={flag.id}>
      <h2 style={{ fontSize: "1.4rem" }}>{mask(flag.landlord_phone)}</h2><p>{flag.reason}</p>
      <small className="muted">Published warning · {new Date(flag.flagged_at).toLocaleDateString("en-KE")}</small><p><Link href={`/scam-database/${flag.id}`}>Challenge or read this entry →</Link></p>
    </article>)}</div>}
    <p className="hint" style={{ marginTop: 22 }}>Entries are not legal findings. <Link href="/scam-database-policy">Read the database policy</Link>.</p>
  </section>;
}
