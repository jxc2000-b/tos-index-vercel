import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/auth";

import SignOutButton from "./SignOutButton";

export default async function Nav() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          ToS Index
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {user.isAdmin ? (
                <Link href="/admin" className="font-medium text-emerald-300 transition hover:text-emerald-200">
                  Admin
                </Link>
              ) : null}
              <span className="hidden text-neutral-400 sm:inline">{user.email}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-white transition hover:text-neutral-300">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-3 py-1.5 font-semibold text-neutral-950 transition hover:bg-neutral-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
