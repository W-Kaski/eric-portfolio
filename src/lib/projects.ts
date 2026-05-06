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

/** Normalise any date value to a YYYY-MM string. */
function formatYearMonth(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw !== 'string') {
    const d = new Date(raw as string);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  return raw.length >= 7 ? raw.substring(0, 7) : raw;
}

export async function getAllProjects(): Promise<ProjectData[]> {
  const projectModules = import.meta.glob('/src/content/projects/*.md', { query: '?raw', import: 'default' });
  const paperModules = import.meta.glob('/src/content/articles/papers/*.md', { query: '?raw', import: 'default' });

  const parseProject = async (path: string, loader: () => Promise<unknown>): Promise<ProjectData> => {
    const content = await (loader as () => Promise<string>)();
    const { data, content: body } = matter(content);
    const id = path.split('/').pop()!.replace('.md', '');
    return {
      id,
      title: data.title || id,
      date: formatYearMonth(data.date),
      category: data.category || 'Uncategorized',
      image: data.image || '',
      color: data.color || '#333333',
      description: body || '',
      tech: data.tech || [],
      github: data.github || '',
      demo: data.demo || '',
      featured: data.featured ?? false,
      pdfUrl: data.pdfUrl || data.pdf || data.paper || '',
    };
  };

  const parsePaper = async (path: string, loader: () => Promise<unknown>): Promise<ProjectData> => {
    const content = await (loader as () => Promise<string>)();
    const { data, content: body } = matter(content);
    const id = path.split('/').pop()!.replace('.md', '');
    return {
      id,
      title: data.title || id,
      date: formatYearMonth(data.date),
      category: data.category || 'Research',
      image: data.image || '',
      color: data.color || '#3B82F6',
      description: body || '',
      tech: data.tech || data.tags || [],
      github: data.github || '',
      demo: data.demo || '',
      featured: data.featured ?? false,
      pdfUrl: data.pdfUrl || data.pdf || data.paper || '',
      customRoute: `/articles/${id}`,
    };
  };

  const [projects, papers] = await Promise.all([
    Promise.all(Object.entries(projectModules).map(([p, l]) => parseProject(p, l as () => Promise<unknown>))),
    Promise.all(Object.entries(paperModules).map(([p, l]) => parsePaper(p, l as () => Promise<unknown>))),
  ]);

  return [...projects, ...papers].sort((a, b) => b.date.localeCompare(a.date));
}
