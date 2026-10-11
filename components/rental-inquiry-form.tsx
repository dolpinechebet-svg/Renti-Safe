"use client";

import { FormEvent, useState } from "react";

export function RentalInquiryForm({ listingId, title }: { listingId: string; title: string }) {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/rental-inquiries", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, listing_id: listingId }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not send your request.");
      setSent(true);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not send your request.");
    } finally {
      setBusy(false);
    }
  }
  if (sent) return <p className="success" role="status">Thanks. The RentiSafe housing team will contact you about this home.</p>;
  return <form onSubmit={submit} className="form-card stack">
    <h2 style={{ margin: 0 }}>Ask about this home</h2>
    <p className="muted" style={{ margin: 0 }}>{title}</p>
    <div className="field"><label htmlFor="inquiry-name">Your name</label><input id="inquiry-name" name="name" required minLength={2} maxLength={120} /></div>
    <div className="field"><label htmlFor="inquiry-phone">Phone number</label><input id="inquiry-phone" name="phone" type="tel" required placeholder="07XX XXX XXX" /></div>
    <div className="field"><label htmlFor="inquiry-message">Message</label><textarea id="inquiry-message" name="message" required minLength={5} maxLength={600} defaultValue="Hi, I would like to arrange a viewing and confirm this home is still available." /></div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="inquiry-website">Leave empty</label><input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" /></div>
    {error && <p className="alert" role="alert">{error}</p>}
    <button className="btn" disabled={busy}>{busy ? "Sending…" : "Request a viewing"}</button>
  </form>;
}
