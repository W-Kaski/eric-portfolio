import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'motion/react';
import { ArrowLeft, Github, ExternalLink, Code2, List } from 'lucide-react';
import { getAllProjects, ProjectData } from '../lib/projects';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  'Machine Learning': '#3B82F6',
  'UI/UX':            '#8B5CF6',
  'Dev':              '#10B981',
};

interface Header {
  id: string;
  text: string;
  level: number;
}


export default function ProjectDetail() {
  const { t, theme } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeHeader, setActiveHeader] = useState<string>('');

  useEffect(() => {
    getAllProjects().then(data => {
      const found = data.find(p => p.id === id);
      setProject(found || null);
      setLoading(false);
    });
  }, [id]);

  const headers = useMemo(() => {
    if (!project) return [];
    const lines = project.description?.split('\n') || [];
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
  }, [project]);

  useEffect(() => {
    if (!project) return;
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
  }, [project, headers]);

  const scrollToHeader = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <button
          onClick={() => navigate('/portfolio')}
          className="px-6 py-2 bg-brand-text text-brand-bg rounded-full"
        >
          {t('articles.back')}
        </button>
      </div>
    );
  }

  const accentColor = CATEGORY_COLORS[project.category] ?? '#888';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-6 max-w-7xl mx-auto pb-32 pt-10"
    >
      <div className="flex flex-col lg:flex-row items-start gap-12">
        {/* Sidebar Outline */}
        <aside className="hidden lg:block w-64 flex-shrink-0 relative">
          <div className="fixed top-24 w-64 flex flex-col h-[calc(100vh-8rem)] z-10 pb-8">
            <button
              onClick={() => navigate('/portfolio')}
              className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors group w-fit"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </button>

            <div className="mt-12 max-h-[calc(100vh-14rem)] flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-brand-muted mb-6">
                <List size={14} /> Outline
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
                  <p className="text-[10px] text-brand-muted/40 italic px-4">No headers found</p>
                )}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate('/portfolio')}
        className="lg:hidden flex items-center gap-2 text-brand-muted hover:text-brand-text mb-12 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Portfolio
      </button>

      {/* Header */}
      <div className="mb-10">
        {/* Category badge */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1.5 rounded-full border"
            style={{ color: accentColor, backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40` }}
          >
            {project.category}
          </span>
          {project.featured && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-brand-text/5 border border-brand-border text-brand-muted">
              Featured
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted/60">
            {project.date}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">{project.title}</h1>

        {/* Tech stack chips */}
        {project.tech.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <div className="flex items-center gap-1.5 text-brand-muted/50 mr-1">
              <Code2 size={13} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Stack</span>
            </div>
            {project.tech.map(tech => (
              <span
                key={tech}
                className="text-xs font-mono px-3 py-1 rounded-lg bg-brand-card border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text/20 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {(project.github || project.demo) && (
          <div className="flex flex-wrap gap-3 mb-10">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-text text-brand-bg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                <Github size={14} /> GitHub
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-card border border-brand-border text-brand-text text-xs font-bold uppercase tracking-widest hover:bg-brand-text/5 transition-colors"
              >
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
          </div>
        )}
      </div>


      {/* Markdown body */}
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
            {project.description}
          </ReactMarkdown>
        </div>
      </div>
        </div>
      </div>
    </motion.div>
  );
}
