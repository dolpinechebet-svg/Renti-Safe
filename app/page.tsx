import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "@/components/request-form";
import { towns } from "@/lib/content";
import { listRentalListings } from "@/lib/db";
import { RentalCard } from "@/components/rental-card";

export const metadata: Metadata = {
  title: "Find a home and verify before you send a deposit",
  description: "Browse homes for rent in Kenya and ask our housing team for a viewing or independent property verification.",
  alternates: { canonical: "/" },
  openGraph: { title: "RentiSafe | Find a home and verify before paying", description: "Find a rental home and request a viewing or an independent property check.", url: "/" },
  twitter: { card: "summary_large_image", title: "RentiSafe homes and verification", description: "Browse a home, arrange a viewing and verify before paying." },
};
export const dynamic = "force-dynamic";

const structuredData = [
  { "@context": "https://schema.org", "@type": "RealEstateAgent", name: "RentiSafe", url: process.env.NEXT_PUBLIC_SITE_URL || "https://rentisafe.co.ke", description: "Rental homes, viewings and independent property verification in Kenya." },
  { "@context": "https://schema.org", "@type": "Service", name: "Rental homes, viewings and property verification", provider: { "@type": "RealEstateAgent", name: "RentiSafe" }, areaServed: "Kenya", offers: [{ "@type": "Offer", price: "500", priceCurrency: "KES" }, { "@type": "Offer", price: "800", priceCurrency: "KES" }] },
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
    { "@type": "Question", name: "Can RentiSafe help me find a vacant house?", acceptedAnswer: { "@type": "Answer", text: "Yes. Browse the homes for rent and request a viewing. Our team will confirm current availability." } },
    { "@type": "Question", name: "Can RentiSafe verify a house before I pay?", acceptedAnswer: { "@type": "Answer", text: "Yes. Book a separate property check before deciding whether to rent." } },
    { "@type": "Question", name: "How much does verification cost?", acceptedAnswer: { "@type": "Answer", text: "KES 500 for an in town check or KES 800 for a live video call check." } },
    { "@type": "Question", name: "Does a green report guarantee a safe rental?", acceptedAnswer: { "@type": "Answer", text: "No. A verification report is an inspection at one point in time. Your final decision remains yours." } },
  ] },
];

export default async function HomePage() {
  const listings = await listRentalListings();
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <section className="wrap hero">
      <div>
        <span className="eyebrow">Homes and rental help · Kenya</span>
        <h1>Find your next home. Verify before you pay.</h1>
        <p className="lead">Browse vacant homes, ask our housing team to arrange a viewing, and book an independent property check before sending a deposit.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <Link className="btn" href="/rentals">Browse homes for rent</Link>
          <a className="btn btn-outline" href="#request">Verify a home · from KES 500</a>
        </div>
        <p className="hint" style={{ marginTop: 14 }}>We arrange rental viewings and verification. All payments remain between you and the property owner.</p>
      </div>
      <div id="request"><RequestForm /></div>
    </section>
    <section className="section wrap">
      <div className="section-head"><span className="eyebrow">Find a home</span><h2>Browse. View. Verify.</h2></div>
      <div className="cards">
        <article className="card"><div className="number">1</div><h3>Find a home that fits</h3><p>Search our rental listings by town, estate, university, property size and budget.</p></article>
        <article className="card"><div className="number">2</div><h3>Arrange a viewing</h3><p>Send your number and our housing team will confirm whether the home is still vacant.</p></article>
        <article className="card"><div className="number">3</div><h3>Verify before you pay</h3><p>Book a separate property inspection to check the home, caretaker and utility details.</p></article>
      </div>
    </section>
    <section className="section wrap" style={{ paddingTop: 0 }}>
      <div className="section-head"><h2>Homes for rent</h2><p className="muted">Search current listings in our major cities and university areas.</p></div>
      {listings.length ? <div className="rental-grid">{listings.slice(0, 3).map((listing) => <RentalCard key={listing.id} listing={listing} />)}</div> : <p className="card">New rental listings will appear here as our team confirms current vacancies.</p>}
      <p style={{ marginTop: 18 }}><Link className="btn btn-outline" href="/rentals">See all homes</Link></p>
    </section>
    <section className="section wrap" style={{ paddingTop: 0 }}>
      <div className="section-head"><h2>Verification in your town</h2><p className="muted">Availability depends on local agent coverage. Ask us before you pay.</p></div>
      <div className="cards">{towns.map((town) => <article key={town.slug} className="card"><h3><a href={`/verify/${town.slug}`}>{town.name}</a></h3><p>Checks around {town.estates.slice(0, 3).join(", ")} and nearby.</p></article>)}</div>
    </section>
    <section className="section wrap">
      <div className="card" style={{ background: "#f0eee8" }}><h2>Rental agency and verification</h2><p>RentiSafe acts as a housing agent for listed homes and also offers a separate point in time property verification. Confirm availability, rent and tenancy terms with our team. An inspection is not a guarantee, and your final decision is yours.</p><Link href="/terms">Read the terms and limitations</Link></div>
    </section>
  </>;
}
