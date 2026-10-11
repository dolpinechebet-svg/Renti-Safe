import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy · DRAFT",
  description: "Draft privacy notice for RentiSafe under Kenya's Data Protection Act, 2019.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <article className="wrap policy">
    <span className="eyebrow">DRAFT · Kenyan lawyer review required</span><h1>Privacy policy</h1>
    <p className="lead">Draft notice prepared with reference to Kenya&apos;s Data Protection Act, 2019. It must be checked by a Kenyan privacy lawyer and adapted to RentiSafe&apos;s actual operations before launch.</p>
    <h2>Personal data we collect</h2><p>We collect prospective tenant names and phone numbers from viewing inquiries; phone numbers and details needed to manage homes for rent; tenant and landlord phone numbers, listing links and location descriptions for verification requests; account details for agents and administrators; and messages sent through forms, support chat or WhatsApp intake. During an inspection, an agent may upload property photos or video and may encounter identity documents. Caretaker ID photos are sensitive personal data: collect only when necessary and with lawful authority, avoid capturing them where possible, blur or redact identifiers, and never display them publicly.</p>
    <h2>Why we use it</h2><p>We use these details to advertise homes with authority, respond to viewing inquiries, arrange viewings, confirm rental availability and terms, deliver property checks, prepare reports, prevent abuse, handle disputes and refunds, maintain a reviewable scam database, and improve service reliability. Optional chat messages are used to respond to questions and maintain support logs.</p>
    <h2>Who can see it</h2><p>Only authorized RentiSafe administrators and the local agent assigned to a job should access the information needed for that job. Service providers such as Supabase (hosting/database/storage), Vercel (hosting) and, if enabled, Anthropic (chat responses) may process information under their terms. Private inspection evidence must not be exposed through public storage. Published scam-database entries show a masked number and an evidence-reviewed reason, not a full number or identity document.</p>
    <h2>Retention and security</h2><p>Proposed draft retention: contact and request records for up to 24 months after the check; inspection media for up to 90 days after report delivery unless needed for a dispute or legal claim; and chat logs for up to 12 months. These periods are provisional and must be confirmed through a lawful retention assessment. We use access controls and private storage but cannot promise absolute security. We will delete or anonymize data when no longer needed, subject to legal obligations and active disputes.</p>
    <h2>Your data-protection rights</h2><p>Subject to applicable law and identity verification, you may request access, correction, deletion, restriction, objection or a copy of your personal data, and may complain to the Office of the Data Protection Commissioner. To make a request, message RentiSafe through the WhatsApp contact and state which right you are exercising. We may ask for reasonable verification and will respond within the period required by law. Do not send ID documents in an unsecured public channel.</p>
    <h2>Cookies</h2><p>This prototype uses a necessary, HTTP-only staff sign-in cookie and local storage to remember that the lightweight cookie notice was acknowledged. It does not use advertising trackers.</p>
    <h2>Children and contact</h2><p>The service is intended for adults arranging rental accommodation. Contact us through the WhatsApp link for privacy questions, access or deletion requests.</p>
  </article>;
}
