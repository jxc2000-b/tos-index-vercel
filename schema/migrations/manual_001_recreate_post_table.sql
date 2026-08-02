-- MANUAL DEPLOYMENT SQL — NOT A PRISMA MIGRATION.
-- This file is intentionally outside prisma/migrations.
-- DESTRUCTIVE: drops the Post table and all existing posts.

BEGIN;

DROP TABLE IF EXISTS "Post" CASCADE;

CREATE TABLE "Post" (
    "id"        TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "body"      TEXT         NOT NULL,
    "keywords"  TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
    "metadata"  JSONB        NOT NULL DEFAULT '{}'::JSONB,
    "authorId"  TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN      NOT NULL DEFAULT FALSE,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Post_authorId_fkey"
        FOREIGN KEY ("authorId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "Post_authorId_createdAt_idx"
    ON "Post"("authorId", "createdAt");

CREATE INDEX "Post_published_createdAt_idx"
    ON "Post"("published", "createdAt");

COMMIT;
