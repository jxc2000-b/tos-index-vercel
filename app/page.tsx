import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

import CreatePostForm from "./components/CreatePostForm";
import Statement from "./components/Statement";

export default async function Home() {
  const session = await getServerSession(authOptions);

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      author: { select: { name: true, email: true } },
    },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="text-center">
        <Statement>The Online Terms of Service Index</Statement>
        <p className="mt-4 text-neutral-400">
          Community notes on the terms you agree to without reading.
        </p>
      </div>

      {session?.user ? (
        <div className="mt-10">
          <CreatePostForm userEmail={session.user.email ?? ""} />
        </div>
      ) : (
        <div className="mt-8 flex justify-center gap-4">
          <Link
            className="rounded-lg bg-white px-4 py-2 font-semibold text-neutral-950 transition hover:bg-neutral-200"
            href="/signup"
          >
            Sign up to post
          </Link>
          <Link
            className="rounded-lg border border-neutral-700 px-4 py-2 font-semibold text-white transition hover:border-neutral-400"
            href="/login"
          >
            Log in
          </Link>
        </div>
      )}

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Latest entries
        </h2>

        {posts.length === 0 ? (
          <p className="mt-4 text-neutral-500">No entries yet. Be the first to post.</p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="block rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-neutral-600"
                >
                  <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{post.body}</p>
                  <p className="mt-3 text-xs text-neutral-500">
                    {post.author.name ?? post.author.email ?? "Unknown"} · {formatDate(post.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
