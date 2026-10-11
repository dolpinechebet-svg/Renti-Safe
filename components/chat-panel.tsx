"use client";

import { FormEvent, useState } from "react";
import { useId } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Sasa! Ask me about verification, pricing or towns. I can't decide if a specific person is a scammer." },
  ]);
  const [busy, setBusy] = useState(false);
  const sessionId = useId().replace(/[^a-z0-9-]/gi, "").padStart(8, "0");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form).get("message")?.toString().trim();
    if (!input || busy) return;
    setMessages((items) => [...items, { role: "user", content: input }]);
    form.reset();
    setBusy(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: input, sessionId }) });
      const data = await response.json() as { reply?: string; error?: string };
      setMessages((items) => [...items, { role: "assistant", content: data.reply || data.error || "Please reach us on WhatsApp for help." }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", content: "I couldn't connect. Please use the WhatsApp button." }]);
    } finally {
      setBusy(false);
    }
  }

  return <section className="chat-panel" aria-label="RentiSafe chat">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong>Ask RentiSafe</strong><button type="button" onClick={onClose} aria-label="Close chat">×</button></div>
    <div className="chat-messages" aria-live="polite">{messages.map((item, i) => <p key={`${i}-${item.role}`} className={`chat-bubble ${item.role}`}>{item.content}</p>)}</div>
    <form onSubmit={send} className="stack" style={{ gap: 8 }}><label className="field"><span className="field-label">Your question</span><input name="message" maxLength={500} required placeholder="How does a check work?" /></label><button className="btn" disabled={busy}>{busy ? "Sending…" : "Send"}</button></form>
    <a className="hint" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254745553547"}?text=${encodeURIComponent("Hi RentiSafe, I need some help")}`}>Need a person? WhatsApp us</a>
  </section>;
}
