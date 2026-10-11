import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addAgent, assignRequest, getAgent, getRequestById, isSupabaseConfigured, saveRentalListing, setRentalListingStatus, updateAgent, updateFlag } from "@/lib/db";
import { agentSchema, flagSchema, rentalListingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Admin changes cannot be saved." }, { status: 503 });
  const session = await getSession();
  if (session?.role !== "admin") return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body.action !== "string") return NextResponse.json({ error: "Choose an admin action." }, { status: 400 });

  try {
    if (body.action === "assign" && typeof body.request_id === "string" && (typeof body.agent_id === "string" || body.agent_id === "")) {
      const [job, assignedAgent] = await Promise.all([
        getRequestById(body.request_id),
        body.agent_id ? getAgent(body.agent_id) : Promise.resolve(null),
      ]);
      if (!job) return NextResponse.json({ error: "Request was not found." }, { status: 404 });
      if (body.agent_id && (!assignedAgent?.active || assignedAgent.town.toLowerCase() !== job.town.toLowerCase())) {
        return NextResponse.json({ error: "Choose an active agent assigned to this town." }, { status: 400 });
      }
      await assignRequest(body.request_id, body.agent_id || null);
    } else if (body.action === "add-agent") {
      const parsed = agentSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      await addAgent(parsed.data);
    } else if (body.action === "update-agent" && typeof body.id === "string") {
      const parsed = agentSchema.partial().safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      await updateAgent(body.id, parsed.data);
    } else if (body.action === "update-flag" && typeof body.id === "string") {
      const parsed = flagSchema.partial().safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      const update: { landlord_phone?: string; reason?: string; status?: "pending_review" | "published" | "disputed" | "removed" } = {};
      if (typeof body.landlord_phone === "string") update.landlord_phone = body.landlord_phone;
      if (typeof body.reason === "string") update.reason = body.reason;
      if (["pending_review", "published", "disputed", "removed"].includes(String(body.status))) update.status = body.status as typeof update.status;
      await updateFlag(body.id, update);
    } else if (body.action === "save-rental") {
      const parsed = rentalListingSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      await saveRentalListing({ ...parsed.data, campus: parsed.data.campus || null });
    } else if (body.action === "rental-status" && typeof body.id === "string" && ["available", "let"].includes(String(body.status))) {
      await setRentalListingStatus(body.id, body.status as "available" | "let");
    } else {
      return NextResponse.json({ error: "That admin action is not supported." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin action failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "The change could not be saved." }, { status: 400 });
  }
}
