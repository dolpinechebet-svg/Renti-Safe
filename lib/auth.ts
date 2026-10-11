import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getAgent, isSupabaseConfigured } from "@/lib/db";

export interface Session {
  role: "agent" | "admin";
  userId: string;
  town?: string;
}

const cookieName = "rentisafe_session";

function signature(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be configured before staff can sign in.");
  return createHmac("sha256", secret)
    .update(value).digest("hex");
}

export function makeSessionCookie(session: Session) {
  const value = Buffer.from(JSON.stringify({ ...session, exp: Date.now() + 7 * 24 * 3600_000 })).toString("base64url");
  return `${value}.${signature(value)}`;
}

export async function getSession(): Promise<Session | null> {
  if (!process.env.SESSION_SECRET) return null;
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return null;
  const [payload, signed] = value.split(".");
  if (!payload || !signed) return null;
  const expected = signature(payload);
  const actualBytes = Buffer.from(signed);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session & { exp: number };
    if (parsed.exp <= Date.now() || !["agent", "admin"].includes(parsed.role)) return null;
    return { role: parsed.role, userId: parsed.userId, town: parsed.town };
  } catch {
    return null;
  }
}

export async function authenticate(phoneOrEmail: string, password: string): Promise<Session | null> {
  if (!isSupabaseConfigured() || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.signInWithPassword({ email: phoneOrEmail, password });
  if (error || !data.user) return null;
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: adminUser, error: adminError } = await admin.from("admin_users").select("auth_user_id").eq("auth_user_id", data.user.id).maybeSingle();
  if (adminError) throw new Error(`Could not verify admin role: ${adminError.message}`);
  if (adminUser) return { role: "admin", userId: data.user.id };
  const { data: agentRow, error: agentError } = await admin.from("agents").select("id,town,active").eq("auth_user_id", data.user.id).maybeSingle();
  if (agentError) throw new Error(`Could not verify agent role: ${agentError.message}`);
  if (agentRow?.active) return { role: "agent", userId: agentRow.id, town: agentRow.town };
  return null;
}

export async function requireAgent(session: Session | null, requestId: string) {
  if (!session || session.role !== "agent") return false;
  const agent = await getAgent(session.userId);
  if (!agent?.active) return false;
  const request = await import("@/lib/db").then((module) => module.getRequestById(requestId));
  return Boolean(request && request.town.toLowerCase() === agent.town.toLowerCase());
}

export { cookieName };
