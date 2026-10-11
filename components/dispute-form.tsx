"use client";

import { FormEvent, useState } from "react";

export function DisputeForm({ flagId }: { flagId: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/scam-flags", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...values, flag_id: flagId, action: "dispute" }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error || "Could not send your dispute."); return; }
    setMessage("Your challenge has been sent to our team for review.");
  }
  if (message) return <p className="success" role="status">{message}</p>;
  return <form className="form-card stack" onSubmit={submit}>
    <h2 style={{ margin: 0 }}>Challenge this entry</h2>
    <div className="field"><label htmlFor="submitter_name">Your name</label><input id="submitter_name" name="submitter_name" required minLength={2} /></div>
    <div className="field"><label htmlFor="submitter_phone">Your phone</label><input id="submitter_phone" name="submitter_phone" type="tel" required placeholder="07XX XXX XXX" /></div>
    <div className="field"><label htmlFor="message">Why are you challenging this flag?</label><textarea id="message" name="message" required minLength={10} maxLength={1200} /></div>
    <div className="field"><label htmlFor="evidence_url">Evidence link (optional)</label><input id="evidence_url" name="evidence_url" type="url" /></div>
    {error && <p className="alert">{error}</p>}<button className="btn">Send for review</button>
  </form>;
}
