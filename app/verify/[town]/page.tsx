import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestForm } from "@/components/request-form";
import { towns } from "@/lib/content";

export function generateStaticParams() {
  return towns.map((town) => ({ town: town.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ town: string }> }): Promise<Metadata> {
  const { town: slug } = await params;
  const town = towns.find((item) => item.slug === slug);
  if (!town) return {};
  return {
    title: `Verify a rental house in ${town.name}`,
    description: `A local rental verification before you send a deposit in ${town.name}. Checks around ${town.estates.slice(0, 3).join(", ")}.`,
    alternates: { canonical: `/verify/${town.slug}` },
    openGraph: { title: `Rental verification in ${town.name} | RentiSafe`, description: town.copy, url: `/verify/${town.slug}` },
    twitter: { card: "summary", title: `Verify a keja in ${town.name}`, description: town.copy },
  };
}

export default async function TownPage({ params }: { params: Promise<{ town: string }> }) {
  const { town: slug } = await params;
  const town = towns.find((item) => item.slug === slug);
  if (!town) notFound();
  return <section className="wrap" style={{ padding: "48px 0" }}>
    <span className="eyebrow">Rental verification · {town.name}</span><h1 style={{ fontSize: "3.2rem" }}>Verify a keja in {town.name}</h1>
    <p className="lead">{town.copy}</p>
    <p><strong>Nearby areas:</strong> {town.estates.join(" · ")}</p>
    <div className="grid2" style={{ alignItems: "start" }}>
      <div className="stack"><div className="card"><h2>Homes in {town.name}</h2><p>Browse rentals managed by our housing team around {town.estates.join(", ")}. Ask us to confirm the current vacancy and arrange a viewing.</p><Link className="btn btn-outline" href={`/rentals?town=${encodeURIComponent(town.name)}`}>Browse homes in {town.name}</Link></div>
        <div className="card"><h2>Verify before paying</h2><p>An independent local verifier can check whether the home exists and is vacant, compare caretaker and utility details, and look for duplicate listings. Rental viewings and property verification are separate services.</p></div>
        <div className="card"><h2>Questions from renters</h2>{town.faqs.map((faq) => <details key={faq} style={{ padding: "9px 0", borderBottom: "1px solid #ebe6dc" }}><summary>{faq.split("?")[0]}?</summary><p>{faq.substring(faq.indexOf("?") + 1).trim()}</p></details>)}</div>
      </div>
      <RequestForm />
    </div>
  </section>;
}
