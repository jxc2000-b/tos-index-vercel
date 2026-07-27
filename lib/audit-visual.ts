export const AUDIT_TOPICS = ["Privacy", "Ownership", "Retention", "Billing", "Legal", "Account control"] as const;
export type AuditTopic = (typeof AUDIT_TOPICS)[number];
export type AuditClauseKind = "red-flag" | "worth-noting" | "reasonable";
export type AuditSeverity = 0 | 1 | 2 | 3;
export interface AuditClause { id: string; label: string; kind: AuditClauseKind; severity: AuditSeverity; topic: AuditTopic; overflowCount?: number }
export interface AuditTopicDimension { topic: AuditTopic; severity: number; clauseCount: number }
export interface AuditVisualData { grade: string; score: number; clauses: AuditClause[]; topics: AuditTopicDimension[]; counts: Record<AuditClauseKind, number>; description: string }

const SECTION_KIND: Record<string, AuditClauseKind> = { "red flags": "red-flag", "worth noting": "worth-noting", reasonable: "reasonable" };
const DEFAULT_SEVERITY: Record<AuditClauseKind, AuditSeverity> = { "red-flag": 3, "worth-noting": 2, reasonable: 0 };
const TOPIC_TERMS: Record<AuditTopic, string[]> = {
  Privacy: ["privacy", "data", "track", "location", "health", "biometric", "advert", "scan", "partner", "minor"],
  Ownership: ["owner", "content", "license", "copyright", "sublicense", "derivative", "post", "files"],
  Retention: ["retain", "retention", "delete", "backup", "permanent", "export", "download", "historical"],
  Billing: ["bill", "fee", "price", "charge", "refund", "subscription", "renew", "fund", "$", "payment"],
  Legal: ["arbitration", "court", "jury", "class action", "liability", "dispute", "claim", "waive"],
  "Account control": ["account", "suspend", "terminate", "cancel", "access", "notice", "device", "authentication", "freeze"],
};

function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "clause" }
export function inferAuditTopic(label: string): AuditTopic {
  const text = label.toLowerCase(); let best: AuditTopic = "Account control"; let bestScore = 0;
  for (const topic of AUDIT_TOPICS) { const score = TOPIC_TERMS[topic].reduce((sum, term) => sum + (text.includes(term) ? term.length : 0), 0); if (score > bestScore) { best = topic; bestScore = score } }
  return best;
}
export function gradeToScore(grade: string): number {
  const match = grade.trim().toUpperCase().match(/^([ABCDF])([+-])?$/); if (!match) return 0;
  const base = { A: 95, B: 85, C: 75, D: 65, F: 45 }[match[1] as "A" | "B" | "C" | "D" | "F"];
  return Math.max(0, Math.min(100, base + (match[2] === "+" ? 3 : match[2] === "-" ? -3 : 0)));
}
export function parseAuditBody(body: string): { grade: string; clauses: AuditClause[] } {
  const grade = body.match(/^\s*Grade:\s*([^\n\r]+)/im)?.[1]?.trim() || "—"; const clauses: AuditClause[] = []; let kind: AuditClauseKind | undefined;
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim(); const section = SECTION_KIND[line.toLowerCase()]; if (section) { kind = section; continue }
    if (/^(verdict|grade)\s*:/i.test(line)) kind = undefined;
    const bullet = line.match(/^[-*•]\s+(.+)/)?.[1]?.trim(); if (!kind || !bullet) continue;
    clauses.push({ id: `${kind}-${slug(bullet)}-${clauses.length}`, label: bullet, kind, severity: DEFAULT_SEVERITY[kind], topic: inferAuditTopic(bullet) });
  }
  return { grade, clauses };
}
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value) }
function metadataAudit(metadata: unknown): { grade?: string; clauses: AuditClause[] } | null {
  if (!isRecord(metadata) || !isRecord(metadata.audit) || metadata.audit.version !== 1 || !Array.isArray(metadata.audit.clauses) || metadata.audit.clauses.length === 0) return null;
  const clauses: AuditClause[] = [];
  for (let index = 0; index < metadata.audit.clauses.length; index += 1) {
    const item = metadata.audit.clauses[index];
    if (!isRecord(item) || typeof item.label !== "string" || !item.label.trim() || !(["red-flag", "worth-noting", "reasonable"] as unknown[]).includes(item.kind) || !Number.isInteger(item.severity) || (item.severity as number) < 0 || (item.severity as number) > 3 || !(AUDIT_TOPICS as readonly unknown[]).includes(item.topic)) return null;
    clauses.push({ id: typeof item.id === "string" && item.id ? item.id : `${item.kind}-${slug(item.label)}-${index}`, label: item.label.trim(), kind: item.kind as AuditClauseKind, severity: item.severity as AuditSeverity, topic: item.topic as AuditTopic });
  }
  return { grade: typeof metadata.audit.grade === "string" && metadata.audit.grade.trim() ? metadata.audit.grade.trim() : undefined, clauses };
}
function compactClauses(clauses: AuditClause[]): AuditClause[] {
  if (clauses.length <= 8) return clauses; const visible = clauses.slice(0, 7); const rest = clauses.slice(7);
  const topic = AUDIT_TOPICS.map((candidate) => ({ candidate, count: rest.filter((clause) => clause.topic === candidate).length })).sort((a, b) => b.count - a.count)[0].candidate;
  const severity = Math.round(rest.reduce((sum, clause) => sum + clause.severity, 0) / rest.length) as AuditSeverity;
  const kind = (["red-flag", "worth-noting", "reasonable"] as const).map((candidate) => ({ candidate, count: rest.filter((clause) => clause.kind === candidate).length })).sort((a, b) => b.count - a.count)[0].candidate;
  return [...visible, { id: "overflow", label: `${rest.length} additional clauses`, kind, severity, topic, overflowCount: rest.length }];
}
function countPhrase(count: number, singular: string, plural = `${singular}s`) { const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"]; return `${words[count] ?? count} ${count === 1 ? singular : plural}` }
export function buildAuditVisualData(body: string, metadata?: unknown): AuditVisualData {
  const parsed = parseAuditBody(body); const override = metadataAudit(metadata); const grade = override?.grade ?? parsed.grade; const allClauses = override?.clauses ?? parsed.clauses;
  const counts = allClauses.reduce<Record<AuditClauseKind, number>>((result, clause) => { result[clause.kind] += 1; return result }, { "red-flag": 0, "worth-noting": 0, reasonable: 0 });
  const topics = AUDIT_TOPICS.map((topic) => { const matching = allClauses.filter((clause) => clause.topic === topic); return { topic, severity: matching.length ? Math.max(...matching.map((clause) => clause.severity)) : 0, clauseCount: matching.length } });
  const strongest = topics.filter((topic) => topic.severity > 0).sort((a, b) => b.severity - a.severity || AUDIT_TOPICS.indexOf(a.topic) - AUDIT_TOPICS.indexOf(b.topic)).slice(0, 2);
  const highRisk = allClauses.filter((clause) => clause.severity === 3).length; const riskText = strongest.length ? ` strongest risks in ${strongest.map((item) => item.topic.toLowerCase()).join(" and ")};` : "";
  return { grade, score: gradeToScore(grade), clauses: compactClauses(allClauses), topics, counts, description: `Grade ${grade}: ${countPhrase(highRisk, "high-risk clause")},${riskText} ${countPhrase(counts.reasonable, "reasonable clause")}.` };
}
