import { z } from "zod";

const phone = z.string().trim().regex(/^(?:\+?254|0)(?:7|1)\d{8}$/, "Enter a valid Kenyan mobile number.");

export const requestSchema = z.object({
  tenant_phone: phone,
  landlord_phone: phone,
  listing_link: z.union([z.literal(""), z.string().url()]).optional(),
  location_text: z.string().trim().max(240).optional(),
  town: z.string().trim().min(2).max(80),
  package_type: z.enum(["in_town", "video_call"]),
  accepted_policies: z.literal("yes", { error: "Please accept the Terms and Privacy Policy." }),
  website: z.string().max(0).optional(),
}).refine((value) => Boolean(value.listing_link || value.location_text), {
  message: "Add a listing link or tell us where the house is.",
  path: ["location_text"],
});

export const reportSchema = z.object({
  request_id: z.string().min(1),
  house_exists: z.enum(["yes", "no"]),
  is_vacant: z.enum(["yes", "no"]),
  caretaker_id_match: z.enum(["yes", "no"]),
  kplc_match: z.enum(["yes", "no"]),
  water_bill_match: z.enum(["yes", "no"]),
  duplicate_listing: z.enum(["yes", "no"]),
  notes: z.string().trim().max(2000),
  video_url: z.string().trim().regex(/^[a-z0-9-]+\/[a-z0-9-]+\.(?:mp4|mov)$/i).optional().or(z.literal("")),
  photo_urls: z.array(z.string().trim().regex(/^[a-z0-9-]+\/[a-z0-9-]+\.(?:jpg|png|webp)$/i)).min(1, "Upload at least one inspection photo."),
});

export const loginSchema = z.object({ identifier: z.string().trim().min(3).max(160), password: z.string().min(1).max(200) });
export const agentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone,
  town: z.string().trim().min(2).max(80),
  active: z.boolean().default(true),
});
export const flagSchema = z.object({
  landlord_phone: phone,
  reason: z.string().trim().min(10).max(600),
  linked_request_id: z.string().optional().or(z.literal("")),
});
export const disputeSchema = z.object({
  flag_id: z.string().min(1),
  submitter_name: z.string().trim().min(2).max(120),
  submitter_phone: phone,
  message: z.string().trim().min(10).max(1200),
  evidence_url: z.string().url().optional().or(z.literal("")),
});

export const rentalInquirySchema = z.object({
  listing_id: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  phone,
  message: z.string().trim().min(5).max(600),
  website: z.string().max(0).optional(),
});

export const rentalListingSchema = z.object({
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(10).max(1500),
  town: z.string().trim().min(2).max(80),
  area: z.string().trim().min(2).max(100),
  campus: z.string().trim().max(120).nullable().optional(),
  property_type: z.string().trim().min(3).max(60),
  bedrooms: z.coerce.number().int().min(0).max(10),
  rent_amount: z.coerce.number().int().positive().max(2_000_000),
  deposit_amount: z.coerce.number().int().nonnegative().max(2_000_000),
  amenities: z.array(z.string().trim().min(1).max(80)).max(20),
  contact_phone: phone,
  status: z.enum(["available", "let"]).default("available"),
});
