export type RequestStatus = "pending" | "assigned" | "in_progress" | "report_ready" | "cancelled";
export type PackageType = "in_town" | "video_call";
export type FlagStatus = "pending_review" | "published" | "disputed" | "removed";

export interface Agent {
  id: string;
  name: string;
  phone: string;
  town: string;
  active: boolean;
}

export interface VerificationRequest {
  id: string;
  tracking_token: string;
  tenant_phone: string;
  landlord_phone: string;
  listing_link: string | null;
  location_text: string | null;
  town: string;
  package_type: PackageType;
  fee_amount: number;
  payment_status: "unpaid" | "paid" | "refunded";
  status: RequestStatus;
  assigned_agent_id: string | null;
  created_at: string;
}

export interface VerificationReport {
  id: string;
  request_id: string;
  house_exists: boolean;
  is_vacant: boolean;
  caretaker_id_match: boolean;
  kplc_match: boolean;
  water_bill_match: boolean;
  duplicate_listing: boolean;
  notes: string;
  video_url: string | null;
  photo_urls: string[];
  verdict: "GREEN" | "RED";
  risk_score: number;
  created_at: string;
}

export interface ScamFlag {
  id: string;
  landlord_phone: string;
  reason: string;
  linked_request_id: string | null;
  evidence_urls: string[];
  status: FlagStatus;
  flagged_at: string;
}

export interface Notification {
  id: string;
  request_id: string | null;
  channel: "whatsapp" | "system";
  message: string;
  created_at: string;
}

export interface ScamDispute {
  id: string;
  flag_id: string;
  submitter_name: string;
  submitter_phone: string;
  message: string;
  evidence_url: string | null;
  status: string;
  created_at: string;
}

export interface RentalListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  town: string;
  area: string;
  campus: string | null;
  property_type: string;
  bedrooms: number;
  rent_amount: number;
  deposit_amount: number;
  amenities: string[];
  contact_phone: string;
  status: "available" | "let";
  created_at: string;
}

export interface RentalInquiry {
  id: string;
  listing_id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
}
