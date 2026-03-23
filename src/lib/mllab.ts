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
  const modules = import.meta.glob('/src/content/mllab/*.md', { query: '?raw', import: 'default' });
  
  const labs: LabData[] = [];

  for (const path in modules) {
    const rawContent = await modules[path]() as string;
    const { data, content: body } = matter(rawContent);
    
    // Extract file name as ID
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1].replace('.md', '');

    let formattedDate = data.date || '';
    if (formattedDate && typeof formattedDate !== 'string') {
      const d = new Date(formattedDate);
      formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else if (typeof formattedDate === 'string' && formattedDate.length >= 7) {
      formattedDate = formattedDate.substring(0, 7);
    }

    labs.push({
      id,
      title: data.title || id,
      date: formattedDate,
      category: data.category || 'ML Lab',
      folder: data.folder || 'Models',
      description: data.description || '',
      tags: data.tags || [],
      featured: data.featured ?? false,
      snippet: data.snippet || '',
      content: body || '',
    });
  }

  return labs.sort((a, b) => b.date.localeCompare(a.date));
}
