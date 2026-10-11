import { NextResponse } from "next/server";
import { getSession, requireAgent } from "@/lib/auth";
import { getRequestById, isSupabaseConfigured, logNotification, updateRequestStatus } from "@/lib/db";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Jobs cannot be updated." }, { status: 503 });
  const session = await getSession();
  const body = await request.json().catch(() => null) as { request_id?: unknown } | null;
  if (typeof body?.request_id !== "string" || !(await requireAgent(session, body.request_id))) {
    return NextResponse.json({ error: "This job is outside your assigned town." }, { status: 403 });
  }
  const job = await getRequestById(body.request_id);
  if (!job || job.payment_status !== "paid" || !["assigned", "pending"].includes(job.status)) {
    return NextResponse.json({ error: "This request cannot be started." }, { status: 409 });
  }
  await updateRequestStatus(job.id, "in_progress");
  await logNotification(job.id, `Agent started the property inspection in ${job.town}.`, "system");
  return NextResponse.json({ ok: true });
}
