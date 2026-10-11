import "server-only";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Agent,
  Notification,
  RentalInquiry,
  RentalListing,
  ScamDispute,
  ScamFlag,
  VerificationReport,
  VerificationRequest,
} from "@/lib/types";

let supabase: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
    && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getAdminDb() {
  if (!isSupabaseConfigured()) return null;
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return supabase;
}

function requireDb() {
  const client = getAdminDb();
  if (!client) throw new Error("Supabase is not configured. Add the project URL, anon key, and service role key.");
  return client;
}

function result<T>(data: T, error: { message: string } | null): T {
  if (error) throw new Error(`Database operation failed: ${error.message}`);
  return data;
}

export async function listAgents() {
  const client = getAdminDb();
  if (!client) return [];
  const { data, error } = await client.from("agents").select("id,name,phone,town,active").order("town");
  return result((data ?? []) as Agent[], error);
}

export async function getAgent(id: string) {
  const client = getAdminDb();
  if (!client) return null;
  const { data, error } = await client.from("agents").select("id,name,phone,town,active").eq("id", id).maybeSingle();
  return result(data as Agent | null, error);
}

export async function addAgent(agent: Omit<Agent, "id">) {
  const client = requireDb();
  const { data, error } = await client.from("agents").insert(agent).select("id,name,phone,town,active").single();
  return result(data as Agent, error);
}

export async function updateAgent(id: string, values: Partial<Pick<Agent, "name" | "phone" | "town" | "active">>) {
  const { error } = await requireDb().from("agents").update(values).eq("id", id);
  result(true, error);
}

export async function listRequests() {
  const client = getAdminDb();
  if (!client) return [];
  const { data, error } = await client.from("verification_requests").select("*").order("created_at", { ascending: false });
  return result((data ?? []) as VerificationRequest[], error);
}

export async function listReports() {
  const client = getAdminDb();
  if (!client) return [];
  const { data, error } = await client.from("verification_reports").select("*").order("created_at", { ascending: false });
  return result((data ?? []) as VerificationReport[], error);
}

export async function getRequestByTracking(token: string) {
  const client = getAdminDb();
  if (!client) return null;
  const { data, error } = await client.from("verification_requests").select("*").eq("tracking_token", token).maybeSingle();
  return result(data as VerificationRequest | null, error);
}

export async function getRequestById(id: string) {
  const client = getAdminDb();
  if (!client) return null;
  const { data, error } = await client.from("verification_requests").select("*").eq("id", id).maybeSingle();
  return result(data as VerificationRequest | null, error);
}

export async function createRequest(values: Pick<VerificationRequest, "tenant_phone" | "landlord_phone" | "listing_link" | "location_text" | "town" | "package_type" | "fee_amount">, paid = false) {
  const { data, error } = await requireDb().from("verification_requests").insert({
    ...values,
    payment_status: paid ? "paid" : "unpaid",
    tracking_token: randomUUID().replaceAll("-", "") + randomUUID().replaceAll("-", ""),
  }).select("*").single();
  return result(data as VerificationRequest, error);
}

export async function assignRequest(id: string, agentId: string | null) {
  const { error } = await requireDb().from("verification_requests")
    .update({ assigned_agent_id: agentId, status: agentId ? "assigned" : "pending" }).eq("id", id);
  result(true, error);
}

export async function updateRequestStatus(id: string, status: VerificationRequest["status"]) {
  const { error } = await requireDb().from("verification_requests").update({ status }).eq("id", id);
  result(true, error);
}

export async function getReport(requestId: string) {
  const client = getAdminDb();
  if (!client) return null;
  const { data, error } = await client.from("verification_reports").select("*").eq("request_id", requestId).maybeSingle();
  return result(data as VerificationReport | null, error);
}

export async function saveReport(report: Omit<VerificationReport, "id" | "created_at">) {
  const client = requireDb();
  const { data, error } = await client.from("verification_reports").upsert(report, { onConflict: "request_id" }).select("*").single();
  const saved = result(data as VerificationReport, error);
  await updateRequestStatus(report.request_id, "report_ready");
  return saved;
}

