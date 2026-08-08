# ToS Index handoff

## Current state

- Branch: `main`
- Framework: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Package manager: `pnpm@11.8.0`
- Database: PostgreSQL through Prisma 7
- Authentication: NextAuth
- Animation: Anime.js `4.1.3` (pinned)
- The worktree was clean immediately before this handoff file was added.

The application has two sibling public experiences:

- `/` — editorial community audit cards
- `/tos-index` — searchable service/topic directory

The global top-left link is implemented by `app/components/SectionSwitcherLink.tsx`:

- On `/`: underlined `go to tos index`, linking to `/tos-index`
- On `/tos-index`: underlined `go to audits`, linking to `/`

## Audit page

`app/page.tsx` remains a server component. It queries up to 50 published posts and renders a masonry-style card layout.

Each card has a deterministic palette, height, and fixed visual variant based on a hash of the post ID and title. The variant is selected with `seed % 4`.

`app/components/RiskVisual.tsx` contains four fixed SVG templates:

1. Bars
2. Rings
3. Faceted exposure map
4. Risk profile

The geometry is deliberately not modified by clause data. Audit data is still used for card text, counts, grades, and the visual's accessible description. Animations replay on card hover and keyboard focus, use Anime.js scopes, and are disabled under `prefers-reduced-motion`.

## Index page

`app/tos-index/page.tsx` is a server-rendered discovery scaffold inspired by the broad information architecture of Reddit Explore, not its visual styling.

It provides:

- Search through service names and keywords using `?q=`
- Six topic collections
- A compact directory generated from published posts
- Grade and keyword previews
- Links to individual audit pages
- Empty-search handling
- Responsive layouts

Both the audits and index pages use the same PostgreSQL post data.

## Audit parsing

`lib/audit-visual.ts` provides the server-safe audit model.

It parses:

- `Grade:`
- `Red flags`
- `Worth noting`
- `Reasonable`

Clauses receive a stable ID, kind, default severity, and one of six topics. A valid `metadata.audit.version = 1` object can override body parsing. The current fixed SVG templates do not use those clause dimensions, but the model and tests remain available for textual summaries and future work.

## Seed data

`prisma/seed.ts` contains 13 unmistakably fictional products. Titles carry a `[Fictional demo]` marker and bodies state that they are fictional samples.

The seed operation is idempotent by title and removes only the explicitly allowlisted previous sample titles. It does not delete arbitrary community posts.

Run:

```bash
pnpm exec prisma db seed
```

The configured local database was last reseeded successfully with all 13 fictional records.

## Database migrations

Prisma-generated migrations remain under `prisma/migrations`.

Two intentionally separate manual deployment scripts are under `schema/migrations`:

- `manual_001_recreate_post_table.sql`
- `manual_002_seed_fictional_audits.sql`

Both are prominently labeled as manual SQL and not Prisma migrations. The first script is destructive: it drops and recreates the `Post` table. The second expects an existing seed user with email `admin@example.com`; update that email before deployment when necessary.

## Ngrok development trial

Ngrok `3.39.10` is installed from Ngrok's official Ubuntu APT repository.

Project configuration:

- `deploy/ngrok/ngrok.yml`
- Endpoint name: `tos-index-dev`
- Upstream: `http://127.0.0.1:3000`

Start the application:

```bash
pnpm dev
```

In another terminal:

```bash
export NGROK_AUTHTOKEN='use-a-dedicated-development-token'
ngrok start tos-index-dev \
  --config /home/deploy/code/tos-index-vercel/deploy/ngrok/ngrok.yml
```

Do not commit the token. The config has passed `ngrok config check`.

Nginx was installed accidentally, then stopped and disabled. It is currently inactive and should not start after reboot. The mistaken repository Nginx configuration was removed. The Nginx package itself remains installed.

## Bubblewrap issue

The dedicated filesystem patch sandbox has repeatedly failed with:

```text
bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted
```

Bubblewrap is installed and `kernel.unprivileged_userns_clone=1`, so this is not simply a missing package. The likely remaining causes include AppArmor, seccomp, container-runtime policy, capabilities, or nested namespace restrictions.

Full diagnostics and cautious remediation guidance are in `bwrap.md`. A subagent reviewed that document and its recommendations were incorporated.

Because updating existing files through the dedicated patch sandbox may fail before the file can be read, recent mechanical edits used the approved out-of-sandbox command path. New-file patch operations have sometimes succeeded. Retry `apply_patch` first; use escalation only when the same sandbox failure recurs.

## Verification

Common checks:

```bash
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

Most recent results:

- Tests: 16 passed
- TypeScript: passed
- Production compilation: passed
- Ngrok configuration: valid

## Files worth reading first

- `app/page.tsx`
- `app/tos-index/page.tsx`
- `app/components/RiskVisual.tsx`
- `app/components/SectionSwitcherLink.tsx`
- `lib/audit-visual.ts`
- `prisma/seed.ts`
- `deploy/ngrok/README.md`
- `bwrap.md`

## Cautions

- Preserve unrelated user changes in the worktree.
- Do not place credentials in source files or command output.
- Do not run the manual table-recreation SQL without a backup and explicit intent to delete deployed posts.
- Use a separate checkout or Git worktree for an Ngrok trial if a production instance is built from this same repository directory; otherwise rebuilding `.next` can replace the production build output.
