import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

import { deletePost, toggleAdmin, togglePublished } from "./actions";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const currentUserId = session.user.id;

  const [users, posts] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        author: { select: { email: true, name: true } },
      },
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header>
        <p className="text-sm font-medium text-emerald-300">Administrator</p>
        <h1 className="mt-1 text-3xl font-bold">Admin</h1>
      </header>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Users ({users.length})
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-xl text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Posts</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{user.name ?? "—"}</div>
                    <div className="text-neutral-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-neutral-400">{user._count.posts}</td>
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <span className="text-emerald-300">Admin</span>
                    ) : (
                      <span className="text-neutral-400">Member</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.id === currentUserId ? (
                      <span className="text-xs text-neutral-600">You</span>
                    ) : (
                      <form action={toggleAdmin}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-neutral-400"
                        >
                          {user.isAdmin ? "Revoke admin" : "Make admin"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Posts ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <p className="mt-4 text-neutral-500">No posts yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="min-w-0">
                  <Link href={`/posts/${post.id}`} className="font-medium text-white hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-xs text-neutral-500">
                    {post.author.name ?? post.author.email ?? "Unknown"} · {formatDate(post.createdAt)}
                    {post.published ? null : (
                      <span className="ml-2 text-amber-300">Draft</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={togglePublished}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-neutral-400"
                    >
                      {post.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deletePost}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-900 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:border-red-500"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
