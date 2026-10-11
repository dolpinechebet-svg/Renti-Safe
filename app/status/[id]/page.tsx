import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAgent, getReport, getRequestByTracking } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Private verification status", robots: { index: false, follow: false } };
}

const steps = ["Request received", "Agent assigned", "Inspection in progress", "Report ready"] as const;

export default async function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: token } = await params;
  const request = await getRequestByTracking(token);
  if (!request) notFound();
  const report = await getReport(request.id);
  const agent = request.assigned_agent_id ? await getAgent(request.assigned_agent_id) : null;
  const current = request.status === "report_ready" ? 3 : request.status === "in_progress" ? 2 : request.status === "assigned" ? 1 : 0;
  return <section className="wrap" style={{ padding: "42px 0" }}>
    <p><span className="eyebrow">Private tracking link</span></p>
    <h1 style={{ fontSize: "2.5rem" }}>Verification status</h1>
    <p className="lead">{request.location_text || request.listing_link} · {request.town}</p>
    <div className="card" style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><strong>Request {request.id.slice(0, 8)}</strong><span className="tag">{request.status.replaceAll("_", " ")}</span></div>
      <div className="status-list">{steps.map((step, index) => <div key={step} className={`status-step ${index <= current ? "done" : ""}`}><span className="status-dot" />{step}</div>)}</div>
      {agent && <p><strong>Local verifier:</strong> {agent.name} · {agent.town}</p>}
      <p className="hint">Request created {new Date(request.created_at).toLocaleString("en-KE")} · KES {request.fee_amount} · payment {request.payment_status}</p>
    </div>
    {report && <article className="receipt">
      <header className="receipt-head"><div><strong>RENTISAFE · INSPECTION REPORT</strong><div className="muted">Report {report.id.slice(0, 8)} · {new Date(report.created_at).toLocaleDateString("en-KE")}</div></div>
        <span className={`verdict ${report.verdict}`}>{report.verdict === "GREEN" ? "GREEN · CHECKS PASSED" : "RED · REVIEW BEFORE PAYING"}</span>
      </header>
      <div className="receipt-body">
        <div className="grid2"><div><small className="muted">RISK SCORE</small><h2>{report.risk_score}%</h2></div><div><small className="muted">LOCATION</small><p>{request.location_text || request.listing_link}, {request.town}</p></div></div>
        <div className="checks">
          {[
            ["House exists", report.house_exists], ["Vacant", report.is_vacant], ["Caretaker ID matches listing", report.caretaker_id_match],
            ["KPLC meter matches", report.kplc_match], ["Water bill matches", report.water_bill_match], ["Duplicate listing found", report.duplicate_listing],
          ].map(([label, pass]) => <div className="check" key={String(label)}><span>{String(label)}</span><strong style={{ color: pass ? "#27784c" : "#a93d31" }}>{pass ? (label === "Duplicate listing found" ? "No" : "Yes") : (label === "Duplicate listing found" ? "Yes" : "No")}</strong></div>)}
        </div>
        {report.notes && <div><h3>Verifier notes</h3><p>{report.notes}</p></div>}
        <div className="photos">{report.photo_urls.map((key) => <Image className="media-img" key={key} src={`/api/media/${key.split("/").map(encodeURIComponent).join("/")}?tracking=${encodeURIComponent(token)}`} width={1200} height={900} unoptimized sizes="(max-width: 760px) 100vw, 50vw" alt="Rental property inspection photo taken by the local verifier" loading="lazy" />)}</div>
        {report.video_url && <video controls preload="none" style={{ width: "100%", maxHeight: 420, marginTop: 14 }} aria-label="Rental property verification video"><source src={`/api/media/${encodeURIComponent(report.video_url)}?tracking=${encodeURIComponent(token)}`} /></video>}
        <p className="hint">This is an inspection at one point in time, not a guarantee or legal advice. Your final decision is yours.</p>
      </div>
    </article>}
  </section>;
}
