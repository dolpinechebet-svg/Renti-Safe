import { NextResponse } from "next/server";
import { createRentalInquiry, isSupabaseConfigured, listAllRentalListings, logNotification } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { rentalInquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured. Viewing requests cannot be saved." }, { status: 503 });
  const ip = getClientIp(request);
  if (!rateLimit(`rental-inquiry:${ip}`, 5, 60 * 60_000).allowed) return NextResponse.json({ error: "Too many viewing requests. Please try again later." }, { status: 429 });
  const body = await request.json().catch(() => null);
  const parsed = rentalInquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check your viewing request." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ error: "Request could not be accepted." }, { status: 400 });
  try {
    const listing = (await listAllRentalListings()).find((item) => item.id === parsed.data.listing_id);
    if (!listing || listing.status !== "available") return NextResponse.json({ error: "This home is no longer available." }, { status: 409 });
    await createRentalInquiry({
      listing_id: listing.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      message: parsed.data.message,
    });
    await logNotification(null, `Rental viewing request for "${listing.title}" in ${listing.area}, ${listing.town}. Contact ${parsed.data.name} at ${parsed.data.phone}. Message: ${parsed.data.message}`);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Could not save rental inquiry:", error);
    return NextResponse.json({ error: "We could not save your request. Please try again." }, { status: 500 });
  }
}
