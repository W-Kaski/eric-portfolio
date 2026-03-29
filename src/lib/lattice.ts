import matter from 'gray-matter';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LatticeNode {
  id: string;
  type: 'root' | 'domain' | 'branch' | 'article';
  label: string;
  path: string;
  content?: string;
  date?: string;
  tags?: string[];
}

export interface LatticeEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  dashed?: boolean;
}

export interface LatticeGraph {
  nodes: LatticeNode[];
  edges: LatticeEdge[];
}

export interface GraphRoot {
  id: string;               // e.g. 'machine-learning'
  label: string;            // e.g. 'MACHINE LEARNING'
  paperCount: number;
}

// ─── All MD files under lattice/ ─────────────────────────────────────────────

// NOTE: import.meta.glob paths must be string literals — we load all and filter by root.
const allModules = import.meta.glob('/src/content/lattice/**/*.md', {
  query: '?raw',
  import: 'default',
});

// ─── Discover graph roots (top-level subdirs) ─────────────────────────────────

export async function getGraphRoots(): Promise<GraphRoot[]> {
  const rootCounts: Record<string, number> = {};

  for (const path of Object.keys(allModules)) {
    // path: /src/content/lattice/machine-learning/deep-learning/transformers.md
    const rel = path.replace('/src/content/lattice/', '');
    const topDir = rel.split('/')[0];
    rootCounts[topDir] = (rootCounts[topDir] ?? 0) + 1;
  }

  return Object.entries(rootCounts).map(([id, paperCount]) => ({
    id,
    label: id.replace(/-/g, ' ').toUpperCase(),
    paperCount,
  }));
}

// ─── Build graph for a single top-level folder ───────────────────────────────

export async function getLatticeGraphByRoot(rootFolder: string): Promise<LatticeGraph> {
  const nodes: LatticeNode[] = [];
  const edges: LatticeEdge[] = [];
  const crossLinks: Array<{ from: string; to: string; relation: string }> = [];
  const created = new Set<string>();

  // Root node for this graph (the top-level dir itself)
  const rootId = rootFolder;
  const rootLabel = rootFolder.replace(/-/g, ' ').toUpperCase();
  nodes.push({ id: rootId, type: 'root', label: rootLabel, path: rootFolder });
  created.add(rootId);

  for (const fullPath in allModules) {
    // Skip files not under this rootFolder
    const rel = fullPath.replace('/src/content/lattice/', '');
    if (!rel.startsWith(rootFolder + '/')) continue;

    const raw = await allModules[fullPath]() as string;
    const { data, content: body } = matter(raw);

    // e.g. rel = 'machine-learning/deep-learning/transformers'
    const relNoExt = rel.replace('.md', '');
    const parts = relNoExt.split('/'); // ['machine-learning', 'deep-learning', 'transformers']

    // Create intermediate branch nodes (skip index 0 = rootFolder itself)
    for (let i = 1; i < parts.length - 1; i++) {
      const segId = parts.slice(0, i + 1).join('__');
      const parentId = i === 1 ? rootId : parts.slice(0, i).join('__');

      if (!created.has(segId)) {
        created.add(segId);
        nodes.push({
          id:    segId,
          type:  'branch',
          label: parts[i].replace(/-/g, ' ').toUpperCase(),
          path:  parts.slice(0, i + 1).join('/'),
        });
        edges.push({
          id:     `e-${parentId}--${segId}`,
          source: parentId,
          target: segId,
          label:  'BRANCH',
        });
      }
    }

    // Article node
    const fileSlug = parts[parts.length - 1];
    const parentId = parts.length > 2
      ? parts.slice(0, -1).join('__')
      : rootId;

    // Use unique ID to avoid collision across graphs: rootFolder + slug
    const articleId = `${rootFolder}__${fileSlug}`;

    nodes.push({
      id:      articleId,
      type:    'article',
      label:   data.title || fileSlug,
      path:    relNoExt,
      content: body,
      date:    data.date ? new Date(data.date).toISOString().split('T')[0] : '',
      tags:    data.tags || [],
    });

    edges.push({
      id:     `e-${parentId}--${articleId}`,
      source: parentId,
      target: articleId,
      label:  'PAPER',
    });

    // Cross-links from frontmatter
    if (Array.isArray(data.related)) {
      data.related.forEach((r: { id: string; relation?: string }) => {
        crossLinks.push({
          from:     articleId,
          to:       `${rootFolder}__${r.id}`,    // scoped to same graph
          relation: r.relation || 'RELATED',
        });
      });
    }
  }

  // Resolve cross-links and deduplicate
  const nodeIds = new Set(nodes.map(n => n.id));
  const seenPairs = new Set<string>();

  crossLinks.forEach(({ from, to, relation }) => {
    if (nodeIds.has(to)) {
      // Create a unique key for the undirected pair to prevent duplicate edges
      const pairKey = [from, to].sort().join('--');
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        edges.push({ id: `cross-${from}--${to}`, source: from, target: to, label: relation, dashed: true });
      }
    }
  });

  return { nodes, edges };
}
