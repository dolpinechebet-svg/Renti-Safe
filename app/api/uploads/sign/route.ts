import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminDb } from "@/lib/db";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"]);

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "agent") return NextResponse.json({ error: "Agent sign-in required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { name?: unknown; type?: unknown; size?: unknown } | null;
  if (!body || typeof body.name !== "string" || typeof body.type !== "string" || typeof body.size !== "number" || !allowed.has(body.type)) {
    return NextResponse.json({ error: "Unsupported upload." }, { status: 400 });
  }
  if (body.type.startsWith("video/") && body.size > 50 * 1024 * 1024) return NextResponse.json({ error: "Videos are limited to 50 MB." }, { status: 413 });
  if (body.type.startsWith("image/") && body.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Photos must be under 10 MB after compression." }, { status: 413 });
  const extension = body.type === "image/jpeg" ? "jpg" : body.type === "image/png" ? "png" : body.type === "image/webp" ? "webp" : body.type === "video/quicktime" ? "mov" : "mp4";
  const key = `${session.userId}/${randomUUID()}.${extension}`;
  const client = getAdminDb();
  if (!client) return NextResponse.json({ error: "Secure uploads are unavailable until Supabase is configured." }, { status: 503 });
  const { data, error } = await client.storage.from("verification-media").createSignedUploadUrl(key);
  if (error) {
    console.error("Could not create signed media upload:", error.message);
    return NextResponse.json({ error: "Could not prepare secure upload." }, { status: 500 });
  }
  return NextResponse.json({ key, token: data.token });
}
