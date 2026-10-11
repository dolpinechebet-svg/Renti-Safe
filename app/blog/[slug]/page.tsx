import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { posts } from "@/lib/content";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

async function loadPost(slug: string) {
  if (!posts.some((post) => post.slug === slug)) return null;
  const source = await fs.readFile(path.join(process.cwd(), "content", "blog", `${slug}.mdx`), "utf8");
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!frontmatter) throw new Error(`Blog post "${slug}" is missing frontmatter.`);
  const data: Record<string, string> = {};
  for (const line of frontmatter[1]!.split(/\r?\n/)) {
    const field = line.match(/^([a-z]+):\s*"?([^"\r\n]*)"?$/);
    if (field) data[field[1]!] = field[2]!;
  }
  if (!data.title || !data.description) throw new Error(`Blog post "${slug}" requires a title and description.`);
  return { data, content: source.slice(frontmatter[0].length) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  return {
    title: String(post.data.title),
    description: String(post.data.description),
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", title: String(post.data.title), description: String(post.data.description), url: `/blog/${slug}` },
    twitter: { card: "summary", title: String(post.data.title), description: String(post.data.description) },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();
  return <article className="wrap policy">
    <span className="eyebrow">Renter guide · Kenya</span><h1>{String(post.data.title)}</h1>
    <p className="lead">{String(post.data.description)}</p>
    <div className="mdx-content"><MDXRemote source={post.content} /></div>
    <p><Link className="btn" href="/#request">Verify a house first</Link></p>
  </article>;
}
