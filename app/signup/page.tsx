"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to create your account.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-10 text-neutral-100">
      <form
        className="grid w-full max-w-md gap-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-1 text-sm text-neutral-400">Use an email address and password to sign up.</p>
        </div>

        <label className="grid gap-2 text-sm font-medium text-neutral-300">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-400"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-neutral-300">
          Password
          <input
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-400"
          />
          <span className="text-xs font-normal text-neutral-500">At least 12 characters.</span>
        </label>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-white px-4 py-2 font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="text-sm text-neutral-400">
          Already have an account?{" "}
          <Link className="text-white underline" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
