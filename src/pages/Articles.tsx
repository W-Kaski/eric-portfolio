import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/src/lib/utils';
import { Calendar, Clock, ArrowLeft, Filter, SortAsc, Folder, ChevronDown, List, Network, FolderTree, LayoutGrid } from 'lucide-react';
import { getArticlesMeta, getArticleById, ArticleMeta, Article } from '@/src/lib/articles';
import { useApp } from '@/src/context/AppContext';
import { ArticleTreeView } from '@/src/components/ArticleTreeView';
import { ArticleGraphView } from '@/src/components/ArticleGraphView';

type SortBy = 'date' | 'title';

interface Header {
  id: string;
  text: string;
  level: number;
}

export default function Articles() {
  const { t, theme } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetId = searchParams.get('id');

  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(t('common.all'));
  const [activeFolder, setActiveFolder] = useState<string>(t('common.all'));
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewModeState] = useState<'grid' | 'tree' | 'graph'>(
    (localStorage.getItem('articleViewMode') as 'grid' | 'tree' | 'graph') || 'grid'
  );
  const setViewMode = (mode: 'grid' | 'tree' | 'graph') => {
    localStorage.setItem('articleViewMode', mode);
    setViewModeState(mode);
  };
  const [loading, setLoading] = useState(true);
  const [activeHeader, setActiveHeader] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    // Load only metadata in parallel — no markdown bodies stored yet.
    getArticlesMeta().then(data => {
      setArticles(data);
      setLoading(false);

      // Handle deep linking from URL — trigger full content load for linked article
      if (targetId) {
        const meta = data.find(a => a.id === targetId);
        if (meta) {
          setLoadingContent(true);
          getArticleById(meta.id).then(article => {
            if (article) setSelectedArticle(article);
            setLoadingContent(false);
          });
        }
      }
    });
  }, [targetId]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeFolder, sortBy]);

  const coreArticles = useMemo(() => filteredAndSortedArticles.filter(a => a.folder !== 'papers'), [filteredAndSortedArticles]);
  const totalPages = Math.ceil(coreArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return coreArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [coreArticles, currentPage]);

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

  if (loadingContent) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="px-6 max-w-7xl mx-auto pb-32">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Sidebar Outline */}
          <aside className="hidden lg:block w-64 flex-shrink-0 relative">
            <div className="fixed top-24 w-64 flex flex-col h-[calc(100vh-8rem)] z-10 pb-8">
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  setSearchParams({});
                }}
                className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors group w-fit"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                {t('articles.back')}
              </button>

              <div className="mt-12 max-h-[calc(100vh-14rem)] flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-muted mb-6">
                  <List size={14} /> {t('articles.outline')}
                </div>
                <nav className="space-y-1 overflow-y-auto scrollbar-hide pr-4">
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
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow max-w-3xl">
            <button
              onClick={() => {
                setSelectedArticle(null);
                setSearchParams({}); // Clear query param when going back
              }}
              className="lg:hidden flex items-center gap-2 text-brand-muted hover:text-brand-text mb-12 transition-colors group"
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
              <div className="text-brand-text/90 leading-[1.8] text-lg font-light prose-headings:text-brand-text prose-p:text-brand-text/90 prose-strong:text-brand-text prose-ul:text-brand-text/90">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
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
                    code({ className, children }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeContent = String(children).replace(/\n$/, '');
                      const isBlock = match || codeContent.includes('\n');
                      return isBlock ? (
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
                          >
                            {codeContent}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={cn("px-1.5 py-0.5 rounded bg-brand-text/10 font-mono text-sm", className)}>
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
    <div className="px-6 max-w-7xl mx-auto pb-32 pt-2">
      {/* Header + Controls — single row */}
      <div className="flex items-end justify-between mb-12 border-b border-brand-border/40 pb-5">
        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">{t('articles.title')}</h1>

        <div className="flex flex-wrap items-center gap-6 justify-end">
          {/* View Mode */}
          <div className="flex bg-brand-card border border-brand-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 uppercase transition-colors tracking-widest", viewMode === 'grid' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5')}
            >
              <LayoutGrid size={12} /> Grid
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={cn("px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 uppercase transition-colors tracking-widest", viewMode === 'tree' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5')}
            >
              <FolderTree size={12} /> Tree
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={cn("px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 uppercase transition-colors tracking-widest", viewMode === 'graph' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5')}
            >
              <Network size={12} /> Graph
            </button>
          </div>



          {/* Sort */}
          <div className="flex items-center gap-2">
            <div className="flex bg-brand-card border border-brand-border rounded-lg overflow-hidden">
              <button
                onClick={() => setSortBy('date')}
                className={cn("px-3 py-1.5 text-[10px] font-bold uppercase transition-colors tracking-widest", sortBy === 'date' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5')}
              >
                {t('articles.sort.date')}
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={cn("px-3 py-1.5 text-[10px] font-bold uppercase transition-colors tracking-widest", sortBy === 'title' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5')}
              >
                {t('articles.sort.title')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
        </div>
      ) : viewMode === 'graph' ? (
        <div className="w-full relative mt-4">
          <ArticleGraphView articles={articles} />
        </div>
      ) : viewMode === 'tree' ? (
        <div className="w-full mt-4 p-6 bg-brand-card/30 border border-brand-border/40 rounded-xl">
          <ArticleTreeView articles={filteredAndSortedArticles} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Grid: Articles (65%) */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-muted">{t('Core Articles')}</h2>
              <div className="flex-grow h-px bg-brand-border/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12 mb-8">
              <AnimatePresence mode="popLayout">
                {paginatedArticles.map((article, index) => (
                  <motion.article
                    key={article.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/articles/${article.id}`)}
                    className="group cursor-pointer border-l-2 border-brand-border/20 pl-6 py-2 hover:border-brand-text transition-colors relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-[9px] font-bold tracking-[0.2em] uppercase text-brand-muted/60">
                        <span>{article.date}</span>
                        <span className="w-1 h-1 bg-brand-border rounded-full" />
                        <span>{article.folder}</span>
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-brand-text transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-brand-muted text-xs leading-relaxed line-clamp-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        {article.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {article.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[7px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-brand-muted/5 text-brand-muted/60 border border-brand-border/40">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
            {coreArticles.length === 0 && (
              <div className="py-20 text-center text-brand-muted uppercase text-[10px] font-bold tracking-[0.3em] border border-dashed border-brand-border/40">
                {t('articles.empty')}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 border-t border-brand-border/40 pt-4">
                <div className="text-[10px] text-brand-muted/60 font-bold uppercase tracking-widest">
                  {t('Page')} {currentPage} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-brand-border rounded hover:bg-brand-text/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-brand-border rounded hover:bg-brand-text/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ArrowLeft size={14} className="rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Research Papers (35%) */}
          <div className="lg:col-span-4 space-y-12 bg-brand-card/20 p-8 border border-brand-border/30 backdrop-blur-sm self-start">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text">{t('Research / Papers')}</h2>
              <div className="flex-grow h-px bg-brand-text/10" />
            </div>

            <div className="space-y-8">
              {filteredAndSortedArticles.filter(a => a.folder === 'papers').length > 0 ? (
                filteredAndSortedArticles.filter(a => a.folder === 'papers').map((paper, index) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/articles/${paper.id}`)}
                    className="group cursor-pointer space-y-3 border-b border-brand-border/20 pb-8 last:border-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[8px] font-mono p-1 bg-brand-text/5 text-brand-muted border border-brand-border/40">{t('DOC_')}{index + 1}</span>
                      <span className="text-[8px] font-mono text-brand-muted/40 uppercase tracking-widest">{paper.date}</span>
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-tight group-hover:text-brand-text transition-colors leading-snug">
                      {paper.title}
                    </h4>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center text-[9px] text-brand-muted/40 italic">
                  {t('NO PUBLISHED PAPERS FOUND.')}
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-brand-border/20">
              <p className="text-[9px] leading-relaxed text-brand-muted/60 font-light">
                {t('Academic research focusing on geometric machine learning, latent space navigation, and human-computer interaction patterns.')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
