-- Add structured discovery tags and an extensible JSON object to posts.
ALTER TABLE "Post"
ADD COLUMN "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}'::JSONB;

-- Give existing audits useful tags based on their current content.
UPDATE "Post"
SET "keywords" = ARRAY_REMOVE(ARRAY[
  'terms audit',
  CASE WHEN lower("body") ~ 'privacy|tracking|advertis|location' THEN 'privacy' END,
  CASE WHEN lower("body") ~ 'data|content|files|download|export' THEN 'data rights' END,
  CASE WHEN lower("body") ~ 'arbitration|class action|jury trial|dispute' THEN 'consumer rights' END,
  CASE WHEN lower("body") ~ 'payment|charge|refund|subscription|renew|pricing|fees' THEN 'billing' END,
  CASE WHEN lower("body") ~ 'health|biometric|heart rate|insurance' THEN 'health data' END,
  CASE WHEN lower("body") ~ 'license|ownership|derivative|sublicense' THEN 'content ownership' END,
  CASE WHEN lower("body") ~ 'delete|retained|retention|backup' THEN 'data retention' END
], NULL)
WHERE cardinality("keywords") = 0;

