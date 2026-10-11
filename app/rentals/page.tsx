import type { Metadata } from "next";
import Link from "next/link";
import { RentalCard } from "@/components/rental-card";
import { RentalSearch } from "@/components/rental-search";
import { isSupabaseConfigured, listRentalListings } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Homes for rent in Nairobi, Nakuru, Kisumu, Eldoret and Mombasa",
  description: "Browse rental homes in major Kenyan cities and around local universities. Ask the RentiSafe housing team to confirm availability.",
  alternates: { canonical: "/rentals" },
  openGraph: { title: "Find a rental home with RentiSafe", description: "Browse rental homes in Kenyan cities and university areas.", url: "/rentals" },
  twitter: { card: "summary", title: "Homes for rent with RentiSafe", description: "Browse listings and request a viewing." },
};

export default async function RentalsPage({ searchParams }: { searchParams: Promise<{ town?: string; area?: string; campus?: string; campus_search?: string; bedrooms?: string; maxRent?: string }> }) {
  const query = await searchParams;
  const bedrooms = query.bedrooms !== undefined && /^\d+$/.test(query.bedrooms) ? Number(query.bedrooms) : undefined;
  const maxRent = query.maxRent && /^\d+$/.test(query.maxRent) ? Number(query.maxRent) : undefined;
  const selectedCampus = query.campus_search?.trim() || (query.campus !== "Other" ? query.campus : undefined);
  const listings = await listRentalListings({ town: query.town, area: query.area, campus: selectedCampus, bedrooms, maxRent });
  return <section className="wrap" style={{ padding: "42px 0" }}>
    <span className="eyebrow">Homes for rent · Kenya</span><h1 style={{ fontSize: "2.8rem" }}>Find your next home</h1>
    <p className="lead">Browse homes managed by our housing team in Nairobi, Nakuru, Kisumu, Eldoret, Mombasa and university neighbourhoods.</p>
    <RentalSearch town={query.town} area={query.area} campus={query.campus} customCampus={query.campus_search} bedrooms={query.bedrooms} maxRent={query.maxRent} />
    <div className="section-head" style={{ marginTop: 30 }}><h2>{listings.length} {listings.length === 1 ? "home" : "homes"} available in search</h2></div>
    {listings.length ? <div className="rental-grid">{listings.map((listing) => <RentalCard key={listing.id} listing={listing} />)}</div> : <div className="card"><h2>{isSupabaseConfigured() ? "No matching homes just yet" : "Rental listings are being set up"}</h2><p>{isSupabaseConfigured() ? "Try a nearby neighbourhood or contact our housing team to tell us what you are looking for." : "Our team is preparing verified listings. Contact us to tell us your preferred town, area and budget."}</p><a className="btn" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000"}?text=${encodeURIComponent("Hi RentiSafe, I am looking for a rental home.")}`}>Ask the housing team</a></div>}
    <section className="section"><div className="card"><h2>Homes near universities</h2><p>We list homes around Kesses, Njoro, Kahawa, Juja, Chiromo and the Kisumu campus area as current vacancies are confirmed.</p><p>RentiSafe can arrange a viewing and a separate verification before you make a rental decision.</p></div></section>
  </section>;
}
