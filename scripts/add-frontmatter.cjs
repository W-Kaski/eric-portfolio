/**
 * add-frontmatter.cjs
 *
 * Adds standardised YAML frontmatter to every article markdown file
 * that does not already have a `title` field in its frontmatter.
 * Paper articles are NEVER touched.
 *
 * Date distribution (A = oldest → G = newest):
 *   A Symbolic AI               2025-03-01 → 2025-04-30
 *   B Connectionist AI          2025-04-01 → 2025-06-30
 *   C Evolutionary Computation  2025-07-01 → 2025-07-31
 *   D Decision, Causality …     2025-08-01 → 2025-08-31
 *   E AI Systems & Engineering  2025-09-01 → 2025-09-30
 *   F AI Safety & Society       2025-10-01 → 2025-10-31
 *   G Cross-Disciplinary …      2025-11-01 → 2025-12-31
 *
 * Usage:
 *   node scripts/add-frontmatter.cjs [--dry-run]
 */

"use strict";

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");

// ─── date ranges per top-level section prefix ────────────────────────────────

const DATE_RANGES = [
  { prefix: "A ", start: new Date("2025-03-01"), end: new Date("2025-04-30") },
  { prefix: "B ", start: new Date("2025-04-01"), end: new Date("2025-06-30") },
  { prefix: "C ", start: new Date("2025-07-01"), end: new Date("2025-07-31") },
  { prefix: "D ", start: new Date("2025-08-01"), end: new Date("2025-08-31") },
  { prefix: "E ", start: new Date("2025-09-01"), end: new Date("2025-09-30") },
  { prefix: "F ", start: new Date("2025-10-01"), end: new Date("2025-10-31") },
  { prefix: "G ", start: new Date("2025-11-01"), end: new Date("2025-12-31") },
];

// deterministic pseudo-random date within range, seeded by file path
function dateForPath(filePath, start, end) {
  // Simple hash for reproducibility across multiple runs
  let h = 0;
  for (let i = 0; i < filePath.length; i++) {
    h = (Math.imul(31, h) + filePath.charCodeAt(i)) >>> 0;
  }
  const span = end.getTime() - start.getTime();
  const offset = ((h % span) + span) % span;
  const d = new Date(start.getTime() + offset);
  return d.toISOString().split("T")[0];
}

function getDateRange(relativePath) {
  for (const range of DATE_RANGES) {
    if (relativePath.startsWith(range.prefix)) return range;
  }
  return { start: new Date("2025-06-01"), end: new Date("2025-12-31") };
}

// ─── frontmatter helpers ─────────────────────────────────────────────────────

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function hasTitleField(raw) {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return false;
  return /^title\s*:/m.test(m[1]);
}

function cleanTitle(filename) {
  // Remove .md extension, trim whitespace
  return filename.replace(/\.md$/i, "").trim();
}

function prependFrontmatter(raw, title, date) {
  const block = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndate: "${date}"\n---\n`;
  return block + raw;
}

// ─── file walker ─────────────────────────────────────────────────────────────

const ARTICLES_DIR = path.resolve(__dirname, "../src/content/articles");

function walkDir(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const joined = path.join(dir, entry.name);
    const full = path.normalize(joined);
    if (!full.startsWith(ARTICLES_DIR)) {
      throw new Error("Invalid path traversal detected: " + full);
    }
    if (entry.isDirectory()) {
      walkDir(full, callback);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      callback(full);
    }
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

let modified = 0;
let skipped = 0;
let total = 0;

walkDir(ARTICLES_DIR, (absPath) => {
  const normalizedPath = path.normalize(absPath);
  if (!normalizedPath.startsWith(ARTICLES_DIR)) {
    throw new Error("Invalid path traversal detected: " + normalizedPath);
  }
  const rel = path.relative(ARTICLES_DIR, normalizedPath).replace(/\\/g, "/");

  // Never touch paper articles
  if (rel.startsWith("papers/")) {
    skipped++;
    return;
  }

  total++;
  const raw = fs.readFileSync(normalizedPath, "utf8");

  if (hasTitleField(raw)) {
    // Already has a title — leave it alone
    return;
  }

  const filename = path.basename(normalizedPath);
  const title = cleanTitle(filename);
  const range = getDateRange(rel);
  const date = dateForPath(rel, range.start, range.end);
  const updated = prependFrontmatter(raw, title, date);

  if (DRY_RUN) {
    console.log(`[DRY] ${rel}\n  → title: "${title}", date: ${date}\n`);
  } else {
    fs.writeFileSync(normalizedPath, updated, "utf8");
    console.log(`UPDATED  ${rel}`);
  }
  modified++;
});

console.log(
  `\nDone. ${DRY_RUN ? "[DRY RUN] " : ""}` +
    `${modified} files updated, ${skipped} papers skipped (${total} total non-paper files processed).`,
);
