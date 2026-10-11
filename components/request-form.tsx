"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Created = { trackingToken: string; fee: number; error?: string };
type TurnstileApi = {
  render: (element: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    "error-callback": () => void;
    "expired-callback": () => void;
  }) => string;
  remove: (widgetId: string) => void;
};

export function RequestForm() {
  const [packageType, setPackageType] = useState<"in_town" | "video_call">("in_town");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const fee = packageType === "in_town" ? 500 : 800;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const location = params.get("location");
    const town = params.get("town");
    const locationField = document.querySelector<HTMLInputElement>("#location_text");
    const townField = document.querySelector<HTMLInputElement>("#town");
    if (location && locationField) locationField.value = location;
    if (town && townField) townField.value = town;
  }, []);

  useEffect(() => {
    if (!siteKey || !turnstileRef.current) return;
    const target = window as Window & { turnstile?: TurnstileApi };
    let script = document.getElementById("turnstile-api") as HTMLScriptElement | null;
    const mount = () => {
      if (!target.turnstile || !turnstileRef.current || widgetRef.current) return;
      widgetRef.current = target.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: setTurnstileToken,
        "error-callback": () => setTurnstileToken(""),
        "expired-callback": () => setTurnstileToken(""),
      });
    };
    if (!script) {
      script = document.createElement("script");
      script.id = "turnstile-api";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", mount);
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", mount);
      mount();
    }
    return () => {
      script?.removeEventListener("load", mount);
      if (widgetRef.current) target.turnstile?.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [siteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const values = { ...Object.fromEntries(new FormData(form).entries()), ...(turnstileToken ? { turnstile_token: turnstileToken } : {}) };
    try {
      const response = await fetch("/api/requests", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values),
      });
      const data = await response.json() as Created;
      if (!response.ok) throw new Error(data.error || "We could not create your request. Please try again.");
      setCreated(data);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "We could not create your request.");
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return <div className="form-card stack" aria-live="polite">
      <span className="eyebrow">Payment simulated</span>
      <h2>Uko sawa. Request yako iko kwa queue.</h2>
      <p className="muted">KES {created.fee} marked as paid in this prototype. Save this private tracking link:</p>
      <a className="btn" href={`/status/${created.trackingToken}`}>Track my verification</a>
      <a className="btn btn-outline" href={`/status/${created.trackingToken}`}>{`rentisafe.co.ke/status/${created.trackingToken}`}</a>
    </div>;
  }

  function shareWhatsApp() {
    const form = document.querySelector<HTMLFormElement>("#request-form");
    if (!form) return;
    const fields = new FormData(form);
    const text = `Hi RentiSafe, I want to verify a house. Location: ${fields.get("location_text") || "not added"}. Listing: ${fields.get("listing_link") || "not added"}. My phone: ${fields.get("tenant_phone") || "not added"}.`;
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000"}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return <form id="request-form" className="form-card stack" onSubmit={submit}>
    <h2 style={{ margin: 0 }}>Tuma details ya nyumba</h2>
    <p className="muted" style={{ margin: 0 }}>Pay once after you choose your checks. No deposit is collected here.</p>
    <div className="field"><label htmlFor="listing_link">Listing link (optional)</label><input id="listing_link" name="listing_link" type="url" placeholder="https://..." /></div>
    <div className="field"><label htmlFor="location_text">Where is the house? (or add a listing link)</label><input id="location_text" name="location_text" placeholder="Bedsitter near Moi University, Kesses" maxLength={240} /></div>
    <div className="grid2">
      <div className="field"><label htmlFor="tenant_phone">Your phone number *</label><input id="tenant_phone" name="tenant_phone" type="tel" required placeholder="07XX XXX XXX" /></div>
      <div className="field"><label htmlFor="landlord_phone">Landlord / agent phone *</label><input id="landlord_phone" name="landlord_phone" type="tel" required placeholder="07XX XXX XXX" /></div>
    </div>
    <div className="field"><label htmlFor="town">Town *</label><input id="town" name="town" required placeholder="Eldoret" /></div>
    <fieldset style={{ padding: 0, border: 0, margin: 0 }}>
      <legend className="field-label" style={{ marginBottom: 8 }}>Choose a verification package</legend>
      <div className="packages">
        <label className="package-option"><input type="radio" name="package_type" value="in_town" checked={packageType === "in_town"} onChange={() => setPackageType("in_town")} /><span><strong>I&apos;m in town · KES 500</strong><small>Local agent visits the property</small></span></label>
        <label className="package-option"><input type="radio" name="package_type" value="video_call" checked={packageType === "video_call"} onChange={() => setPackageType("video_call")} /><span><strong>I&apos;m far · KES 800</strong><small>Agent verifies on a live video call</small></span></label>
      </div>
    </fieldset>
    <div className="field" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <input id="accepted_policies" name="accepted_policies" value="yes" type="checkbox" required style={{ width: 17, marginTop: 4, accentColor: "#e86532" }} />
      <label htmlFor="accepted_policies" style={{ fontWeight: 500 }}>I have read the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</label>
    </div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    {siteKey && <div ref={turnstileRef} aria-label="Cloudflare human verification" />}
    <p className="hint">By continuing, you are simulating payment of KES {fee}. See our <a href="/refund-policy">refund policy</a>.</p>
    {error && <p className="alert" role="alert">{error}</p>}
    <button className="btn" type="submit" disabled={busy || Boolean(siteKey && !turnstileToken)}>{busy ? "Creating request…" : `Simulate Payment · KES ${fee}`}</button>
    <button className="btn btn-outline" type="button" onClick={shareWhatsApp}>Send details on WhatsApp instead</button>
  </form>;
}
