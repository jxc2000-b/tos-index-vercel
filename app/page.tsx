import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import CreatePostForm from "./components/CreatePostForm";
import PostThumbnail from "./components/PostThumbnail";

function excerpt(body: string) {
  const plain = body.replace(/^#+\s+/gm, "").replace(/\s+/g, " ").trim();
  return plain.length > 220 ? `${plain.slice(0, 217).trimEnd()}…` : plain;
}

export default async function PostsPage() {
  const session = await getServerSession(authOptions);
  const posts = await prisma.post.findMany({
    where: { published: true }, orderBy: { createdAt: "desc" }, take: 50,
    select: { id: true, title: true, body: true, keywords: true, createdAt: true, author: { select: { name: true } } },
  });
  return (
    <main className="pb-36">
      <section className="border-b border-white/10 px-4 pb-10 pt-8 sm:px-9 sm:pb-14 sm:pt-12">
        <div className="mx-auto max-w-[1080px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-neutral-500">Posts</p>
          <div className="mt-3 grid items-end gap-5 md:grid-cols-[1fr_22rem]">
            <h1 className="max-w-2xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl">Talk privacy with people who care about it.</h1>
            <p className="text-sm leading-6 text-neutral-400">Questions, field notes, practical guides, and close reads of the policies shaping our digital lives.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1080px] px-4 py-10 sm:px-9 sm:py-14" aria-labelledby="latest-posts">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div><p className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">Community feed</p><h2 id="latest-posts" className="mt-2 text-xl font-medium tracking-[-0.03em]">Latest posts</h2></div>
          <Link href="/explore" className="text-sm text-neutral-400 transition hover:text-white">Explore topics →</Link>
        </div>
        {posts.length === 0 ? <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-white/10 text-sm text-neutral-500">No posts yet. Start the conversation.</div> : (
          <ol className="divide-y divide-white/10 border-y border-white/10">{posts.map((post) => (
            <li key={post.id}><Link href={`/posts/${post.id}`} className="group grid grid-cols-[5rem_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[7rem_minmax(0,1fr)_9rem] sm:gap-6">
              <PostThumbnail title={post.title} keyword={post.keywords[0]} />
              <div><div className="mb-3 flex flex-wrap gap-1.5">{post.keywords.slice(0, 3).map((keyword) => <span key={keyword} className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.09em] text-neutral-500">{keyword}</span>)}</div>
                <h3 className="text-xl font-medium tracking-[-0.035em] text-neutral-100 transition group-hover:text-white sm:text-2xl">{post.title}</h3><p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">{excerpt(post.body)}</p></div>
              <div className="col-start-2 mt-1 flex items-center justify-between text-xs text-neutral-600 sm:mt-1 sm:block sm:text-right"><p className="text-neutral-400">{post.author.name ?? "Community member"}</p><p className="mt-1">{formatDate(post.createdAt)}</p><span aria-hidden="true" className="mt-5 hidden text-lg transition group-hover:translate-x-1 group-hover:text-white sm:inline-block">→</span></div>
            </Link></li>
          ))}</ol>
        )}
      </section>
      <div id="new-post" className="fixed inset-x-0 bottom-0 z-30 px-3 pb-4 sm:px-6 sm:pb-6"><details className="group mx-auto max-w-xl rounded-[26px] border border-white/10 bg-[#161618]/95 shadow-[0_20px_70px_rgba(0,0,0,.65)] backdrop-blur-xl open:rounded-2xl">
        <summary className="flex h-12 cursor-pointer list-none items-center justify-between pl-5 pr-1.5 text-sm text-neutral-500 [&::-webkit-details-marker]:hidden"><span>{session?.user ? "Create a post…" : "Join the conversation…"}</span><span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-200 text-lg text-neutral-950 transition group-open:rotate-45">→</span></summary>
        <div className="max-h-[75vh] overflow-y-auto border-t border-white/10 p-2">{session?.user ? <CreatePostForm userEmail={session.user.email ?? ""} /> : <div className="flex items-center justify-between gap-4 p-4"><p className="text-sm text-neutral-400">Create an account to publish a post.</p><Link href="/signup" className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Sign up</Link></div>}</div>
      </details></div>
    </main>
  );
}
