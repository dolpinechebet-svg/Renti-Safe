"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AgentStartButton({ requestId }: { requestId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function start() {
    setBusy(true);
    const response = await fetch("/api/agent/start", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ request_id: requestId }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) setMessage(data.error || "Could not start job.");
    else {
      setMessage("Inspection started.");
      router.refresh();
    }
    setBusy(false);
  }
  return <div><button className="btn btn-outline" type="button" disabled={busy} onClick={start}>{busy ? "Starting…" : "Start inspection"}</button>{message && <small style={{ marginLeft: 10 }}>{message}</small>}</div>;
}
