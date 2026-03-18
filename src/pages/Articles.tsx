import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/src/lib/utils';
import { Calendar, Clock, ArrowLeft, Filter, SortAsc, Folder, ChevronDown, List } from 'lucide-react';
import { getAllArticles, Article } from '@/src/lib/articles';
import { useApp } from '@/src/context/AppContext';

type SortBy = 'date' | 'title';

interface Header {
  id: string;
  text: string;
  level: number;
}

export default function Articles() {
  const { t, theme } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(t('common.all'));
  const [activeFolder, setActiveFolder] = useState<string>(t('common.all'));
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [loading, setLoading] = useState(true);
  const [activeHeader, setActiveHeader] = useState<string>('');

  useEffect(() => {
    getAllArticles().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => [t('common.all'), ...new Set(articles.map(a => a.category))], [articles, t]);
  const folders = useMemo(() => [t('common.all'), ...new Set(articles.map(a => a.folder))], [articles, t]);

  const filteredAndSortedArticles = useMemo(() => {
    return articles
      .filter(a => (activeCategory === t('common.all') || a.category === activeCategory))
      .filter(a => (activeFolder === t('common.all') || a.folder === activeFolder))
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return a.title.localeCompare(b.title);
      });
  }, [articles, activeCategory, activeFolder, sortBy]);

  // Extract headers for outline
  const headers = useMemo(() => {
    if (!selectedArticle) return [];
    const lines = selectedArticle.content.split('\n');
    const extracted: Header[] = [];
    lines.forEach(line => {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        extracted.push({ id, text, level });
      }
    });
    return extracted;
  }, [selectedArticle]);

  // Handle scroll to highlight active header
  useEffect(() => {
    if (!selectedArticle) return;
    
    const handleScroll = () => {
      const headerElements = headers.map(h => document.getElementById(h.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = headerElements.length - 1; i >= 0; i--) {
        const el = headerElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveHeader(headers[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedArticle, headers]);

  const scrollToHeader = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  if (selectedArticle) {
    return (
      <div className="px-6 max-w-7xl mx-auto pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Outline */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-fit">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-muted mb-6">
              <List size={14} /> {t('articles.outline')}
            </div>
            <nav className="space-y-1">
              {headers.map((header) => (
                <button
                  key={header.id}
                  onClick={() => scrollToHeader(header.id)}
                  className={cn(
                    "block w-full text-left text-sm py-1.5 transition-all hover:text-brand-text",
                    header.level === 1 ? "font-bold" : "pl-4 text-brand-muted",
                    activeHeader === header.id ? "text-brand-text border-l-2 border-brand-text pl-3 bg-brand-text/5" : "border-l border-brand-border/50 text-brand-muted/60"
                  )}
                >
                  {header.text}
                </button>
              ))}
              {headers.length === 0 && (
                <p className="text-[10px] text-brand-muted/40 italic px-4">{t('articles.noHeaders')}</p>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-grow max-w-3xl">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-brand-muted hover:text-brand-text mb-12 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              {t('articles.back')}
            </button>

            <header className="mb-16">
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 bg-brand-muted/5 text-brand-muted rounded-full border border-brand-border flex items-center gap-2">
                  <Folder size={10} /> {selectedArticle.folder}
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 bg-brand-muted/5 text-brand-muted rounded-full border border-brand-border">
                  {selectedArticle.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1] text-brand-text/90">{selectedArticle.title}</h1>
              <div className="flex items-center gap-6 text-brand-muted/70 text-xs font-medium tracking-wide">
                <div className="flex items-center gap-2"><Calendar size={14} /> {selectedArticle.date}</div>
              </div>
            </header>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="markdown-body text-brand-text/85 leading-[1.8] text-lg font-light">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h1 id={id} className="text-3xl font-bold mt-12 mb-6">{children}</h1>;
                    },
                    h2: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h2 id={id} className="text-2xl font-bold mt-10 mb-4">{children}</h2>;
                    },
                    h3: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h3 id={id} className="text-xl font-bold mt-8 mb-3">{children}</h3>;
                    },
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="my-10 rounded-2xl overflow-hidden border border-brand-border bg-brand-card/50 shadow-2xl backdrop-blur-sm">
                          <div className="flex items-center justify-between px-5 py-3 bg-brand-text/5 border-b border-brand-border">
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted/80">{match[1]}</span>
                            <div className="flex gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-border" />
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-border" />
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-border" />
                            </div>
                          </div>
                          <SyntaxHighlighter
                            style={theme === 'dark' ? vscDarkPlus : prism}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: '1.5rem',
                              fontSize: '0.875rem',
                              lineHeight: '1.7',
                              background: 'transparent',
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={cn("px-1.5 py-0.5 rounded bg-brand-text/10 font-mono text-sm", className)} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {selectedArticle.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 max-w-7xl mx-auto pb-32">
      <header className="mb-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">{t('articles.title')}</h1>
        <p className="text-brand-muted text-lg max-w-xl">{t('articles.subtitle')}</p>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center justify-between border-y border-brand-border py-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-brand-muted text-sm font-medium">
            <Filter size={16} /> {t('articles.filter')}:
          </div>
          <select 
            value={activeCategory} 
            onChange={(e) => setActiveCategory(e.target.value)}
            className="bg-brand-card border border-brand-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-text/20"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex items-center gap-2 text-brand-muted text-sm font-medium ml-4">
            <Folder size={16} /> {t('articles.folder')}:
          </div>
          <select 
            value={activeFolder} 
            onChange={(e) => setActiveFolder(e.target.value)}
            className="bg-brand-card border border-brand-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-text/20"
          >
            {folders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-brand-muted text-sm font-medium">
            <SortAsc size={16} /> {t('articles.sort')}:
          </div>
          <div className="flex bg-brand-card border border-brand-border rounded-lg overflow-hidden">
            <button 
              onClick={() => setSortBy('date')}
              className={cn("px-4 py-1.5 text-xs font-bold uppercase transition-colors", sortBy === 'date' ? 'bg-brand-text text-brand-bg' : 'hover:bg-brand-text/5')}
            >
              {t('articles.sort.date')}
            </button>
            <button 
              onClick={() => setSortBy('title')}
              className={cn("px-4 py-1.5 text-xs font-bold uppercase transition-colors", sortBy === 'title' ? 'bg-brand-text text-brand-bg' : 'hover:bg-brand-text/5')}
            >
              {t('articles.sort.title')}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedArticles.map((article, index) => (
              <motion.article
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedArticle(article)}
                className="group cursor-pointer border-b border-brand-border pb-12"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-4 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted/60">
                      <span className="flex items-center gap-1.5"><Folder size={12} /> {article.folder}</span>
                      <span className="w-1 h-1 bg-brand-border rounded-full" />
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {article.date}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-5 group-hover:translate-x-2 transition-transform duration-500 text-brand-text/90">{article.title}</h2>
                    <p className="text-brand-muted/80 leading-relaxed mb-8 max-w-2xl font-light">{article.excerpt}</p>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 bg-brand-muted/5 text-brand-muted/70 rounded border border-brand-border">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-24 h-24 rounded-full border border-brand-border group-hover:bg-brand-text group-hover:text-brand-bg transition-all duration-500">
                    <ArrowLeft size={32} className="rotate-180" />
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          {filteredAndSortedArticles.length === 0 && (
            <div className="text-center py-20 text-brand-muted">{t('articles.empty')}</div>
          )}
        </div>
      )}
    </div>
  );
}