export async function listFlags() {
  const client = getAdminDb();
  if (!client) return [];
  const { data, error } = await client.from("scam_flags").select("*").order("flagged_at", { ascending: false });
  return result((data ?? []) as ScamFlag[], error);
}

export async function listPublishedFlags() {
  return (await listFlags()).filter((flag) => flag.status === "published");
}

export async function saveFlag(values: Pick<ScamFlag, "landlord_phone" | "reason" | "linked_request_id"> & { evidence_urls?: string[] }) {
  const { data, error } = await requireDb().from("scam_flags").insert(values).select("*").single();
  return result(data as ScamFlag, error);
}

export async function updateFlag(id: string, values: Partial<Pick<ScamFlag, "landlord_phone" | "reason" | "status">>) {
  if (values.status === "published") {
    const flags = await listFlags();
    const flag = flags.find((item) => item.id === id);
    if (!flag || flag.evidence_urls.length === 0) throw new Error("A flag needs agent evidence before it can be published.");
  }
  const { error } = await requireDb().from("scam_flags").update(values).eq("id", id);
  result(true, error);
}

export async function submitDispute(values: Omit<ScamDispute, "id" | "status" | "created_at">) {
  const client = requireDb();
  const { error } = await client.from("scam_disputes").insert(values);
  result(true, error);
  const { error: flagError } = await client.from("scam_flags").update({ status: "disputed" }).eq("id", values.flag_id);
  result(true, flagError);
}

export async function logNotification(requestId: string | null, message: string, channel: Notification["channel"] = "whatsapp") {
  const { error } = await requireDb().from("notifications").insert({ request_id: requestId, message, channel });
  result(true, error);
}

export async function listNotifications() {
  const client = getAdminDb();
  if (!client) return [];
  const { data, error } = await client.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
  return result((data ?? []) as Notification[], error);
}

export async function logChat(sessionId: string, role: "user" | "assistant", message: string) {
  const { error } = await requireDb().from("chat_logs").insert({ session_id: sessionId, role, message });
  result(true, error);
}

export async function getDashboardData() {
  const [requests, reports, flags, agents, notifications] = await Promise.all([
    listRequests(), listReports(), listFlags(), listAgents(), listNotifications(),
  ]);
  return { requests, reports, flags, agents, notifications };
}

export async function listRentalListings(filters: { town?: string; area?: string; campus?: string; bedrooms?: number; maxRent?: number } = {}) {
  const client = getAdminDb();
  if (!client) return [];
  let query = client.from("rental_listings").select("*").eq("status", "available").order("rent_amount");
  if (filters.town) query = query.ilike("town", filters.town);
  if (filters.area) query = query.ilike("area", `%${filters.area}%`);
  if (filters.campus) query = query.ilike("campus", `%${filters.campus}%`);
  if (filters.bedrooms !== undefined) query = query.eq("bedrooms", filters.bedrooms);
  if (filters.maxRent !== undefined) query = query.lte("rent_amount", filters.maxRent);
  const { data, error } = await query;
  return result((data ?? []) as RentalListing[], error);
}

export async function getRentalBySlug(slug: string) {
  const client = getAdminDb();
  if (!client) return null;
  const { data, error } = await client.from("rental_listings").select("*").eq("slug", slug).maybeSingle();
  return result(data as RentalListing | null, error);
}

export async function listAllRentalListings() {
  const client = getAdminDb();
  if (!client) return [];
  const { data, error } = await client.from("rental_listings").select("*").order("created_at", { ascending: false });
  return result((data ?? []) as RentalListing[], error);
}

export async function saveRentalListing(listing: Omit<RentalListing, "id" | "created_at"> & { id?: string }) {
  const { data, error } = await requireDb().from("rental_listings")
    .upsert(listing, { onConflict: "slug" }).select("*").single();
  return result(data as RentalListing, error);
}

export async function setRentalListingStatus(id: string, status: RentalListing["status"]) {
  const { error } = await requireDb().from("rental_listings").update({ status }).eq("id", id);
  result(true, error);
}

export async function createRentalInquiry(values: Omit<RentalInquiry, "id" | "created_at">) {
  const { error } = await requireDb().from("rental_inquiries").insert(values);
  result(true, error);
}
