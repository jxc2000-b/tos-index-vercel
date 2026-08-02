import Link from "next/link";

import { buildAuditVisualData } from "@/lib/audit-visual";
import { prisma } from "@/lib/prisma";

const TOPICS = [
  { name: "Privacy", terms: ["privacy", "tracking", "student data", "voice data", "health data"], mark: "P" },
  { name: "Money", terms: ["billing", "refund policy", "fund holds", "auto-renewal"], mark: "$" },
  { name: "Ownership", terms: ["content ownership", "data rights"], mark: "O" },
  { name: "Account control", terms: ["account control", "moderation"], mark: "A" },
  { name: "Legal", terms: ["arbitration", "liability", "consumer rights"], mark: "L" },
  { name: "Retention", terms: ["data retention", "digital access"], mark: "R" },
] as const;

function serviceName(title: string) {
  return title
    .replace(/^Audit\s*[—–-]\s*/i, "")
    .replace(/^\[Fictional demo\]\s*/i, "")
    .split(/[(:]/)[0]
    .trim();
}

export default async function TosIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q?.trim().toLowerCase() ?? "";
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { title: "asc" },
    select: { id: true, title: true, body: true, keywords: true, metadata: true },
  });
  const entries = posts.map((post) => ({
    ...post,
    name: serviceName(post.title),
    audit: buildAuditVisualData(post.body, post.metadata),
  }));
  const selectedTopic = TOPICS.find((topic) => topic.name.toLowerCase() === query);
  const searchTerms = selectedTopic ? selectedTopic.terms : [query];
  const visible = query
    ? entries.filter((entry) => {
        const haystack = ` `.toLowerCase();
        return searchTerms.some((term) => haystack.includes(term));
      })
    : entries;

  return (
    <main className="pb-28">
      <section className="border-b border-white/10 px-4 pb-12 pt-10 sm:px-9 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-neutral-500">ToS index</p>
          <div className="mt-4 grid items-end gap-8 md:grid-cols-[1fr_26rem]">
            <h1 className="max-w-2xl text-balance text-4xl font-medium leading-[.98] tracking-[-0.055em] text-white sm:text-6xl">
              Find the terms behind the tools you use.
            </h1>
            <p className="max-w-md text-sm leading-6 text-neutral-400 md:justify-self-end">
              Browse fictional services by topic, compare their grades, and open a community audit for the details.
            </p>
          </div>

          <form className="mt-10" action="/tos-index">
            <label className="sr-only" htmlFor="index-search">Search services and topics</label>
            <div className="flex min-h-14 items-center gap-3 rounded-full border border-white/15 bg-white/[.045] px-5 transition focus-within:border-white/35 focus-within:bg-white/[.065]">
              <span aria-hidden="true" className="text-lg text-neutral-500">⌕</span>
              <input id="index-search" name="q" defaultValue={query} placeholder="Search services, privacy, billing, ownership…" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600" />
              {query ? <Link href="/tos-index" className="text-xs text-neutral-400 underline underline-offset-4">Clear</Link> : null}
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-4 sm:px-9">
        {!query ? (
          <section className="py-12 sm:py-16" aria-labelledby="browse-topics">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">Browse</p>
                <h2 id="browse-topics" className="mt-2 text-xl font-medium tracking-[-0.03em]">Explore by topic</h2>
              </div>
              <span className="text-xs text-neutral-600">{TOPICS.length} collections</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOPICS.map((topic, index) => {
                const matches = entries.filter((entry) => entry.keywords.some((keyword) => topic.terms.includes(keyword as never)));
                return (
                  <Link key={topic.name} href={`/tos-index?q=${encodeURIComponent(topic.name)}`} className="group flex min-h-32 items-end justify-between rounded-2xl border border-white/10 bg-[#111114] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#16161a]">
                    <div>
                      <p className="text-lg font-medium tracking-[-0.025em]">{topic.name}</p>
                      <p className="mt-1 text-xs text-neutral-500">{matches.length} indexed services</p>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-sm text-neutral-400 transition group-hover:border-white/25 group-hover:text-white" style={{ transform: `rotate(${index % 2 ? 7 : -7}deg)` }}>{topic.mark}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className={query ? "py-12 sm:py-16" : "border-t border-white/10 py-12 sm:py-16"} aria-labelledby="service-directory">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">Directory</p>
              <h2 id="service-directory" className="mt-2 text-xl font-medium tracking-[-0.03em]">{query ? `Results for “${query}”` : "All indexed services"}</h2>
            </div>
            <span className="text-xs text-neutral-600">{visible.length} {visible.length === 1 ? "result" : "results"}</span>
          </div>

          {visible.length ? (
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {visible.map((entry, index) => (
                <li key={entry.id}>
                  <Link href={`/posts/${entry.id}`} className="group grid min-h-24 grid-cols-[2rem_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[3rem_minmax(12rem,1fr)_minmax(14rem,1fr)_auto]">
                    <span className="text-xs tabular-nums text-neutral-700">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-medium tracking-[-0.02em] text-neutral-200 transition group-hover:text-white">{entry.name}</h3>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-neutral-600">Fictional demo</p>
                    </div>
                    <div className="hidden flex-wrap gap-1.5 sm:flex">
                      {entry.keywords.slice(0, 3).map((keyword) => <span key={keyword} className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.08em] text-neutral-500">{keyword}</span>)}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-semibold tracking-[-0.05em] text-neutral-300">{entry.audit.grade}</span>
                      <span aria-hidden="true" className="text-neutral-600 transition group-hover:translate-x-1 group-hover:text-white">→</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-white/10 text-center">
              <div><p className="text-sm text-neutral-300">Nothing indexed under that term.</p><Link href="/tos-index" className="mt-2 inline-block text-xs text-neutral-500 underline underline-offset-4">Browse everything</Link></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
