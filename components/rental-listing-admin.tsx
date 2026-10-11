"use client";

import { FormEvent, useState } from "react";

export function RentalListingAdminForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const slug = String(values.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setError("");
    const response = await fetch("/api/admin", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...values, action: "save-rental", slug, bedrooms: Number(values.bedrooms), rent_amount: Number(values.rent_amount), deposit_amount: Number(values.deposit_amount), amenities: String(values.amenities).split(",").map((item) => item.trim()).filter(Boolean), campus: values.campus || null, status: "available" }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error || "Could not save listing."); return; }
    setMessage("Listing saved."); form.reset(); location.reload();
  }

  return <form className="form-card stack" onSubmit={submit}>
    <h2 style={{ margin: 0 }}>Add a rental home</h2>
    <p className="hint">Publish only current homes you are authorized to market.</p>
    <div className="field"><label htmlFor="listing-title">Listing title</label><input id="listing-title" name="title" required minLength={5} maxLength={140} /></div>
    <div className="field"><label htmlFor="listing-description">Description</label><textarea id="listing-description" name="description" required minLength={10} maxLength={1500} /></div>
    <div className="grid2">
      <div className="field"><label htmlFor="listing-town">Town</label><input id="listing-town" name="town" required /></div>
      <div className="field"><label htmlFor="listing-area">Estate or area</label><input id="listing-area" name="area" required /></div>
      <div className="field"><label htmlFor="listing-campus">Nearby university (optional)</label><input id="listing-campus" name="campus" /></div>
      <div className="field"><label htmlFor="listing-type">Property type</label><select id="listing-type" name="property_type"><option>Bedsitter</option><option>One bedroom</option><option>Two bedroom</option><option>Three bedroom</option><option>Studio</option><option>Shared room</option></select></div>
      <div className="field"><label htmlFor="listing-bedrooms">Bedrooms, use 0 for bedsitter</label><input id="listing-bedrooms" name="bedrooms" type="number" min="0" max="10" required /></div>
      <div className="field"><label htmlFor="listing-rent">Monthly rent in KES</label><input id="listing-rent" name="rent_amount" type="number" min="1" required /></div>
      <div className="field"><label htmlFor="listing-deposit">Deposit in KES</label><input id="listing-deposit" name="deposit_amount" type="number" min="0" required /></div>
      <div className="field"><label htmlFor="listing-contact">Housing team phone</label><input id="listing-contact" name="contact_phone" type="tel" required placeholder="07XX XXX XXX" /></div>
    </div>
    <div className="field"><label htmlFor="listing-amenities">Amenities, separated by commas</label><input id="listing-amenities" name="amenities" placeholder="Water available, parking, secure entrance" /></div>
    {message && <p className="success">{message}</p>}{error && <p className="alert">{error}</p>}
    <button className="btn">Publish available home</button>
  </form>;
}

export function RentalListingStatus({ id, status }: { id: string; status: "available" | "let" }) {
  const [message, setMessage] = useState("");
  async function change(nextStatus: "available" | "let") {
    const response = await fetch("/api/admin", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "rental-status", id, status: nextStatus }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) setMessage(result.error || "Could not update availability.");
    else location.reload();
  }
  return <div className="stack" style={{ gap: 5 }}>
    <span className="tag">{status === "available" ? "Available" : "Let"}</span>
    <button type="button" className="btn btn-outline" onClick={() => void change(status === "available" ? "let" : "available")}>{status === "available" ? "Mark as let" : "Mark available"}</button>
    {message && <small className="error-text">{message}</small>}
  </div>;
}
