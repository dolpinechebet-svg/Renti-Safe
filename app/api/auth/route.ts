import { NextResponse } from "next/server";
import { authenticate, cookieName, makeSessionCookie } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Staff sign-in is unavailable." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter your sign-in details." }, { status: 400 });
  const session = await authenticate(parsed.data.identifier, parsed.data.password);
  if (!session) return NextResponse.json({ error: "Sign-in details were not accepted." }, { status: 401 });
  const response = NextResponse.json({ role: session.role, redirect: session.role === "admin" ? "/admin" : "/agent" });
  response.cookies.set(cookieName, makeSessionCookie(session), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7 * 24 * 3600,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(cookieName);
  return response;
}
