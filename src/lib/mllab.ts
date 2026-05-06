import matter from 'gray-matter';
import { Buffer } from 'buffer';

// Polyfill Buffer for gray-matter in browser
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

export interface LabData {
  id: string;
  title: string;
  category: string;
  folder: string;
  date: string;
  description: string;
  tags: string[];
  featured: boolean;
  snippet?: string;
  content: string;
}

const _fileModules = import.meta.glob('/src/content/mllab/**/*.md', {
  query: '?raw',
  import: 'default',
});

export async function getAllLabs(): Promise<LabData[]> {
  const labs = await Promise.all(
    Object.entries(_fileModules).map(async ([path, loader]) => {
      const raw = await (loader as () => Promise<string>)();
      const { data, content: body } = matter(raw);
      const parts = path.split('/');
      const id = parts[parts.length - 1].replace('.md', '');
      let folder = parts.length >= 5 ? parts[parts.length - 2] : 'General';
      if (folder === 'mllab') folder = 'General';
      const date = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
      return {
        id,
        title: data.title || id,
        date,
        category: data.category || 'ML Lab',
        folder,
        description: data.description || '',
        tags: data.tags || [],
        featured: data.featured ?? false,
        snippet: data.snippet || '',
        content: body || '',
      };
    }),
  );

  return labs.sort((a, b) => b.date.localeCompare(a.date));
}
