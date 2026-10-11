import { NextResponse } from "next/server";
import { getRequestByTracking, getReport, getAdminDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await context.params;
  const key = segments.join("/");
  const token = new URL(request.url).searchParams.get("tracking");
  if (!token || segments.some((segment) => !segment || segment === "." || segment === "..")) return new NextResponse("Not found", { status: 404 });
  const requestRecord = await getRequestByTracking(token);
  if (!requestRecord) return new NextResponse("Not found", { status: 404 });
  const report = await getReport(requestRecord.id);
  if (!report || ![report.video_url, ...report.photo_urls].includes(key)) return new NextResponse("Not found", { status: 404 });

  const client = getAdminDb();
  if (!client) return new NextResponse("Media storage is not configured.", { status: 503 });
  const { data, error } = await client.storage.from("verification-media").createSignedUrl(key, 60);
  if (error || !data?.signedUrl) return new NextResponse("Media unavailable", { status: 404 });
  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
