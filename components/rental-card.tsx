import Link from "next/link";
import type { RentalListing } from "@/lib/types";

export function RentalCard({ listing }: { listing: RentalListing }) {
  return <article className="card rental-card">
    <div className="rental-illustration" role="img" aria-label={`Illustration of a ${listing.property_type.toLowerCase()} in ${listing.area}`}>
      <span>{listing.property_type}</span><span className="tag">{listing.status === "available" ? "Available" : "Let"}</span>
    </div>
    <div className="rental-card-body">
      <h2><Link href={`/rentals/${listing.slug}`}>{listing.title}</Link></h2>
      <p className="muted">{listing.area}, {listing.town}{listing.campus ? ` · Near ${listing.campus}` : ""}</p>
      <p className="rent-price">KES {listing.rent_amount.toLocaleString("en-KE")} <small>/ month</small></p>
      <p className="hint">Deposit: KES {listing.deposit_amount.toLocaleString("en-KE")} · {listing.bedrooms === 0 ? "Bedsitter" : `${listing.bedrooms} bedroom${listing.bedrooms > 1 ? "s" : ""}`}</p>
      <Link className="btn btn-outline" href={`/rentals/${listing.slug}`}>View home</Link>
    </div>
  </article>;
}
