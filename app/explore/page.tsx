import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PostThumbnail from "../components/PostThumbnail";

const TOPICS = [
  { name: "Privacy basics", terms: ["privacy", "privacy basics", "beginners"], mark: "01" },
  { name: "Tools", terms: ["tools", "browsers", "messaging", "vpn"], mark: "02" },
  { name: "Tracking", terms: ["tracking", "adtech", "location"], mark: "03" },
  { name: "Data rights", terms: ["data rights", "deletion", "gdpr"], mark: "04" },
  { name: "Guides", terms: ["guides", "how-to", "security"], mark: "05" },
  { name: "ToS audits", terms: ["tos-audit", "terms", "policy audit"], mark: "06" },
] as const;

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim().toLowerCase() ?? "";
  const posts = await prisma.post.findMany({
    where: { published: true }, orderBy: { createdAt: "desc" },
    select: { id: true, title: true, body: true, keywords: true, author: { select: { name: true } } },
  });
  const selectedTopic = TOPICS.find((topic) => topic.name.toLowerCase() === query);
  const terms: readonly string[] = selectedTopic ? selectedTopic.terms : [query];
  const visible = query ? posts.filter((post) => {
    const haystack = `${post.title} ${post.body} ${post.keywords.join(" ")} ${post.author.name ?? ""}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  }) : posts;

  return <main className="pb-28">
    <section className="border-b border-white/10 px-4 pb-12 pt-10 sm:px-9 sm:pb-16 sm:pt-16"><div className="mx-auto max-w-[1180px]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-neutral-500">Explore</p>
      <div className="mt-4 grid items-end gap-8 md:grid-cols-[1fr_26rem]"><h1 className="max-w-2xl text-balance text-4xl font-medium leading-[.98] tracking-[-0.055em] text-white sm:text-6xl">Find your next privacy conversation.</h1><p className="max-w-md text-sm leading-6 text-neutral-400 md:justify-self-end">Search community posts, browse recurring topics, and discover practical knowledge shared by other members.</p></div>
      <form className="mt-10" action="/explore"><label className="sr-only" htmlFor="explore-search">Search posts and topics</label><div className="flex min-h-14 items-center gap-3 rounded-full border border-white/15 bg-white/[.045] px-5 transition focus-within:border-white/35"><span aria-hidden="true" className="text-lg text-neutral-500">⌕</span><input id="explore-search" name="q" defaultValue={query} placeholder="Search browsers, tracking, data rights…" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600" />{query ? <Link href="/explore" className="text-xs text-neutral-400 underline underline-offset-4">Clear</Link> : null}</div></form>
    </div></section>
    <div className="mx-auto max-w-[1180px] px-4 sm:px-9">
      {!query ? <section className="py-12 sm:py-16" aria-labelledby="topics"><div className="mb-6 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">Browse</p><h2 id="topics" className="mt-2 text-xl font-medium tracking-[-0.03em]">Popular topics</h2></div><span className="text-xs text-neutral-600">{TOPICS.length} collections</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{TOPICS.map((topic) => {
        const count = posts.filter((post) => post.keywords.some((keyword) => topic.terms.some((term) => keyword.includes(term)))).length;
        return <Link key={topic.name} href={`/explore?q=${encodeURIComponent(topic.name)}`} className="group flex min-h-32 items-end justify-between rounded-2xl border border-white/10 bg-[#111114] p-5 transition hover:-translate-y-0.5 hover:border-white/20"><div><p className="text-lg font-medium tracking-[-0.025em]">{topic.name}</p><p className="mt-1 text-xs text-neutral-500">{count} {count === 1 ? "post" : "posts"}</p></div><span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-xs text-neutral-500 group-hover:text-white">{topic.mark}</span></Link>;
      })}</div></section> : null}
      <section className={query ? "py-12 sm:py-16" : "border-t border-white/10 py-12 sm:py-16"} aria-labelledby="discover-posts"><div className="mb-7 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">Discover</p><h2 id="discover-posts" className="mt-2 text-xl font-medium tracking-[-0.03em]">{query ? `Results for “${query}”` : "Recent discussions"}</h2></div><span className="text-xs text-neutral-600">{visible.length} {visible.length === 1 ? "result" : "results"}</span></div>
        {visible.length ? <ol className="divide-y divide-white/10 border-y border-white/10">{visible.map((post, index) => <li key={post.id}><Link href={`/posts/${post.id}`} className="group grid min-h-24 grid-cols-[2rem_4.5rem_minmax(0,1fr)_auto] items-center gap-4 py-5 sm:grid-cols-[3rem_5rem_minmax(12rem,1fr)_minmax(14rem,1fr)_auto]"><span className="text-xs tabular-nums text-neutral-700">{String(index + 1).padStart(2, "0")}</span><PostThumbnail title={post.title} keyword={post.keywords[0]} /><div><h3 className="font-medium tracking-[-0.02em] text-neutral-200 group-hover:text-white">{post.title}</h3><p className="mt-1 text-xs text-neutral-600">{post.author.name ?? "Community member"}</p></div><div className="hidden flex-wrap gap-1.5 sm:flex">{post.keywords.slice(0, 3).map((keyword) => <span key={keyword} className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.08em] text-neutral-500">{keyword}</span>)}</div><span className="text-neutral-600 transition group-hover:translate-x-1 group-hover:text-white">→</span></Link></li>)}</ol> : <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-white/10 text-center"><div><p className="text-sm text-neutral-300">No posts matched that search.</p><Link href="/explore" className="mt-2 inline-block text-xs text-neutral-500 underline underline-offset-4">Browse everything</Link></div></div>}
      </section>
    </div>
  </main>;
}
