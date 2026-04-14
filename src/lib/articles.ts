import matter from 'gray-matter';
import { Buffer } from 'buffer';

// Polyfill Buffer for gray-matter in browser
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

export interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  folder: string;
  pathSegments: string[];
  outboundLinks: string[];
  pdfUrl?: string;
}

export async function getAllArticles(): Promise<Article[]> {
  const modules = import.meta.glob('/src/content/articles/**/*.md', { query: '?raw', import: 'default' });
  
  const articles: Article[] = [];

  for (const path in modules) {
    const content = await modules[path]() as string;
    const { data, content: body } = matter(content);
    
    // Extract folder from path (e.g., /src/content/articles/ml/transformers.md -> ml)
    const pathParts = path.split('/');
    const folder = pathParts[pathParts.length - 2];
    const id = pathParts[pathParts.length - 1].replace('.md', '');

    // Extract pathSegments relative to /src/content/articles/
    const prefix = '/src/content/articles/';
    let relativePath = path;
    if (path.startsWith(prefix)) {
      relativePath = path.substring(prefix.length);
    }
    const pathSegments = relativePath.split('/').slice(0, -1);

    // Extract Obsidian links [[Target|Alias]] or [[Target]]
    const outboundLinks: string[] = [];
    const linkRegex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = linkRegex.exec(body)) !== null) {
      const linkText = match[1];
      const linkTarget = linkText.split('|')[0].trim();
      // Only keep the clean ID if it ends up differing from title
      outboundLinks.push(linkTarget);
    }

    articles.push({
      id,
      title: data.title || id,
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
      category: data.category || 'Uncategorized',
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      content: body,
      folder: folder === 'articles' ? 'root' : folder,
      pathSegments,
      outboundLinks,
      pdfUrl: data.pdfUrl || data.pdf || data.paper || '',
    });
  }

  return articles;
}
