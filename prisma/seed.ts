import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";

const DEV_ADMIN_PASSWORD = "change-me-admin-please";
const LEGACY_SAMPLE_PREFIXES = ["Audit — [Fictional demo]", "Audit — Nimbus Drive", "Audit — PulsePay", "Audit — Chatterbox", "Audit — FitStride", "Audit — StreamNest", "Audit — Hearthside", "Audit — Lantern Learn", "Audit — Alder Market", "Audit — Stillwater VPN", "Audit — EchoScribe", "Audit — CommonRoom", "Audit — VoltRide", "Audit — Meridian Tickets"];

const SAMPLE_POSTS: { title: string; body: string; keywords: string[] }[] = [
  {
    title: "What is your realistic privacy baseline for a new phone?",
    keywords: ["privacy basics", "phones", "beginners"],
    body: `I am helping a family member set up a new phone and want a practical baseline that will actually stick. So far: review app permissions, disable ad personalization, use a strong device passcode, turn on automatic updates, and remove apps they do not use.\n\nWhat would you add without turning setup into a weekend project?`,
  },
  {
    title: "A small browser-hardening checklist that does not break every site",
    keywords: ["guides", "browsers", "tracking", "how-to"],
    body: `My low-friction setup is built-in strict tracking protection, HTTPS-only mode, third-party cookies blocked, and a reputable content blocker. I keep separate browser profiles for everyday use and accounts tied to work.\n\nThe goal is not perfect anonymity. It is reducing routine collection without creating settings fatigue. What is your best high-impact addition?`,
  },
  {
    title: "Which private messenger works for a mixed technical group?",
    keywords: ["tools", "messaging", "encryption"],
    body: `I need to move a community group away from ordinary SMS. End-to-end encryption matters, but so do reliable notifications, simple onboarding, and usable group administration.\n\nI would especially value experiences from groups containing both iPhone and Android users—not just a feature comparison.`,
  },
  {
    title: "Location permission audit: the surprising apps I had set to Always",
    keywords: ["tracking", "location", "phones"],
    body: `A quarterly permission review found several apps with continuous location access even though they only needed it during a specific task. Changing most to “while using” caused no noticeable loss of functionality.\n\nCalendar reminders made this a five-minute recurring habit. It may be the easiest privacy improvement I have made this year.`,
  },
  {
    title: "How I requested deletion from an old account",
    keywords: ["data rights", "deletion", "guides"],
    body: `I could not find an account-delete button, so I sent a short request identifying the account, clearly asking for account and personal-data deletion, and requesting written confirmation. I kept the support reference but did not send extra identity documents until they explained why they were needed.\n\nThe company completed it after one follow-up. Templates are useful, but concise and specific worked best here.`,
  },
  {
    title: "Do you treat smart TVs as untrusted devices?",
    keywords: ["tracking", "smart home", "discussion"],
    body: `Modern TVs combine viewing analytics, microphones, ad identifiers, and long support lifetimes. Mine sits on a separate network and has analytics disabled, while streaming happens through a device I can replace more easily.\n\nIs network separation worthwhile in a normal home, or does disabling telemetry capture most of the benefit?`,
  },
  {
    title: "Privacy-friendly analytics options for a small community site",
    keywords: ["tools", "analytics", "self-hosting"],
    body: `I only need aggregate page views, referrers, and broad device categories. There is no advertising and no reason to build visitor profiles.\n\nI am comparing a minimal hosted product with self-hosted logs. Operational simplicity matters, but I do not want “cookieless” to become an excuse for fingerprinting. Recommendations and deployment lessons welcome.`,
  },
  {
    title: "Audit: Cloakfish VPN keeps its promises unusually narrow",
    keywords: ["tos-audit", "vpn", "data retention", "privacy"],
    body: `This is a fictional policy-audit example.\n\nThe service says it does not retain browsing history, DNS queries, source IP addresses, or connection timestamps. Aggregate bandwidth counters disappear within 24 hours, while its payment processor keeps ordinary billing records.\n\nThe strongest part is the specificity: each collected field has a stated purpose and retention period. The open question is whether future independent assessments publish enough detail to verify those claims.`,
  },
  {
    title: "Audit: BabbleBot meeting notes train on recordings by default",
    keywords: ["tos-audit", "ai training", "voice data", "privacy"],
    body: `This is a fictional policy-audit example.\n\nBabbleBot enables model training on audio and transcripts by default, including the voices of meeting participants who never created an account. Workspace administrators can access recordings, and deletion does not remove material already incorporated into training datasets.\n\nFor confidential calls, that default is a deal-breaker. At minimum, training should require explicit consent and recording retention should be short and visible.`,
  },
  {
    title: "What privacy topic do you wish had a plain-language guide?",
    keywords: ["community", "questions", "guides"],
    body: `I would like this community to build resources around decisions people actually face—not just threat models for specialists.\n\nMy candidates are choosing a password manager, safely sharing family photos, understanding passkeys, and checking whether an app really needs an account. What topic would help you or someone you know?`,
  },
];

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").trim().toLowerCase();
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Privacy Guide";
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEV_ADMIN_PASSWORD;
  if (!process.env.SEED_ADMIN_PASSWORD) console.warn("SEED_ADMIN_PASSWORD not set — using the insecure dev default. Do not use this in a shared or production database.");
  const passwordHash = await hash(password, 12);
  const admin = await prisma.user.upsert({ where: { email }, update: { name, isAdmin: true, passwordHash }, create: { email, name, isAdmin: true, passwordHash } });

  if (!["1", "true"].includes(process.env.SEED_SKIP_POSTS ?? "")) {
    const adminPosts = await prisma.post.findMany({ where: { authorId: admin.id }, select: { id: true, title: true } });
    const legacyIds = adminPosts.filter((post) => LEGACY_SAMPLE_PREFIXES.some((prefix) => post.title.startsWith(prefix))).map((post) => post.id);
    if (legacyIds.length) await prisma.post.deleteMany({ where: { id: { in: legacyIds } } });
    const existingTitles = new Set(adminPosts.map((post) => post.title));
    const missingPosts = SAMPLE_POSTS.filter((post) => !existingTitles.has(post.title));
    if (missingPosts.length) await prisma.post.createMany({ data: missingPosts.map((post) => ({ ...post, authorId: admin.id, published: true })) });
    console.log(`Seeded ${missingPosts.length} new forum posts (${SAMPLE_POSTS.length} total samples).`);
  }
  console.log(`Seeded admin user: ${name} <${email}>`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
