import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      published: true,
      authorId: true,
      author: { select: { name: true, email: true } },
    },
  });

  if (!post) {
    notFound();
  }

  // Drafts are visible only to their author or an admin.
  if (!post.published) {
    const session = await getServerSession(authOptions);
    const viewer = session?.user;
    const canView = viewer?.isAdmin || viewer?.id === post.authorId;
    if (!canView) {
      notFound();
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-neutral-400 transition hover:text-neutral-200">
        ← Back to index
      </Link>

      <article className="mt-6">
        <h1 className="text-3xl font-bold text-white">{post.title}</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
          <span>
            {post.author.name ?? post.author.email ?? "Unknown"} · {formatDate(post.createdAt)}
          </span>
          {!post.published ? (
            <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs font-medium text-amber-300">
              Draft
            </span>
          ) : null}
        </p>

        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-neutral-200">{post.body}</div>
      </article>
    </main>
  );
}
