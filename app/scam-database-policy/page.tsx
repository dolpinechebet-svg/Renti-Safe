import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Scam database policy · DRAFT",
  description: "How RentiSafe reviews scam reports, masks published numbers, and handles disputes.",
  alternates: { canonical: "/scam-database-policy" },
};

export default function ScamDatabasePolicyPage() {
  return <article className="wrap policy">
    <span className="eyebrow">DRAFT · Legal review required</span><h1>Scam database policy</h1>
    <p className="lead">A database entry is a reviewed report, not a legal finding or a declaration that a person is a criminal.</p>
    <h2>Evidence and review</h2><p>A flag must be supported by agent evidence collected at the property and connected to a verification request. The record remains private as pending review until an administrator checks the supporting evidence, accuracy and context. Only an administrator may approve publication, edit, dispute or remove a flag. The public page masks the phone number (for example, 0712 XXX 456) and publishes a concise reason only; identity photos and private evidence are never shown.</p>
    <h2>Disputing a flag</h2><p>A landlord or affected person can open a public entry and submit their name, contact number, explanation and an optional evidence link using the dispute form. The entry is marked disputed and returned for review. An administrator may request clarification, correct or remove the entry, or republish it after review. We aim to assess disputes promptly but do not promise a particular legal outcome.</p>
    <h2>Search limitations</h2><p>Search results include only published entries. “No flags found” is not proof that a landlord, agent or listing is safe. Verify independently and do not use the database to harass or discriminate.</p>
    <p>This draft requires Kenyan legal review, including review of defamation, fairness, data-protection and retention obligations, before launch.</p>
    <p><Link className="btn" href="/scam-database">Search published entries</Link></p>
  </article>;
}
