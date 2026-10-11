import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service · DRAFT",
  description: "Draft terms for RentiSafe rental verification services in Kenya.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <article className="wrap policy">
    <span className="eyebrow">DRAFT · Legal review required</span><h1>Terms of service</h1>
    <p className="lead">Last updated: 11 October 2026. This draft is not legal advice and must be reviewed by a Kenyan lawyer before launch.</p>
    <h2>1. What RentiSafe does</h2><p>RentiSafe acts as a housing agent for homes listed by our team and arranges viewings with prospective tenants. We also offer a separate property verification service. We may advertise, market and facilitate rentals with the authority of the property owner or their representative. <strong>We do not own every listed home.</strong> A rental listing is not a guarantee of availability. Rental deposits, rent and any agency fees are not collected through this prototype. Ask for and agree to the tenancy terms and any charges before paying a property owner.</p>
    <h2>2. Viewings and rental availability</h2><p>Listing information, rent, deposit and availability can change. A viewing request is an inquiry, not a reservation or tenancy offer. The housing team should confirm current availability, property details and any agent service fee before a viewing or rental decision. Do not send money based only on a website listing or message.</p>
    <h2>3. The verification is a point in time check</h2><p>An inspection reflects only what a verifier could observe at the time and place of the visit. We do not guarantee ownership, title, a landlord&apos;s authority, future availability, building condition, utility service or another person&apos;s conduct. Information may change or be incomplete. Verification is separate from our housing agency service.</p>
    <h2>4. Your decision</h2><p>You must independently review the terms of a tenancy and decide whether to rent. A GREEN result is not a recommendation to pay. A RED result is a warning to pause and investigate; it is not a legal finding about a person.</p>
    <h2>5. Verification fees, refunds and cancellations</h2><p>Verification packages are KES 500 for an in town visit and KES 800 for a live video call check. Refund eligibility is explained in the <Link href="/refund-policy">Refund Policy</Link>. No real payment is taken in the prototype. Rental charges are separate and must be disclosed before you agree to them.</p>
    <h2>6. Limitation of liability</h2><p>To the extent permitted by Kenyan law, RentiSafe is not liable for losses caused by information that was not reasonably observable during a check, changes in rental availability, third party conduct or a decision made using a listing or report. Nothing in these terms excludes liability that cannot lawfully be excluded. The final terms and any consumer protections need Kenyan counsel&apos;s review.</p>
    <h2>7. Fair use and reports</h2><p>Do not submit false or harassing information. Scam database entries require evidence and administrator review, show masked numbers only, and can be challenged through the <Link href="/scam-database-policy">Scam Database Policy</Link>.</p>
    <h2>8. Contact</h2><p>For questions, contact RentiSafe through the WhatsApp link on this site.</p>
  </article>;
}
