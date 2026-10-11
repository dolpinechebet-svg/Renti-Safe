import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Keja verification guides",
  description: "Practical rental safety guides for tenants and students in Kenya.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "RentiSafe keja guides", description: "Practical rental safety guides in Kenya." },
  twitter: { card: "summary", title: "RentiSafe keja guides", description: "Practical rental safety guides in Kenya." },
};

export default function BlogPage() {
  return <section className="wrap" style={{ padding: "45px 0" }}>
    <span className="eyebrow">Renter guides</span><h1 style={{ fontSize: "2.8rem" }}>Before utume deposit</h1>
    <p className="lead">Simple checks to help you slow down, ask the right questions and verify a rental.</p>
    <div className="cards">{posts.map((post) => <article className="card" key={post.slug}><h2 style={{ fontSize: "1.4rem" }}><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.description}</p><p><Link href={`/blog/${post.slug}`}>Read guide →</Link></p></article>)}</div>
  </section>;
}
