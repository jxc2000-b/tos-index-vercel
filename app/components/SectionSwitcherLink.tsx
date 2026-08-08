"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SectionSwitcherLink() {
  const pathname = usePathname();
  return <div className="flex items-center gap-5 text-sm font-medium">
    <Link href="/" className={pathname === "/" ? "text-white" : "text-neutral-500 transition hover:text-white"}>Posts</Link>
    <Link href="/explore" className={pathname === "/explore" ? "text-white" : "text-neutral-500 transition hover:text-white"}>Explore</Link>
  </div>;
}
