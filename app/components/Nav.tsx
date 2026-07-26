import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/auth";

import SignOutButton from "./SignOutButton";

export default async function Nav() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="bg-[#08080a]">
      <nav className="mx-auto flex max-w-[1540px] items-center justify-between px-4 py-5 sm:px-9 sm:py-7">
        <Link href="/" className="text-lg font-semibold tracking-[-0.06em] text-white">
          tos/index
        </Link>

        <div className="flex items-center gap-2 text-sm">
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
              <Link href="/login" className="rounded-full border border-white/10 px-4 py-2 font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white">
                Log in
              </Link>
              <Link href="/signup" className="rounded-full bg-white px-4 py-2 font-semibold text-neutral-950 transition hover:bg-neutral-200">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
