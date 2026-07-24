import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient } from "../app/generated/prisma/client";

// Dev-only fallback. Override with SEED_ADMIN_PASSWORD (min 12 chars) for anything real.
const DEV_ADMIN_PASSWORD = "change-me-admin-please";

// Fake companies — sample terms-of-service audits for the index.
const AUDIT_POSTS: { title: string; body: string }[] = [
  {
    title: "Audit — Nimbus Drive (Nimbus, Inc.): Terms of Service",
    body: `Grade: D

Nimbus Drive cloud storage — Terms of Service v8.2.

Red flags
- "You grant Nimbus a worldwide, royalty-free license to host, reproduce, and create derivative works from Your Content." Broader than needed to run a storage service — derivative-works rights let them build on your files.
- "We may scan uploaded content to improve our services and train features." Your private files can feed their systems, with no opt-out.
- "Deleted files may be retained in backups for up to 180 days." 'Delete' does not mean deleted for six months.

Worth noting
- Nimbus may suspend or terminate accounts "at our sole discretion" without prior notice, and disclaims liability for data lost as a result.

Reasonable
- States clearly that you retain ownership of your content.
- 30 days' notice before material pricing changes.

Verdict: Fine for non-sensitive files; keep anything private or irreplaceable backed up elsewhere too.`,
  },
  {
    title: "Audit — PulsePay (Pulse Financial LLC): User Agreement",
    body: `Grade: D-

PulsePay wallet & payments — User Agreement, current version.

Red flags
- "Any dispute shall be resolved by binding individual arbitration; you waive the right to a jury trial and to participate in a class action." You surrender court and class actions before anything ever goes wrong.
- "PulsePay may place a hold on, freeze, or reserve funds for up to 180 days where we suspect risk." They can lock your money for six months at their discretion.
- "Our total liability shall not exceed the greater of $100 or fees paid in the prior three months." Their maximum payout is tiny no matter your actual loss.

Worth noting
- Charges must be disputed within 60 days or the claim is waived.

Reasonable
- Two-factor authentication required for withdrawals.

Verdict: Read the arbitration and fund-hold clauses carefully before keeping meaningful balances here.`,
  },
  {
    title: "Audit — Chatterbox (Chatterbox Labs): Terms & Privacy Policy",
    body: `Grade: F

Chatterbox social messaging — Terms of Service + Privacy Policy.

Red flags
- "You grant Chatterbox a perpetual, irrevocable, transferable license to use, display, and sublicense content you post." Perpetual and irrevocable: deleting your account does not end it, and they can hand your content to anyone.
- "We share information with advertising partners to deliver personalized ads." Your activity is shared for ad targeting by default.
- "We collect data about your activity on other websites and apps through our embedded tools." Tracking follows you off the platform.
- Minimum age is stated as 13, with no meaningful verification and the same data practices applied to minors.

Reasonable
- Offers a self-service data-download tool.

Verdict: Assume anything you post is permanent and monetized. Avoid for anything sensitive.`,
  },
  {
    title: "Audit — FitStride Band (Strideworks Inc.): Terms of Service",
    body: `Grade: D-

FitStride fitness band + app — Terms of Service and Health Data Policy.

Red flags
- "You consent to sharing aggregated and de-identified health metrics with research and commercial partners." 'De-identified' health data is frequently re-identifiable, and 'commercial partners' is left undefined.
- "Location is collected continuously while the app is running to enable activity tracking." Always-on location, not just during workouts.
- "We may share data with insurance and wellness-program partners where you enroll." Biometric and health data can reach insurers.

Worth noting
- No bulk export of your raw historical data — only in-app summaries.

Reasonable
- Biometric data (e.g. heart rate) is encrypted at rest.
- Explicit opt-in required before syncing to third-party apps.

Verdict: Sensitive data category. Turn off partner sharing in settings and expect poor data portability.`,
  },
  {
    title: "Audit — StreamNest (StreamNest Media Co.): Terms of Use",
    body: `Grade: C-

StreamNest streaming service — Terms of Use.

Red flags
- "Subscriptions renew automatically and you authorize recurring charges until you cancel." Auto-renew keeps charging until you actively stop it.
- "Fees may change; continued use after the effective date constitutes acceptance." Price hikes take effect unless you notice and cancel.
- "All charges are non-refundable, including for partial billing periods." No refunds even if you cancel on day one of a new cycle.

Worth noting
- "Titles may be added or removed at any time without notice." What you subscribed for can disappear.
- Content is licensed, not sold; access ends with your subscription.

Reasonable
- Cancel anytime, effective at period end, with no early-termination fee.
- Clear device and household limits.

Verdict: Standard-but-sharp streaming terms. Set a cancellation reminder and watch for price-change emails.`,
  },
];

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").trim().toLowerCase();
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEV_ADMIN_PASSWORD;

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn(
      "SEED_ADMIN_PASSWORD not set — using the insecure dev default. Do not use this in a shared or production database.",
    );
  }

  const passwordHash = await hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { name, isAdmin: true, passwordHash },
    create: { email, name, isAdmin: true, passwordHash },
  });

  // Seed the sample audit posts on a fresh database.
  // Skip with SEED_SKIP_POSTS=1 (e.g. seeding a bare production database).
  const skipPosts = ["1", "true"].includes(process.env.SEED_SKIP_POSTS ?? "");
  const existingPosts = skipPosts ? -1 : await prisma.post.count({ where: { authorId: admin.id } });
  if (!skipPosts && existingPosts === 0) {
    await prisma.post.createMany({
      data: AUDIT_POSTS.map((post) => ({ ...post, authorId: admin.id, published: true })),
    });
    console.log(`Seeded ${AUDIT_POSTS.length} audit posts.`);
  }

  console.log(`Seeded admin user: ${name} <${email}>`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
