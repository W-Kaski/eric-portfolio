import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/src/lib/utils';
import { Calendar, ArrowLeft, Folder, List } from 'lucide-react';
import { getAllArticles, Article } from '@/src/lib/articles';
import { useApp } from '@/src/context/AppContext';

interface Header {
  id: string;
  text: string;
  level: number;
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, t } = useApp();

  const [article, setArticle] = useState<Article | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeHeader, setActiveHeader] = useState<string>('');

  useEffect(() => {
    getAllArticles().then(data => {
      const found = data.find(a => a.id === id);
      if (found) {
        setArticle(found);
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  const headers = useMemo(() => {
    if (!article) return [];
    const lines = article.content.split('\n');
    const extracted: Header[] = [];
    let inCodeFence = false;
    lines.forEach(line => {
      if (line.trimStart().startsWith('```')) { inCodeFence = !inCodeFence; return; }
      if (inCodeFence) return;
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const hid = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        extracted.push({ id: hid, text, level });
      }
    });
    return extracted;
  }, [article]);

  useEffect(() => {
    if (!article) return;
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = headers.length - 1; i >= 0; i--) {
        const el = document.getElementById(headers[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollPosition) {
            setActiveHeader(headers[i].id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, headers]);

  const scrollToHeader = (hid: string) => {
    const el = document.getElementById(hid);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (notFound) {
    return (
      <div className="px-6 max-w-7xl mx-auto py-32 text-center">
        <p className="text-brand-muted text-sm uppercase tracking-widest">Article not found</p>
        <button onClick={() => navigate('/articles')} className="mt-6 flex items-center gap-2 mx-auto text-brand-text hover:text-brand-muted transition-colors">
          <ArrowLeft size={16} /> Back to Articles
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 max-w-7xl mx-auto pb-32"
    >
      <div className="flex flex-col lg:flex-row items-start gap-12">
        {/* Sidebar Outline */}
        <aside className="hidden lg:block w-64 flex-shrink-0 relative">
          <div className="fixed top-24 w-64 flex flex-col h-[calc(100vh-8rem)] z-10 pb-8">
            <button
              onClick={() => navigate('/articles')}
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
                {headers.map(header => (
                  <button
                    key={header.id}
                    onClick={() => scrollToHeader(header.id)}
                    className={cn(
                      'block w-full text-left text-sm py-1.5 transition-all hover:text-brand-text',
                      header.level === 1 ? 'font-bold' : 'pl-4 text-brand-muted',
                      activeHeader === header.id
                        ? 'text-brand-text border-l-2 border-brand-text pl-3 bg-brand-text/5'
                        : 'border-l border-brand-border/50 text-brand-muted/60'
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
          {/* Mobile back */}
          <button
            onClick={() => navigate('/articles')}
            className="lg:hidden flex items-center gap-2 text-brand-muted hover:text-brand-text mb-12 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            {t('articles.back')}
          </button>

          <header className="mb-16">
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 bg-brand-muted/5 text-brand-muted rounded-full border border-brand-border flex items-center gap-2">
                <Folder size={10} /> {article.folder}
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 bg-brand-muted/5 text-brand-muted rounded-full border border-brand-border">
                {article.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1] text-brand-text/90">
              {article.title}
            </h1>
            <div className="flex items-center gap-6 text-brand-muted/70 text-xs font-medium tracking-wide">
              <div className="flex items-center gap-2"><Calendar size={14} /> {article.date}</div>
            </div>
          </header>

          <div className="max-w-none">
            <div className="text-brand-text leading-[1.8] text-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({ children }) => {
                    const hid = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h1 id={hid} className="text-3xl font-bold mt-12 mb-6 text-brand-text border-b border-brand-border/30 pb-3">{children}</h1>;
                  },
                  h2: ({ children }) => {
                    const hid = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h2 id={hid} className="text-2xl font-bold mt-10 mb-4 text-brand-text">{children}</h2>;
                  },
                  h3: ({ children }) => {
                    const hid = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h3 id={hid} className="text-xl font-semibold mt-8 mb-3 text-brand-text">{children}</h3>;
                  },
                  h4: ({ children }) => {
                    const hid = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return <h4 id={hid} className="text-lg font-semibold mt-6 mb-2 text-brand-text">{children}</h4>;
                  },
                  p: ({ children }) => {
                    const childArr = React.Children.toArray(children).filter(
                      c => !(typeof c === 'string' && c.trim() === '')
                    );
                    const allImgs = childArr.length > 0 && childArr.every(
                      c => React.isValidElement(c) && (c.type === 'img' || (c as any).props?.src)
                    );
                    if (allImgs) return <div className="flex flex-wrap gap-2 my-3">{children}</div>;
                    return <p className="mb-5 text-brand-text/85 leading-[1.85]">{children}</p>;
                  },
                  strong: ({ children }) => <strong className="font-bold text-brand-text">{children}</strong>,
                  em: ({ children }) => <em className="italic text-brand-text/80">{children}</em>,
                  a: ({ href, children }) => {
                    if (href?.startsWith('#')) {
                      return (
                        <a
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(href.substring(1));
                            if (element) {
                              const top = element.getBoundingClientRect().top + window.scrollY - 80;
                              window.scrollTo({ top, behavior: 'smooth' });
                            }
                          }}
                          className="text-brand-text underline underline-offset-4 decoration-brand-border hover:decoration-brand-text transition-colors"
                        >
                          {children}
                        </a>
                      );
                    }
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-text underline underline-offset-4 decoration-brand-border hover:decoration-brand-text transition-colors">
                        {children}
                      </a>
                    );
                  },
                  ul: ({ children }) => <ul className="mb-5 pl-6 space-y-1.5 list-disc text-brand-text/85">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-5 pl-6 space-y-1.5 list-decimal text-brand-text/85">{children}</ol>,
                  li: ({ children }) => <li className="text-brand-text/85 leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="my-6 pl-5 border-l-4 border-brand-text/30 text-brand-muted italic bg-brand-card/30 py-3 pr-3 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="my-10 border-brand-border/40" />,
                  table: ({ children }) => (
                    <div className="my-8 overflow-x-auto rounded-lg border border-brand-border/40">
                      <table className="w-full text-sm text-brand-text">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-brand-card/50 border-b border-brand-border/40">{children}</thead>,
                  th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-brand-muted">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-3 text-brand-text/80 border-t border-brand-border/20">{children}</td>,
                  img: ({ src, alt }) => <img src={src} alt={alt} className="rounded-lg max-w-full my-6 border border-brand-border/30" />,
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const lang = match ? match[1] : '';
                    const codeContent = String(children).replace(/\n$/, '');
                    const isMultiLine = codeContent.includes('\n');
                    if (!inline && (match || isMultiLine)) {
                      return (
                        <div className="my-8 rounded-xl overflow-hidden border border-brand-border/60 shadow-lg">
                          <div className="flex items-center justify-between px-5 py-2.5 bg-[#1e1e1e] border-b border-white/10">
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">{lang || 'code'}</span>
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                            </div>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={lang || 'text'}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1.25rem 1.5rem', fontSize: '0.825rem', lineHeight: '1.7', background: '#1e1e1e' }}
                            {...props}
                          >
                            {codeContent}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-brand-text/10 font-mono text-[0.85em] text-brand-text border border-brand-border/30" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
