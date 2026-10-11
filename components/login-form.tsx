"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json() as { error?: string; redirect?: string };
      if (!response.ok) throw new Error(data.error || "Sign-in failed.");
      router.push(data.redirect || "/");
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  return <form onSubmit={submit} className="form-card stack">
    <h1 style={{ fontSize: "2rem", margin: 0 }}>Staff sign in</h1>
    <div className="field"><label htmlFor="identifier">Staff account email</label><input id="identifier" name="identifier" type="email" required autoComplete="username" placeholder="name@example.com" /></div>
    <div className="field"><label htmlFor="password">Staff account password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
    <p className="hint">Sign in with the email and password for your RentiSafe staff account.</p>
    {error && <p className="alert" role="alert">{error}</p>}
    <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
  </form>;
}
