-- MANUAL DEPLOYMENT SQL — NOT A PRISMA MIGRATION.
-- Generated from prisma/seed.ts; run after manual_001_recreate_post_table.sql.
-- Replace admin@example.com below if the deployed seed author uses another email.

BEGIN;

DO $seed$
DECLARE
    seed_author_id TEXT;
BEGIN
    SELECT "id" INTO seed_author_id
    FROM "User"
    WHERE LOWER("email") = LOWER('admin@example.com')
    LIMIT 1;

    IF seed_author_id IS NULL THEN
        RAISE EXCEPTION 'Seed author admin@example.com does not exist. Update the email in this SQL.';
    END IF;

    INSERT INTO "Post" ("id", "title", "body", "keywords", "metadata", "authorId", "published")
    VALUES
        ('seed-audit-puffvault-v1', 'Audit — [Fictional demo] PuffVault (PuffVault Imaginary Cloud Co.): Terms of Service', $audit_body$Grade: D

PuffVault cloud storage — Terms of Service v8.2. Fictional sample product.

Red flags
- "You grant PuffVault a worldwide, royalty-free license to host, reproduce, and create derivative works from Your Content." Broader than needed to run a storage service — derivative-works rights let them build on your files.
- "We may scan uploaded content to improve our services and train features." Your private files can feed their systems, with no opt-out.
- "Deleted files may be retained in backups for up to 180 days." 'Delete' does not mean deleted for six months.

Worth noting
- PuffVault may suspend or terminate accounts "at our sole discretion" without prior notice, and disclaims liability for data lost as a result.

Reasonable
- States clearly that you retain ownership of your content.
- 30 days' notice before material pricing changes.

Verdict: Fine for non-sensitive files; keep anything private or irreplaceable backed up elsewhere too.$audit_body$, ARRAY['privacy','data rights','content ownership','data retention']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-wobblewallet-v1', 'Audit — [Fictional demo] WobbleWallet (WobbleWallet Pretend Finance LLC): User Agreement', $audit_body$Grade: D-

WobbleWallet wallet & payments — User Agreement, current version. Fictional sample product.

Red flags
- "Any dispute shall be resolved by binding individual arbitration; you waive the right to a jury trial and to participate in a class action." You surrender court and class actions before anything ever goes wrong.
- "WobbleWallet may place a hold on, freeze, or reserve funds for up to 180 days where we suspect risk." They can lock your money for six months at their discretion.
- "Our total liability shall not exceed the greater of $100 or fees paid in the prior three months." Their maximum payout is tiny no matter your actual loss.

Worth noting
- Charges must be disputed within 60 days or the claim is waived.

Reasonable
- Two-factor authentication required for withdrawals.

Verdict: Read the arbitration and fund-hold clauses carefully before keeping meaningful balances here.$audit_body$, ARRAY['consumer rights','billing','arbitration','financial services']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-chirpchirp-v1', 'Audit — [Fictional demo] ChirpChirp (ChirpChirp Labs): Terms & Privacy Policy', $audit_body$Grade: F

ChirpChirp social messaging — Terms of Service + Privacy Policy. Fictional sample product.

Red flags
- "You grant ChirpChirp a perpetual, irrevocable, transferable license to use, display, and sublicense content you post." Perpetual and irrevocable: deleting your account does not end it, and they can hand your content to anyone.
- "We share information with advertising partners to deliver personalized ads." Your activity is shared for ad targeting by default.
- "We collect data about your activity on other websites and apps through our embedded tools." Tracking follows you off the platform.
- Minimum age is stated as 13, with no meaningful verification and the same data practices applied to minors.

Reasonable
- Offers a self-service data-download tool.

Verdict: Assume anything you post is permanent and monetized. Avoid for anything sensitive.$audit_body$, ARRAY['privacy','tracking','data rights','content ownership']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-sproutstep-band-v1', 'Audit — [Fictional demo] SproutStep Band (SproutStep Fictional Fitness Inc.): Terms of Service', $audit_body$Grade: D-

SproutStep fitness band + app — Terms of Service and Health Data Policy. Fictional sample product.

Red flags
- "You consent to sharing aggregated and de-identified health metrics with research and commercial partners." 'De-identified' health data is frequently re-identifiable, and 'commercial partners' is left undefined.
- "Location is collected continuously while the app is running to enable activity tracking." Always-on location, not just during workouts.
- "We may share data with insurance and wellness-program partners where you enroll." Biometric and health data can reach insurers.

Worth noting
- No bulk export of your raw historical data — only in-app summaries.

Reasonable
- Biometric data (e.g. heart rate) is encrypted at rest.
- Explicit opt-in required before syncing to third-party apps.

Verdict: Sensitive data category. Turn off partner sharing in settings and expect poor data portability.$audit_body$, ARRAY['health data','location tracking','data rights','privacy']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-moonbeam-tv-v1', 'Audit — [Fictional demo] Moonbeam TV (Moonbeam Imaginary Media Co.): Terms of Use', $audit_body$Grade: C-

Moonbeam TV streaming service — Terms of Use. Fictional sample product.

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

Verdict: Standard-but-sharp streaming terms. Set a cancellation reminder and watch for price-change emails.$audit_body$, ARRAY['billing','auto-renewal','refund policy','digital access']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-cozyquill-notes-v1', 'Audit — [Fictional demo] CozyQuill Notes: Terms & Privacy', $audit_body$Grade: B+

CozyQuill encrypted notebook — Terms and Privacy Notice. Fictional sample product.

Red flags
- Crash reports may include fragments of the open document unless optional telemetry is disabled.

Worth noting
- Encrypted notes remain in backups for up to 45 days after account deletion.
- Shared notebooks inherit the workspace owners retention settings.

Reasonable
- You retain ownership of notes and attachments.
- Optional end-to-end encryption keeps note content unavailable to CozyQuill.
- A full standards-based export is available.

Verdict: Thoughtful terms; disable diagnostics for sensitive work.$audit_body$, ARRAY['privacy','data retention','content ownership','productivity']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-doodledesk-academy-v1', 'Audit — [Fictional demo] DoodleDesk Academy: Student Terms', $audit_body$Grade: B

DoodleDesk Academy classroom platform — Student Terms. Fictional sample product.

Red flags
- Schools may enable integrations that receive student profile and activity data.

Worth noting
- Student work is retained for one academic year after a school contract ends.
- Parents must route access requests through the school.

Reasonable
- Student data is not used for behavioral advertising or sold.
- Students retain ownership of submitted work.
- Younger-student accounts collect limited identifiers.

Verdict: Strong boundaries, with integration oversight worth checking.$audit_body$, ARRAY['student data','privacy','minors','data retention','education']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-acorn-bazaar-v1', 'Audit — [Fictional demo] Acorn Bazaar: Seller Terms', $audit_body$Grade: D+

Acorn Bazaar seller platform — Seller Terms. Fictional sample product.

Red flags
- Acorn Bazaar may reserve sale proceeds for up to 120 days based on opaque risk signals.
- Disputes require individual arbitration, with class actions waived.
- Acorn Bazaar can use product photographs after a listing is removed.

Worth noting
- Transaction fees may change on 15 days notice.
- Accounts can be suspended after a counterfeit complaint.

Reasonable
- Sellers retain ownership of original product media.
- A ledger itemizes fees, refunds, and reserves.

Verdict: Cash-flow and dispute terms place substantial risk on sellers.$audit_body$, ARRAY['billing','fund holds','arbitration','content ownership','marketplace']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-cloakfish-vpn-v1', 'Audit — [Fictional demo] Cloakfish VPN: Service Terms', $audit_body$Grade: A-

Cloakfish VPN — Service Terms. Fictional sample product.

Worth noting
- Payment processors retain billing records after account deletion.
- Aggregate bandwidth counters are erased within 24 hours.

Reasonable
- No browsing history, DNS queries, IP addresses, or connection timestamps are logged.
- Account deletion revokes credentials immediately.
- Material changes require 30 days email notice.
- Independent security assessments include remediation summaries.

Verdict: Narrow collection and unusually clear retention limits.$audit_body$, ARRAY['privacy','data retention','account control','security','vpn']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-babblebot-notes-v1', 'Audit — [Fictional demo] BabbleBot Notes: Recording Terms', $audit_body$Grade: D

BabbleBot Notes meeting transcription — Voice Data Notice. Fictional sample product.

Red flags
- Audio and transcripts train speech models by default, including non-user participants.
- Workspace administrators can access every recording without notifying participants.
- Deleted recordings may remain in training datasets indefinitely.

Worth noting
- The account holder must obtain recording consent.
- Speaker voiceprints remain until manually removed.

Reasonable
- Original audio can delete automatically after transcription.
- Transcripts export without an extra fee.

Verdict: Unsuitable for confidential meetings without careful configuration.$audit_body$, ARRAY['voice data','ai training','privacy','content ownership','data retention']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-neighbornook-v1', 'Audit — [Fictional demo] NeighborNook: Community Rules', $audit_body$Grade: A

NeighborNook member-run discussions — Community Rules. Fictional sample product.

Worth noting
- Volunteer moderators can restrict accounts under published rules.
- Public posts may remain in quoted replies after deletion.

Reasonable
- Members retain ownership and grant a revocable service license.
- No behavioral advertising or sale of profile data is permitted.
- Permanent sanctions offer an independent appeal.
- Deleted private messages are retained for 30 days.
- Members can export posts and settings.

Verdict: Carefully bounded rights and credible process protections.$audit_body$, ARRAY['content ownership','moderation','account control','privacy','social platform']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-zipzap-scooters-v1', 'Audit — [Fictional demo] ZipZap Scooters: Rider Agreement', $audit_body$Grade: C

ZipZap Scooters scooter rental — Rider Agreement. Fictional sample product.

Red flags
- Precise trip routes and parking photographs are retained for five years.
- Riders accept broad injury liability while ZipZap Scooters disclaims vehicle-defect liability.

Worth noting
- Parking penalties are charged automatically, with seven days to appeal.
- Accounts can be frozen after automated risk detection.

Reasonable
- Pricing is shown before a ride begins.
- Location collection stops when no rental or search is active.
- Riders can contest charges and download receipts.

Verdict: Transparent pricing, but route retention deserves attention.$audit_body$, ARRAY['location tracking','billing','liability','account control','mobility']::TEXT[], '{}'::JSONB, seed_author_id, TRUE),
        ('seed-audit-confettitix-v1', 'Audit — [Fictional demo] ConfettiTix: Purchase Terms', $audit_body$Grade: D+

ConfettiTix marketplace — Purchase Terms. Fictional sample product.

Red flags
- Processing fees appear only at final checkout and remain non-refundable.
- Organizers receive purchaser details for marketing unless users opt out.
- Claims require individual arbitration within one year.

Worth noting
- Postponed-event refunds remain at the organizers discretion.
- Resale payouts may be held until after the event.

Reasonable
- Checkout identifies resale listings.
- Duplicate tickets qualify for a purchase-price refund.

Verdict: Fee, marketing, and dispute terms favor the platform.$audit_body$, ARRAY['billing','refund policy','data sharing','arbitration','events']::TEXT[], '{}'::JSONB, seed_author_id, TRUE)
    ON CONFLICT ("id") DO UPDATE SET
        "title" = EXCLUDED."title",
        "body" = EXCLUDED."body",
        "keywords" = EXCLUDED."keywords",
        "metadata" = EXCLUDED."metadata",
        "authorId" = EXCLUDED."authorId",
        "published" = EXCLUDED."published";
END
$seed$;

COMMIT;
