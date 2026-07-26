"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function CreatePostForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          keywords: keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
          published: true,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to create your post.");
        return;
      }

      setTitle("");
      setBody("");
      setKeywords("");
      setMessage("Posted.");
      router.refresh();
    } catch {
      setError("Unable to create your post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-left shadow-2xl"
      onSubmit={handleCreatePost}
    >
      <div>
        <h2 className="text-xl font-bold">Add an entry</h2>
        <p className="mt-1 text-sm text-neutral-400">Posting as {userEmail}.</p>
      </div>

      <label className="grid gap-2 text-sm font-medium text-neutral-300">
        Title
        <input
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-400"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-neutral-300">
        Keywords
        <input
          required
          maxLength={250}
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          placeholder="privacy-focused, data rights, arbitration"
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-600 focus:border-neutral-400"
        />
        <span className="text-xs font-normal text-neutral-500">Separate up to 8 keywords with commas.</span>
      </label>

      <label className="grid gap-2 text-sm font-medium text-neutral-300">
        Notes
        <textarea
          required
          maxLength={10_000}
          rows={7}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-400"
        />
      </label>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-white px-4 py-2 font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Publishing..." : "Publish entry"}
      </button>
    </form>
  );
}
