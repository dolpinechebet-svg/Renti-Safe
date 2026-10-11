"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUpload } from "@/components/media-upload";

const checks = [
  ["house_exists", "House exists at the listed location?"],
  ["is_vacant", "Unit is vacant and available?"],
  ["caretaker_id_match", "Caretaker identity matches listing?"],
  ["kplc_match", "KPLC meter details match?"],
  ["water_bill_match", "Water account details match?"],
  ["duplicate_listing", "Found elsewhere under another name?"],
] as const;

export function AgentReportForm({ requestId }: { requestId: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
    for (const [key, value] of form.entries()) {
      if (key === "photo_urls") body[key] = [...(Array.isArray(body[key]) ? body[key] as FormDataEntryValue[] : []), value];
      else body[key] = value;
    }
    try {
      const response = await fetch("/api/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json() as { error?: string; verdict?: string };
      if (!response.ok) throw new Error(data.error || "Could not submit report.");
      alert(`Report submitted: ${data.verdict}`);
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not submit report.");
    } finally {
      setBusy(false);
    }
  }
  return <form className="form-card stack" onSubmit={submit}>
    <h2 style={{ margin: 0 }}>Inspection checklist</h2>
    <input type="hidden" name="request_id" value={requestId} />
    {checks.map(([key, label]) => <fieldset key={key} style={{ border: 0, borderBottom: "1px solid #ebe6dc", padding: "5px 0 12px", margin: 0 }}>
      <legend className="field-label">{label}</legend>
      <div style={{ display: "flex", gap: 20, marginTop: 5 }}>
        <label><input type="radio" name={key} value="yes" required /> Yes</label>
        <label><input type="radio" name={key} value="no" required /> No</label>
      </div>
    </fieldset>)}
    <div className="field"><label htmlFor="notes">Agent notes</label><textarea id="notes" name="notes" maxLength={2000} placeholder="What did you see at the property?" /></div>
    <MediaUpload name="photo_urls" label="Inspection photos (at least one required)" accept="image/jpeg,image/png,image/webp" multiple />
    <MediaUpload name="video_url" label="Optional inspection video · max 50 MB" accept="video/mp4,video/quicktime" />
    {error && <p className="alert" role="alert">{error}</p>}
    <button className="btn" disabled={busy}>{busy ? "Submitting report…" : "Submit inspection report"}</button>
  </form>;
}
