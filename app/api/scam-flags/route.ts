import { NextResponse } from "next/server";
import { isSupabaseConfigured, submitDispute } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { disputeSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Disputes cannot be submitted." }, { status: 503 });
  const ip = getClientIp(request);
  if (!rateLimit(`scam-flag:${ip}`, 5, 60 * 60_000).allowed) return NextResponse.json({ error: "Please try again later." }, { status: 429 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    if (body.action === "dispute") {
      const parsed = disputeSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      await submitDispute({
        ...parsed.data, evidence_url: parsed.data.evidence_url || null,
      });
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    return NextResponse.json({ error: "Flags are created from agent inspection reports and reviewed by an administrator." }, { status: 405 });
  } catch (error) {
    console.error("Scam database submission failed:", error);
    return NextResponse.json({ error: "We could not save this submission." }, { status: 500 });
  }
}
