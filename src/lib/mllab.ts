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
  content: string; // The raw markdown body
}

export async function getAllLabs(): Promise<LabData[]> {
  const modules = import.meta.glob('/src/content/mllab/**/*.md', { query: '?raw', import: 'default' });
  
  const labs: LabData[] = [];

  for (const path in modules) {
    const rawContent = await modules[path]() as string;
    const { data, content: body } = matter(rawContent);
    
    // Extract file name as ID and folder from path
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1].replace('.md', '');
    
    let folder = 'General';
    if (pathParts.length >= 5) { // /src/content/mllab/FOLDER/FILE.md
       folder = pathParts[pathParts.length - 2];
       if (folder === 'mllab') folder = 'General';
    }

    let formattedDate = '';
    if (data.date) {
      const d = new Date(data.date);
      formattedDate = d.toISOString().split('T')[0];
    }

    labs.push({
      id,
      title: data.title || id,
      date: formattedDate,
      category: data.category || 'ML Lab',
      folder: folder,
      description: data.description || '',
      tags: data.tags || [],
      featured: data.featured ?? false,
      snippet: data.snippet || '',
      content: body || '',
    });
  }

  return labs.sort((a, b) => b.date.localeCompare(a.date));
}
