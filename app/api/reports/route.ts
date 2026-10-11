import { NextResponse } from "next/server";
import { getSession, requireAgent } from "@/lib/auth";
import { getRequestById, getAdminDb, isSupabaseConfigured, logNotification, saveFlag, saveReport } from "@/lib/db";
import { reportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Reports cannot be submitted." }, { status: 503 });
  const session = await getSession();
  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check all required report fields." }, { status: 400 });
  if (!(await requireAgent(session, parsed.data.request_id))) return NextResponse.json({ error: "This job is outside your assigned town." }, { status: 403 });

  const requestRecord = await getRequestById(parsed.data.request_id);
  if (!requestRecord || requestRecord.payment_status !== "paid") return NextResponse.json({ error: "Paid job not found." }, { status: 404 });
  if (![...parsed.data.photo_urls, ...(parsed.data.video_url ? [parsed.data.video_url] : [])].every((key) => key.startsWith(`${session!.userId}/`))) {
    return NextResponse.json({ error: "Uploaded evidence does not belong to your agent account." }, { status: 400 });
  }
  const mediaClient = getAdminDb();
  if (!mediaClient) return NextResponse.json({ error: "Supabase media storage is not configured." }, { status: 503 });
  const keys = [...parsed.data.photo_urls, ...(parsed.data.video_url ? [parsed.data.video_url] : [])];
  for (const key of keys) {
    const folder = key.substring(0, key.lastIndexOf("/"));
    const fileName = key.substring(key.lastIndexOf("/") + 1);
    const { data, error } = await mediaClient.storage.from("verification-media").list(folder, { search: fileName });
    if (error || !data?.some((item) => item.name === fileName)) return NextResponse.json({ error: "Uploaded evidence could not be verified." }, { status: 400 });
  }
  const failedChecks = [
    parsed.data.house_exists === "no", parsed.data.is_vacant === "no", parsed.data.caretaker_id_match === "no",
    parsed.data.kplc_match === "no", parsed.data.water_bill_match === "no", parsed.data.duplicate_listing === "yes",
  ].filter(Boolean).length;
  const report = await saveReport({
    request_id: requestRecord.id,
    house_exists: parsed.data.house_exists === "yes",
    is_vacant: parsed.data.is_vacant === "yes",
    caretaker_id_match: parsed.data.caretaker_id_match === "yes",
    kplc_match: parsed.data.kplc_match === "yes",
    water_bill_match: parsed.data.water_bill_match === "yes",
    duplicate_listing: parsed.data.duplicate_listing === "yes",
    notes: parsed.data.notes,
    video_url: parsed.data.video_url || null,
    photo_urls: parsed.data.photo_urls,
    verdict: failedChecks ? "RED" : "GREEN",
    risk_score: Math.round((failedChecks / 6) * 100),
  });
  if (report.verdict === "RED") {
    await saveFlag({
      landlord_phone: requestRecord.landlord_phone,
      reason: `Agent report for verification ${requestRecord.id} needs admin review. ${parsed.data.notes}`.slice(0, 600),
      linked_request_id: requestRecord.id,
      evidence_urls: parsed.data.photo_urls,
    });
  }
  await logNotification(requestRecord.id, `Inspection report ready for ${requestRecord.town}. Verdict: ${report.verdict}.`);
  return NextResponse.json({ ok: true, verdict: report.verdict });
}
