import { NextResponse } from "next/server";
import { createRequest, isSupabaseConfigured, logNotification } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { requestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Requests cannot be saved." }, { status: 503 });
  const ip = getClientIp(request);
  const limit = rateLimit(`request:${ip}`, 4, 60 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the details and try again." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ error: "Request could not be accepted." }, { status: 400 });

  if (process.env.TURNSTILE_SECRET_KEY) {
    const token = (body as Record<string, unknown>).turnstile_token;
    if (typeof token !== "string" || !token) return NextResponse.json({ error: "Complete the human check and try again." }, { status: 400 });
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    });
    if (!verify.ok) throw new Error("Turnstile verification service returned an error.");
    const result = await verify.json() as { success: boolean };
    if (!result.success) return NextResponse.json({ error: "Human check failed. Please try again." }, { status: 400 });
  }

  try {
    const fee = parsed.data.package_type === "in_town" ? 500 : 800;
    const created = await createRequest({
      tenant_phone: parsed.data.tenant_phone,
      landlord_phone: parsed.data.landlord_phone,
      listing_link: parsed.data.listing_link || null,
      location_text: parsed.data.location_text || null,
      town: parsed.data.town,
      package_type: parsed.data.package_type,
      fee_amount: fee,
    }, true);
    await logNotification(created.id, `Payment simulated: KES ${fee}. Request ${created.id} is now in the queue.`);
    return NextResponse.json({ trackingToken: created.tracking_token, fee }, { status: 201 });
  } catch (error) {
    console.error("Could not create verification request:", error);
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 500 });
  }
}
