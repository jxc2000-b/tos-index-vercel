"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      if (!result?.ok) {
        setError("Invalid email or password.");
        return;
      }

      window.location.assign(result.url ?? "/");
    } catch {
      setError("Unable to sign in. Please try again.");
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
          <h1 className="text-2xl font-bold">Log in</h1>
          <p className="mt-1 text-sm text-neutral-400">Sign in with your email and password.</p>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-neutral-400"
          />
        </label>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-white px-4 py-2 font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Log in"}
        </button>

        <p className="text-sm text-neutral-400">
          Need an account?{" "}
          <Link className="text-white underline" href="/signup">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
