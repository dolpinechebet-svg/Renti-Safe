import { redirect } from "next/navigation";
import { AddAgentForm, AssignForm, EditAgentForm, FlagControls } from "@/components/admin-controls";
import { LogoutButton } from "@/components/logout-button";
import { RentalListingAdminForm, RentalListingStatus } from "@/components/rental-listing-admin";
import { getSession } from "@/lib/auth";
import { getDashboardData, listAllRentalListings } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/agent");
  const [{ requests, reports, flags, agents, notifications }, rentalListings] = await Promise.all([getDashboardData(), listAllRentalListings()]);
  const counts = {
    total: requests.length,
    active: requests.filter((request) => ["pending", "assigned", "in_progress"].includes(request.status)).length,
    reports: requests.filter((request) => request.status === "report_ready").length,
    reviews: flags.filter((flag) => flag.status === "pending_review" || flag.status === "disputed").length,
  };
  return <section className="wrap" style={{ padding: "38px 0" }}>
    <span className="eyebrow">RentiSafe operations</span><h1 style={{ fontSize: "2.7rem" }}>Admin dashboard</h1>
    <div className="cards" style={{ marginBottom: 30 }}>{Object.entries(counts).map(([label, value]) => <article className="card" key={label}><small className="muted">{label.toUpperCase()}</small><h2 style={{ margin: "3px 0" }}>{value}</h2></article>)}</div>
    <section className="card"><h2>Verification requests</h2><div className="table-wrap"><table><thead><tr><th>Created / ID</th><th>Location</th><th>Tenant / Landlord</th><th>Status / verdict</th><th>Town assignment</th></tr></thead>
      <tbody>{requests.map((request) => {
        const agent = agents.find((item) => item.id === request.assigned_agent_id);
        const report = reports.find((item) => item.request_id === request.id);
        return <tr key={request.id}><td>{new Date(request.created_at).toLocaleDateString("en-KE")}<br /><small>{request.id.slice(0, 8)}</small></td>
          <td>{request.location_text || request.listing_link}<br /><small>{request.town} · KES {request.fee_amount}</small></td>
          <td>{request.tenant_phone}<br />{request.landlord_phone}</td>
          <td><span className="tag">{request.status.replaceAll("_", " ")}</span>{report && <><br /><strong className={`verdict ${report.verdict}`} style={{ display: "inline-block", fontSize: ".8rem", marginTop: 6 }}>{report.verdict}</strong></>}</td>
          <td><AssignForm requestId={request.id} agentId={request.assigned_agent_id || ""} agents={agents.filter((item) => item.active && item.town.toLowerCase() === request.town.toLowerCase())} />{agent && <small>{agent.name}</small>}</td>
        </tr>;
      })}</tbody></table></div></section>
    <section className="section">
      <div className="section-head"><h2>Agents</h2><p className="muted">In Supabase mode, link each agent to their Supabase Auth user for login.</p></div>
      <div className="grid2"><AddAgentForm /><div className="stack">{agents.map((agent) => <article className="card" key={agent.id}><EditAgentForm agent={agent} /></article>)}</div></div>
    </section>
    <section className="section"><h2>Scam database review</h2><p className="muted">New agent-evidence flags stay private until an admin approves publication. Public listings show masked numbers only.</p>
      <div className="stack">{flags.map((flag) => <article key={flag.id} className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><h3>{flag.landlord_phone} · {flag.linked_request_id ? `Request ${flag.linked_request_id.slice(0, 8)}` : "No linked request"}</h3><span className="tag">{flag.status.replaceAll("_", " ")}</span></div>
        <FlagControls id={flag.id} status={flag.status} phone={flag.landlord_phone} reason={flag.reason} />
      </article>)}</div>
    </section>
    <section className="section"><h2>Mock WhatsApp / system notifications</h2>{notifications.length ? <div className="stack">{notifications.map((notification) => <div className="card" key={notification.id}><span className="tag">{notification.channel}</span><p>{notification.message}</p><small className="muted">{new Date(notification.created_at).toLocaleString("en-KE")}</small></div>)}</div> : <p className="card">No notifications yet.</p>}</section>
    <section className="section">
      <div className="section-head"><h2>Housing listings</h2><p className="muted">Only publish homes you are authorized to market. Keep vacancy and rent information accurate.</p></div>
      <div className="grid2" style={{ alignItems: "start" }}><RentalListingAdminForm /><div className="stack">{rentalListings.map((listing) => <article className="card" key={listing.id}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><h3>{listing.title}</h3><p>{listing.area}, {listing.town}{listing.campus ? ` · ${listing.campus}` : ""}</p><p>KES {listing.rent_amount.toLocaleString("en-KE")} a month</p></div>
          <RentalListingStatus id={listing.id} status={listing.status} />
        </div>
      </article>)}</div></div>
    </section>
    <LogoutButton />
  </section>;
}
