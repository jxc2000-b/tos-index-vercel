"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SectionSwitcherLink() {
  const onIndex = usePathname() === "/tos-index";

  return (
    <Link
      href={onIndex ? "/" : "/tos-index"}
      className="text-lg font-semibold tracking-[-0.06em] text-white"
    >
      {onIndex ? "go to audits" : "go to tos-index"}
    </Link>
  );
}
