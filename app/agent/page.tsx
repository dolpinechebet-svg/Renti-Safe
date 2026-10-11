import { redirect } from "next/navigation";
import { AgentReportForm } from "@/components/agent-report-form";
import { LogoutButton } from "@/components/logout-button";
import { AgentStartButton } from "@/components/agent-start-button";
import { getSession } from "@/lib/auth";
import { getAgent, listRequests } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agent jobs", robots: { index: false, follow: false } };

export default async function AgentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");
  const agent = await getAgent(session.userId);
  if (!agent?.active) redirect("/login");
  const jobs = (await listRequests()).filter((request) =>
    request.town.toLowerCase() === agent.town.toLowerCase() && ["pending", "assigned", "in_progress"].includes(request.status),
  );
  return <section className="wrap" style={{ padding: "42px 0" }}>
    <span className="eyebrow">Agent workspace · {agent.town}</span>
    <h1 style={{ fontSize: "2.7rem" }}>Sasa, {agent.name.split(" ")[0]}.</h1>
    <p className="lead">Jobs for {agent.town}. Only submit what you personally checked at the house.</p>
    {jobs.length ? <div className="stack">{jobs.map((job) => <article className="card" key={job.id}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div><span className="tag">{job.status.replaceAll("_", " ")}</span><h2 style={{ fontSize: "1.4rem" }}>{job.location_text || job.listing_link}</h2>
          <p className="muted">Landlord: {job.landlord_phone} · Tenant: {job.tenant_phone} · KES {job.fee_amount}</p>
        </div>
        <div><a href={`https://wa.me/${job.tenant_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm your RentiSafe verifier for ${job.town}. I'm coordinating the property check.`)}`} target="_blank" rel="noreferrer">Contact tenant</a></div>
      </div>
      {job.status !== "in_progress" && <div style={{ margin: "12px 0" }}><AgentStartButton requestId={job.id} /></div>}
      <AgentReportForm requestId={job.id} />
    </article>)}</div> : <p className="card">No open verification jobs in {agent.town} right now.</p>}
    <div style={{ marginTop: 20 }}><LogoutButton /></div>
  </section>;
}
