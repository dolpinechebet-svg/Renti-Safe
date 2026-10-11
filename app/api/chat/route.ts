import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isSupabaseConfigured, listPublishedFlags, logChat } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const systemPrompt = `You are RentiSafe's rental housing and verification helper in Kenya. Answer questions about available homes, viewing requests, how RentiSafe verification works, KES 500 in town and KES 800 video call prices, towns, timelines, and general rental scam prevention. Never declare a specific landlord or phone number a scammer. For a number lookup, only report what published RentiSafe records return; no flags found is not proof of safety. Do not give legal advice. For anything outside scope, recommend the WhatsApp hand off. Do not claim to have searched a number unless an explicit lookup tool has been used.`;

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Chat is unavailable." }, { status: 503 });
  const ip = getClientIp(request);
  if (!rateLimit(`chat:${ip}`, 12, 10 * 60_000).allowed) return NextResponse.json({ error: "Please wait a little before sending more questions." }, { status: 429 });
  const body = await request.json().catch(() => null) as { message?: unknown; sessionId?: unknown } | null;
  if (typeof body?.message !== "string" || body.message.trim().length < 1 || body.message.length > 500) return NextResponse.json({ error: "Message must be between 1 and 500 characters." }, { status: 400 });
  const sessionId = typeof body.sessionId === "string" && /^[a-z0-9-]{8,80}$/i.test(body.sessionId) ? body.sessionId : randomUUID();
  await logChat(sessionId, "user", body.message.trim());
  const lookup = body.message.match(/(?:\+?254|0)(?:7|1)\d{8}/);
  if (lookup) {
    const digits = lookup[0].replace(/\D/g, "");
    const flags = await listPublishedFlags();
    const matches = flags.filter((flag) => flag.landlord_phone.replace(/\D/g, "").endsWith(digits.slice(-9)));
    const reply = matches.length
      ? `Our published database has ${matches.length} reviewed flag${matches.length === 1 ? "" : "s"} for ${digits.slice(0, 4)} XXX ${digits.slice(-3)}. This is a reviewed report, not a legal finding. You can read the masked entry in our Scam Database.`
      : "No published flags found for that number. No flags found is not proof of safety. Please verify the house and payment details independently.";
    await logChat(sessionId, "assistant", reply);
    return NextResponse.json({ reply, sessionId });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    const reply = "I can help with our KES 500/800 checks and general rental-scam red flags. For a specific listing or number, use the scam database or message our team on WhatsApp. No flags found is not proof of safety.";
    await logChat(sessionId, "assistant", reply);
    return NextResponse.json({ reply, sessionId });
  }
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 350,
      system: systemPrompt,
      messages: [{ role: "user", content: body.message.trim() }],
    }),
  });
  if (!response.ok) {
    console.error("Anthropic API returned status", response.status);
    return NextResponse.json({ error: "Chat is temporarily unavailable. Please use WhatsApp." }, { status: 502 });
  }
  const payload = await response.json() as { content?: { type: string; text?: string }[] };
  const reply = payload.content?.find((part) => part.type === "text")?.text;
  if (!reply) return NextResponse.json({ error: "Chat returned an empty reply. Please use WhatsApp." }, { status: 502 });
  await logChat(sessionId, "assistant", reply);
  return NextResponse.json({ reply, sessionId });
}
