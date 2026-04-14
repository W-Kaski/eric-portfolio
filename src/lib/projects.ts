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
  tech: string[];
  github: string;
  demo: string;
  featured: boolean;
  pdfUrl?: string;
  customRoute?: string;
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
      tech: data.tech || [],
      github: data.github || '',
      demo: data.demo || '',
      featured: data.featured ?? false,
      pdfUrl: data.pdfUrl || data.pdf || data.paper || '',
    });
  }

  const paperModules = import.meta.glob('/src/content/articles/papers/*.md', { query: '?raw', import: 'default' });
  for (const path in paperModules) {
    const content = await paperModules[path]() as string;
    const { data, content: body } = matter(content);
    
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1].replace('.md', '');

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
      category: data.category || 'Research',
      image: data.image || '',
      color: data.color || '#3B82F6',
      description: body || '',
      tech: data.tech || data.tags || [],
      github: data.github || '',
      demo: data.demo || '',
      featured: data.featured ?? false,
      pdfUrl: data.pdfUrl || data.pdf || data.paper || '',
      customRoute: `/articles/${id}`
    });
  }

  return projects.sort((a, b) => b.date.localeCompare(a.date));
}
