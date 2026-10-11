import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RentalInquiryForm } from "@/components/rental-inquiry-form";
import { getRentalBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getRentalBySlug(slug);
  if (!listing) return { title: "Rental home unavailable", robots: { index: false, follow: false } };
  return {
    title: `${listing.property_type} for rent in ${listing.area}, ${listing.town}`,
    description: `${listing.title}. KES ${listing.rent_amount.toLocaleString("en-KE")} monthly. Ask RentiSafe to confirm availability.`,
    alternates: { canonical: `/rentals/${listing.slug}` },
    robots: listing.status === "available" ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { title: `${listing.title} | RentiSafe`, description: `Rental home in ${listing.area}, ${listing.town}.`, url: `/rentals/${listing.slug}` },
    twitter: { card: "summary", title: listing.title, description: `Rental home in ${listing.area}, ${listing.town}.` },
  };
}

export default async function RentalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getRentalBySlug(slug);
  if (!listing) notFound();
  return <section className="wrap" style={{ padding: "42px 0" }}>
    <p><Link href="/rentals">← All rental homes</Link></p>
    <div className="grid2" style={{ alignItems: "start" }}>
      <article className="stack">
        <div className="rental-illustration rental-illustration-large"><span>{listing.property_type}</span><span className="tag">{listing.status === "available" ? "Available" : "Let"}</span></div>
        <div className="card">
          <span className="eyebrow">{listing.area}, {listing.town}</span><h1 style={{ fontSize: "2.6rem" }}>{listing.title}</h1>
          <p className="rent-price">KES {listing.rent_amount.toLocaleString("en-KE")} <small>/ month</small></p>
          <p>Deposit: KES {listing.deposit_amount.toLocaleString("en-KE")}</p>
          <p>{listing.description}</p>
          <p><strong>Property:</strong> {listing.property_type} · {listing.bedrooms === 0 ? "Bedsitter" : `${listing.bedrooms} bedroom${listing.bedrooms > 1 ? "s" : ""}`}</p>
          {listing.campus && <p><strong>Nearby campus:</strong> {listing.campus}</p>}
          <h2 style={{ fontSize: "1.2rem" }}>Home details</h2>
          <ul>{listing.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}</ul>
          {listing.status !== "available" && <p className="alert">This home has been marked as let and is no longer taking viewing requests.</p>}
          <Link className="btn btn-outline" href="/scam-database">Check a landlord number</Link>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href={`/?location=${encodeURIComponent(`${listing.property_type} in ${listing.area}`)}&town=${encodeURIComponent(listing.town)}#request`}>Verify this home</Link>
          </div>
          <p className="hint">Ask to view and confirm the terms directly with the housing team. You may request a separate property verification before paying a deposit.</p>
        </div>
      </article>
      {listing.status === "available" ? <RentalInquiryForm listingId={listing.id} title={listing.title} /> : <div className="card"><h2>This home is no longer available</h2><Link href="/rentals">Browse other homes</Link></div>}
    </div>
  </section>;
}
