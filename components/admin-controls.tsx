"use client";

import { FormEvent, useState } from "react";

async function action(body: Record<string, unknown>) {
  const response = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error || "Could not save change.");
}

export function AssignForm({ requestId, agentId, agents }: { requestId: string; agentId: string; agents: { id: string; name: string }[] }) {
  const [message, setMessage] = useState("");
  return <form className="stack" style={{ minWidth: 180, gap: 6 }} onSubmit={async (event) => {
    event.preventDefault();
    try {
      await action({ action: "assign", request_id: requestId, agent_id: new FormData(event.currentTarget).get("agent_id") });
      setMessage("Saved"); location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Error"); }
  }}>
    <select name="agent_id" defaultValue={agentId} aria-label="Assign agent"><option value="">Unassigned</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select>
    <button className="btn btn-outline" style={{ minHeight: 34, padding: "5px 8px" }}>Assign</button>{message && <small>{message}</small>}
  </form>;
}

export function AddAgentForm() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await action({ ...values, action: "add-agent", active: true });
      setMessage("Agent added."); event.currentTarget.reset(); location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add agent."); }
  }
  return <form onSubmit={submit} className="form-card stack">
    <h3 style={{ margin: 0 }}>Add agent</h3>
    <div className="field"><label>Name</label><input name="name" required minLength={2} /></div>
    <div className="field"><label>Phone</label><input name="phone" required placeholder="07XX XXX XXX" /></div>
    <div className="field"><label>Town</label><input name="town" required /></div>
    {message && <small aria-live="polite">{message}</small>}<button className="btn">Add agent</button>
  </form>;
}

export function EditAgentForm({ agent }: { agent: { id: string; name: string; phone: string; town: string; active: boolean } }) {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await action({ ...values, id: agent.id, action: "update-agent", active: values.active === "true" });
      setMessage("Saved"); location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update agent."); }
  }
  return <form className="grid2" onSubmit={submit}>
    <input name="name" defaultValue={agent.name} aria-label="Agent name" required />
    <input name="phone" defaultValue={agent.phone} aria-label="Agent phone" required />
    <input name="town" defaultValue={agent.town} aria-label="Agent town" required />
    <select name="active" defaultValue={String(agent.active)} aria-label="Agent active status"><option value="true">Active</option><option value="false">Inactive</option></select>
    <button className="btn btn-outline">Save</button>{message && <small>{message}</small>}
  </form>;
}

export function FlagControls({ id, status, phone, reason }: { id: string; status: string; phone: string; reason: string }) {
  const [message, setMessage] = useState("");
  return <form className="stack" onSubmit={async (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    try {
      await action({ action: "update-flag", id, landlord_phone: fields.get("landlord_phone"), reason: fields.get("reason"), status: fields.get("status") });
      setMessage("Saved"); location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
  }}>
    <input name="landlord_phone" defaultValue={phone} aria-label="Landlord phone" />
    <textarea name="reason" defaultValue={reason} aria-label="Flag reason" rows={3} />
    <select name="status" defaultValue={status} aria-label="Flag status">
      <option value="pending_review">Pending review</option><option value="published">Published</option><option value="disputed">Disputed</option><option value="removed">Removed</option>
    </select>
    {message && <small>{message}</small>}<button className="btn btn-outline">Save review</button>
  </form>;
}
