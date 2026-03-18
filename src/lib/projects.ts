import matter from 'gray-matter';
import { Buffer } from 'buffer';

// Polyfill Buffer for gray-matter in browser
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

export interface ProjectData {
  id: string;
  title: string;
  category: string;
  image: string;
  color: string;
  date: string; // YYYY-MM
  description: string;
}

export async function getAllProjects(): Promise<ProjectData[]> {
  const modules = import.meta.glob('/src/content/projects/*.md', { query: '?raw', import: 'default' });
  
  const projects: ProjectData[] = [];

  for (const path in modules) {
    const content = await modules[path]() as string;
    const { data, content: body } = matter(content);
    
    // Extract file name as ID
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1].replace('.md', '');

    // Format date specifically as YYYY-MM per standard UI requirement if string date given
    let formattedDate = data.date || '';
    if (formattedDate && typeof formattedDate !== 'string') {
        const d = new Date(formattedDate);
        formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else if (typeof formattedDate === 'string' && formattedDate.length >= 7) {
        formattedDate = formattedDate.substring(0, 7);
    }

    projects.push({
      id,
      title: data.title || id,
      date: formattedDate,
      category: data.category || 'Uncategorized',
      image: data.image || '',
      color: data.color || '#333333',
      description: body || '',
    });
  }

  // Sort by date descending
  return projects.sort((a, b) => b.date.localeCompare(a.date));
}
