import { getServerSession } from "next-auth";
import Link from "next/link";
import type { CSSProperties } from "react";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildAuditVisualData } from "@/lib/audit-visual";

import CreatePostForm from "./components/CreatePostForm";
import RiskVisual from "./components/RiskVisual";

const palettes = [
  { background: "#dfeee6", ink: "#14231d", accent: "#f25b3f" },
  { background: "#28102f", ink: "#fff6dc", accent: "#ff795f" },
  { background: "#efe9d8", ink: "#202117", accent: "#5f67e8" },
  { background: "#102d20", ink: "#f0f3c7", accent: "#d8ed68" },
  { background: "#17233f", ink: "#f3edda", accent: "#f4bc4d" },
  { background: "#f0ded0", ink: "#321b18", accent: "#c64938" },
  { background: "#302225", ink: "#fff0e8", accent: "#fb785f" },
  { background: "#d9e4f4", ink: "#15243a", accent: "#3763d5" },
] as const;

function hashString(value: string) {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);
}

function postFacts(title: string, data: ReturnType<typeof buildAuditVisualData>) {
  const service = title.match(/Audit\s*[—–-]\s*([^(:]+)/i)?.[1]?.trim()
    ?? title.replace(/^Audit\s*[—–-]\s*/i, "");
  return { grade: data.grade, service, redFlags: data.counts["red-flag"], positives: data.counts.reasonable };
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const posts = await prisma.post.findMany({
    where: { published: true }, orderBy: { createdAt: "desc" }, take: 50,
    select: { id: true, title: true, body: true, keywords: true, metadata: true, author: { select: { name: true, email: true } } },
  });

  return (
    <main className="pb-36">
      <section className="px-3 pt-5 sm:px-8 sm:pt-8">
        <div className="mx-auto max-w-[1540px]">
          <div className="mb-8 flex items-end justify-between px-1 sm:mb-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">AUDITS</p>
              <h1 className="mt-2 max-w-xl text-balance text-2xl font-medium tracking-[-0.04em] text-neutral-100 sm:text-4xl">
              A hub for organizing around the terms you agree to
              </h1>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-neutral-500 md:block">
              Plain-language notes on ownership, privacy, payments, and the clauses worth noticing, written by other users.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="grid min-h-[55vh] place-items-center rounded-2xl border border-white/10">
              <p className="text-sm text-neutral-500">No entries yet. Be the first to post.</p>
            </div>
          ) : (
            <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 sm:gap-5">
              {posts.map((post) => {
                const seed = hashString(post.id + post.title);
                const palette = palettes[seed % palettes.length];
                const visualData = buildAuditVisualData(post.body, post.metadata);
                const facts = postFacts(post.title, visualData);
                const style = {
                  minHeight: `${350 + (seed % 4) * 55}px`, background: palette.background, color: palette.ink,
                  "--card-bg": palette.background, "--card-accent": palette.accent,
                } as CSSProperties;

                return (
                  <li key={post.id} className="mb-4 break-inside-avoid sm:mb-5">
                    <Link href={`/posts/${post.id}`} style={style}
                      className="group relative flex overflow-hidden rounded-[3px] transition duration-500 hover:-translate-y-1 hover:brightness-105">
                      <div className="absolute inset-x-0 top-0 h-[67%] text-[var(--card-accent)] transition-transform duration-700 group-hover:scale-[1.025]">
                        <RiskVisual description={visualData.description} variant={seed % 4} />
                      </div>
                      <div className="relative z-10 mt-auto w-full bg-gradient-to-t from-[var(--card-bg)] via-[var(--card-bg)]/95 to-transparent px-5 pb-5 pt-20">
                        <div className="mb-4 flex items-end justify-between gap-3 border-b border-current/15 pb-3">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">Terms audit</span>
                          <span className="text-4xl font-semibold tracking-[-0.06em]">{facts.grade}</span>
                        </div>
                        <h2 className="max-w-[19rem] text-[15px] font-semibold leading-[1.15] tracking-[-0.025em]">{facts.service}</h2>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(post.keywords.length > 0 ? post.keywords : ["terms audit"]).slice(0, 4).map((keyword) => (
                            <span key={keyword} className="rounded-full border border-current/20 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.08em] opacity-70">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px] opacity-60">
                          <span>{facts.redFlags} clauses flagged</span><span>{facts.positives} reasonable</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[11px] opacity-55">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--card-accent)] font-semibold text-white">T</span>
                          <span>{post.author.name ?? post.author.email ?? "ToS Index"}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <div id="new-entry" className="fixed inset-x-0 bottom-0 z-30 px-3 pb-4 sm:px-6 sm:pb-6">
        <details className="group mx-auto max-w-xl rounded-[26px] border border-white/10 bg-[#161618]/95 shadow-[0_20px_70px_rgba(0,0,0,.65)] backdrop-blur-xl open:rounded-2xl">
          <summary className="flex h-12 cursor-pointer list-none items-center justify-between pl-5 pr-1.5 text-sm text-neutral-500 [&::-webkit-details-marker]:hidden">
            <span>{session?.user ? "Add a terms-of-service audit…" : "Join the community index…"}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-200 text-lg text-neutral-950 transition group-open:rotate-45">→</span>
          </summary>
          <div className="max-h-[75vh] overflow-y-auto border-t border-white/10 p-2">
            {session?.user ? <CreatePostForm userEmail={session.user.email ?? ""} /> : (
              <div className="flex items-center justify-between gap-4 p-4">
                <p className="text-sm text-neutral-400">Create an account to publish an audit.</p>
                <Link href="/signup" className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Sign up</Link>
              </div>
            )}
          </div>
        </details>
      </div>
    </main>
  );
}
