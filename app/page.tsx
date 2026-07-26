import { getServerSession } from "next-auth";
import Link from "next/link";
import type { CSSProperties } from "react";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import CreatePostForm from "./components/CreatePostForm";

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

function postFacts(title: string, body: string) {
  const grade = body.match(/Grade:\s*([^\n]+)/i)?.[1]?.trim() ?? "—";
  const service = title.match(/Audit\s*[—–-]\s*([^(:]+)/i)?.[1]?.trim()
    ?? title.replace(/^Audit\s*[—–-]\s*/i, "");
  const redFlags = body.match(/^\s*- /gm)?.length ?? 0;
  const reasonable = body.match(/Reasonable\s*\n([\s\S]*?)(?:\n\n|Verdict:)/i)?.[1] ?? "";
  const positives = reasonable.match(/^\s*- /gm)?.length ?? 0;
  return { grade, service, redFlags, positives };
}

function RiskVisual({ seed, grade, redFlags }: { seed: number; grade: string; redFlags: number }) {
  const variant = seed % 4;

  if (variant === 0) {
    return (
      <div className="flex h-full items-end gap-2 px-6 pb-5 pt-12" aria-hidden="true">
        {[42, 66, 52, 84, 61, 93].map((height, index) => (
          <div key={index} className="flex-1 rounded-t-full bg-current opacity-80" style={{ height: `${height}%` }} />
        ))}
      </div>
    );
  }

  if (variant === 1) {
    return (
      <div className="relative h-full" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current opacity-20" />
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-[18px] border-current opacity-40" />
        <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-current">
          <span className="text-3xl font-semibold" style={{ color: "var(--card-bg)" }}>{grade}</span>
        </div>
      </div>
    );
  }

  if (variant === 2) {
    return (
      <div className="relative h-full overflow-hidden" aria-hidden="true">
        {Array.from({ length: Math.max(4, redFlags + 2) }).map((_, index) => (
          <span key={index} className="absolute block rounded-full border border-current" style={{
            width: `${44 + index * 22}px`, height: `${44 + index * 22}px`,
            left: `${10 + ((index * 19) % 58)}%`, top: `${6 + ((index * 23) % 62)}%`,
            opacity: 0.18 + index * 0.06, transform: "translate(-50%, -50%)",
          }} />
        ))}
      </div>
    );
  }

  const points = "8,85 26,53 43,66 61,29 78,45 96,13";
  return (
    <svg viewBox="0 0 104 100" className="h-full w-full p-7" preserveAspectRatio="none" aria-hidden="true">
      <path d={`M ${points} L 96 100 L 8 100 Z`} fill="currentColor" opacity=".17" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {points.split(" ").map((point) => {
        const [cx, cy] = point.split(",");
        return <circle key={point} cx={cx} cy={cy} r="2.5" fill="currentColor" />;
      })}
    </svg>
  );
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const posts = await prisma.post.findMany({
    where: { published: true }, orderBy: { createdAt: "desc" }, take: 50,
    select: { id: true, title: true, body: true, keywords: true, author: { select: { name: true, email: true } } },
  });

  return (
    <main className="pb-36">
      <section className="px-3 pt-5 sm:px-8 sm:pt-8">
        <div className="mx-auto max-w-[1540px]">
          <div className="mb-8 flex items-end justify-between px-1 sm:mb-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">Community audits</p>
              <h1 className="mt-2 max-w-xl text-balance text-2xl font-medium tracking-[-0.04em] text-neutral-100 sm:text-4xl">
                The terms you agreed to, made visible.
              </h1>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-6 text-neutral-500 md:block">
              Plain-language notes on ownership, privacy, payments, and the clauses worth noticing.
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
                const facts = postFacts(post.title, post.body);
                const style = {
                  minHeight: `${350 + (seed % 4) * 55}px`, background: palette.background, color: palette.ink,
                  "--card-bg": palette.background, "--card-accent": palette.accent,
                } as CSSProperties;

                return (
                  <li key={post.id} className="mb-4 break-inside-avoid sm:mb-5">
                    <Link href={`/posts/${post.id}`} style={style}
                      className="group relative flex overflow-hidden rounded-[3px] transition duration-500 hover:-translate-y-1 hover:brightness-105">
                      <div className="absolute inset-x-0 top-0 h-[67%] text-[var(--card-accent)] transition-transform duration-700 group-hover:scale-[1.025]">
                        <RiskVisual seed={seed} grade={facts.grade} redFlags={facts.redFlags} />
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
