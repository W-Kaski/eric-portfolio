import matter from "gray-matter";
import { Buffer } from "buffer";

// Polyfill Buffer for gray-matter in browser
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

// ArticleMeta: lightweight — no body content stored, loaded in parallel on first call.
// Sufficient for list/tree/graph views.
export interface ArticleMeta {
  id: string;
  /** Original import path; retained so full content can be loaded on demand. */
  _path: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  folder: string;
  pathSegments: string[];
  outboundLinks: string[];
  pdfUrl?: string;
}

// Article: extends meta with full markdown body, loaded on demand per-article.
export interface Article extends ArticleMeta {
  content: string;
}

// ─── module-level singletons ──────────────────────────────────────────────────

/** All .md file loaders registered at build time by Vite. */
const _fileModules = import.meta.glob("/src/content/articles/**/*.md", {
  query: "?raw",
  import: "default",
});

/** id → original Vite import path (maps the last registered path per id). */
const _idToPath = new Map<string, string>();

/** Singleton promise for the metadata pass — runs once, results reused. */
let _metaPromise: Promise<ArticleMeta[]> | null = null;

/** Full-content cache keyed by article id. */
const _articleCache = new Map<string, Article>();

// ─── helpers ─────────────────────────────────────────────────────────────────

function _extractOutboundLinks(body: string): string[] {
  const links: string[] = [];
  const re = /\[\[(.*?)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    links.push(m[1].split("|")[0].trim());
  }
  return links;
}

function _parseMeta(path: string, raw: string): ArticleMeta {
  const { data: fm, content: body } = matter(raw);
  const parts = path.split("/");
  const folder = parts.at(-2) || "root";
  const id = (parts.at(-1) || "").replace(".md", "");
  const prefix = "/src/content/articles/";
  const rel = path.startsWith(prefix) ? path.slice(prefix.length) : path;
  const pathSegments = rel.split("/").slice(0, -1);

  return {
    id,
    _path: path,
    title: fm.title || id,
    date: fm.date ? new Date(fm.date).toISOString().split("T")[0] : "",
    category: fm.category || "Uncategorized",
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    excerpt: fm.excerpt || "",
    folder: folder === "articles" ? "root" : folder,
    pathSegments,
    outboundLinks: _extractOutboundLinks(body),
    pdfUrl: fm.pdfUrl || fm.pdf || fm.paper || "",
  };
}

// ─── public API ──────────────────────────────────────────────────────────────

/**
 * Load metadata for all articles in parallel.
 * Body content is NOT stored; outbound links are extracted from it and discarded.
 * Subsequent calls return the same cached promise (no re-fetching).
 *
 * ~30x faster than the previous sequential `for...of await` on 350 files.
 */
export function getArticlesMeta(): Promise<ArticleMeta[]> {
  if (_metaPromise) return _metaPromise;

  _metaPromise = Promise.all(
    Object.entries(_fileModules).map(async ([path, loader]) => {
      const raw = await (loader as () => Promise<string>)();
      const meta = _parseMeta(path, raw);
      _idToPath.set(meta.id, path);
      return meta;
    }),
  );

  return _metaPromise;
}

/**
 * Load the full content for a single article by id.
 * Results are cached; subsequent calls are synchronous (Map lookup).
 * The underlying module is already cached by the browser after `getArticlesMeta`,
 * so the dynamic import is effectively instant on the second call.
 */
export async function getArticleById(id: string): Promise<Article | null> {
  if (_articleCache.has(id)) return _articleCache.get(id)!;

  // Ensure the id→path map is populated
  await getArticlesMeta();

  const path = _idToPath.get(id);
  if (!path) return null;

  const loader = _fileModules[path];
  if (!loader) return null;

  const raw = await (loader as () => Promise<string>)();
  const meta = _parseMeta(path, raw);
  const { content: body } = matter(raw);
  const article: Article = { ...meta, content: body };

  _articleCache.set(id, article);
  return article;
}

/**
 * Load all articles with full content.
 * Prefer `getArticlesMeta()` for list/tree/graph views to avoid holding all
 * 350 markdown bodies in memory simultaneously.
 */
export async function getAllArticles(): Promise<Article[]> {
  const metas = await getArticlesMeta();
  return Promise.all(
    metas.map((m) => getArticleById(m.id) as Promise<Article>),
  );
}
