"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { usePathname } from "next/navigation";

const ChatPanel = dynamic(() => import("@/components/chat-panel"), {
  ssr: false,
  loading: () => <div className="chat-panel" aria-live="polite">Opening help…</div>,
});

export function Floaters({ message }: { message: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254745553547";
  const pageMessage = pathname.startsWith("/status/")
    ? `Hi RentiSafe, I have a question about verification ${pathname.split("/")[2]}.`
    : pathname.startsWith("/scam-database") ? "I want to check a landlord number" : message;
  return <>
    {open && <ChatPanel onClose={() => setOpen(false)} />}
    <button className="chat-toggle" aria-label={open ? "Close RentiSafe help" : "Open RentiSafe help"} onClick={() => setOpen(!open)}>?</button>
    <a className="float-wa" href={`https://wa.me/${number}?text=${encodeURIComponent(pageMessage)}`} target="_blank" rel="noreferrer" aria-label="Chat with RentiSafe on WhatsApp">WhatsApp</a>
  </>;
}
