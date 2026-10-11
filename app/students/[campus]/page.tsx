import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestForm } from "@/components/request-form";
import { campuses } from "@/lib/content";

export function generateStaticParams() {
  return campuses.map((campus) => ({ campus: campus.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ campus: string }> }): Promise<Metadata> {
  const { campus: slug } = await params;
  const campus = campuses.find((item) => item.slug === slug);
  if (!campus) return {};
  return {
    title: `Verified bedsitters near ${campus.name}`,
    description: `Looking for student housing near ${campus.name}, ${campus.location}? Ask for an independent rental check before sending a deposit.`,
    alternates: { canonical: `/students/${campus.slug}` },
    openGraph: { title: `Student rentals near ${campus.name} | RentiSafe`, description: `Verify a bedsitter near ${campus.name}, ${campus.location}.` },
    twitter: { card: "summary", title: `Student keja checks near ${campus.name}`, description: `Check a rental near campus before sending a deposit.` },
  };
}

export default async function StudentPage({ params }: { params: Promise<{ campus: string }> }) {
  const { campus: slug } = await params;
  const campus = campuses.find((item) => item.slug === slug);
  if (!campus) notFound();
  return <section className="wrap" style={{ padding: "48px 0" }}>
    <span className="eyebrow">Student housing · {campus.town}</span>
    <h1 style={{ fontSize: "3rem" }}>Verified bedsitters near {campus.name}, {campus.location}</h1>
    <p className="lead">Starting campus? Don&apos;t send a deposit for a room you haven&apos;t checked. Ask a local verifier to visit a bedsitter around {campus.location}.</p>
    <div className="grid2" style={{ alignItems: "start" }}>
      <div className="stack"><article className="card"><h2>Student keja checklist</h2><ul><li>View the exact room advertised.</li><li>Confirm who is allowed to collect rent.</li><li>Check whether the unit is vacant and utility details match.</li><li>Never treat a photo of an ID or a GREEN result as a guarantee.</li></ul><Link className="btn btn-outline" href={`/rentals?town=${encodeURIComponent(campus.town)}&campus=${encodeURIComponent(campus.name)}`}>Browse homes near campus</Link></article>
        <p className="hint">RentiSafe helps tenants find and view rental homes. We do not own every home we list.</p></div>
      <RequestForm />
    </div>
  </section>;
}
