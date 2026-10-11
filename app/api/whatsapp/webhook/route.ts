import { NextResponse } from "next/server";
import { createRequest, isSupabaseConfigured, logNotification } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) return new Response(challenge, { status: 200 });
  return new NextResponse("Webhook verification failed.", { status: 403 });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Intake cannot be saved." }, { status: 503 });
  if (!rateLimit(`whatsapp:${getClientIp(request)}`, 40, 60_000).allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  const payload = await request.json().catch(() => null) as {
    entry?: { changes?: { value?: { messages?: { from?: string; text?: { body?: string } }[] } }[] }[];
    message?: string;
  } | null;
  const text = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || payload?.message;
  const from = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
  if (typeof text !== "string" || text.length > 2000) return NextResponse.json({ received: true, ignored: true });
  const phone = text.match(/(?:\+?254|0)(?:7|1)\d{8}/)?.[0];
  const link = text.match(/https?:\/\/\S+/)?.[0] || null;
  const location = link ? text.replace(link, "").trim() : text.trim();
  if (!phone || (!link && location.length < 3)) {
    await logNotification(null, `WhatsApp intake could not parse a full request: ${text.slice(0, 400)}`);
    return NextResponse.json({ received: true, draftCreated: false, reply: "Please send a house location or listing link and the landlord phone number." });
  }
  try {
    const created = await createRequest({
      tenant_phone: from || phone,
      landlord_phone: phone,
      listing_link: link,
      location_text: link ? (location || null) : location,
      town: location.match(/eldoret|nairobi|rongai|nakuru|kisumu|mombasa|thika/i)?.[0] || "Unspecified",
      package_type: "in_town",
      fee_amount: 500,
    });
    await logNotification(created.id, `WhatsApp draft created. New Job: Verify ${location || "listed property"}. 200 KES. Go now.`);
    return NextResponse.json({ received: true, draftCreated: true, trackingToken: created.tracking_token });
  } catch (error) {
    console.error("WhatsApp draft request failed:", error);
    return NextResponse.json({ error: "Could not save intake draft." }, { status: 500 });
  }
}
