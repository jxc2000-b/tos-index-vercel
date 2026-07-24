"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-neutral-400"
    >
      Log out
    </button>
  );
}
