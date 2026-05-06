import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, Calendar, ArrowLeft, Tag, Maximize2, SortAsc, ArrowRight,
  MousePointer2, Network, Box, Zap, List
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { getAllLabs, LabData } from '../lib/mllab';

interface Header {
  id: string;
  text: string;
  level: number;
}

// Interactive Components
import DecisionBoundaryLab from '../components/mllab/DecisionBoundaryLab';
import NNVisualizerLab from '../components/mllab/NNVisualizerLab';
import DimReductionLab from '../components/mllab/DimReductionLab';
import RLLab from '../components/mllab/RLLab';
import GradientDescentLab from '../components/mllab/GradientDescentLab';
import KMeansLab from '../components/mllab/KMeansLab';
import SelfAttentionLab from '../components/mllab/SelfAttentionLab';
import RAGExplorerLab from '../components/mllab/RAGExplorerLab';
import ReActAgentLab from '../components/mllab/ReActAgentLab';

// ─── Bento mini-preview components (Refactored to sharp edges) ──────────────

const MiniDecisionBoundary = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center border-b border-brand-border/30">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-red-500/10" />
    <svg className="w-full h-full absolute inset-0 opacity-40">
      <line x1="10%" y1="90%" x2="90%" y2="10%" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
      <rect x="25%" y="35%" width="4" height="4" fill="#3B82F6" />
      <rect x="35%" y="25%" width="4" height="4" fill="#3B82F6" />
      <rect x="65%" y="75%" width="4" height="4" fill="#EF4444" />
      <rect x="75%" y="65%" width="4" height="4" fill="#EF4444" />
    </svg>
    <MousePointer2 size={14} className="text-white/20" />
  </div>
);

const MiniNNVisualizer = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center border-b border-brand-border/30">
    <Network size={28} className="text-white/10 absolute" />
    <div className="flex gap-5 opacity-40">
      <div className="flex flex-col gap-3"><div className="w-1.5 h-1.5 bg-white"/><div className="w-1.5 h-1.5 bg-white"/></div>
      <div className="flex flex-col gap-3"><div className="w-1.5 h-1.5 bg-brand-text"/><div className="w-1.5 h-1.5 bg-brand-text"/><div className="w-1.5 h-1.5 bg-brand-text"/></div>
      <div className="flex flex-col gap-3 justify-center"><div className="w-1.5 h-1.5 bg-white"/></div>
    </div>
  </div>
);

const MiniDimReduction = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center border-b border-brand-border/30">
    <div className="absolute inset-0 flex items-center justify-center">
      <Box size={28} className="text-white/5 absolute scale-150" />
      <div className="w-2 h-2 bg-blue-500/60 absolute -ml-8 -mt-5" />
      <div className="w-2 h-2 bg-red-500/60 absolute ml-8 mt-5" />
      <div className="w-2 h-2 bg-emerald-500/60 absolute ml-5 -mt-8" />
    </div>
  </div>
);

const MiniRLLab = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center border-b border-brand-border/30">
    <div className="grid grid-cols-4 gap-1 opacity-30">
      {Array.from({length: 16}).map((_, i) => (
        <div key={i} className={cn("w-3 h-3", i===15 ? "bg-emerald-500" : i===6 ? "bg-red-500" : "bg-white/5")}>
          {i===0 && <div className="w-full h-full flex items-center justify-center"><Zap size={8} className="text-brand-text" /></div>}
        </div>
      ))}
    </div>
  </div>
);

const MiniGradientDescent = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center border-b border-brand-border/30">
    <svg className="w-full h-full absolute inset-0 opacity-20">
      <circle cx="50%" cy="50%" r="40" fill="none" stroke="white" strokeWidth="0.5" />
      <circle cx="50%" cy="50%" r="80" fill="none" stroke="white" strokeWidth="0.5" />
      <circle cx="50%" cy="50%" r="120" fill="none" stroke="white" strokeWidth="0.5" />
    </svg>
    <motion.div 
      animate={{ 
        x: [20, 10, 5, 2, 0], 
        y: [20, 10, 5, 2, 0],
        opacity: [0.2, 1, 1, 1, 0.5]
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-2 h-2 bg-brand-text rounded-full shadow-[0_0_10px_rgba(216,208,196,0.5)]"
    />
  </div>
);

const MiniKMeans = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center border-b border-brand-border/30">
    <div className="grid grid-cols-2 gap-4">
      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
    </div>
    <svg className="absolute inset-0 w-full h-full opacity-10">
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="0.5" />
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="0.5" />
    </svg>
  </div>
);

const MiniSelfAttention = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center border-b border-brand-border/30">
    <div className="absolute inset-0 bg-blue-500/5" />
    <svg className="w-full h-full absolute inset-0 opacity-40">
       <path d="M 20 80 Q 50 20 80 80" fill="none" stroke="#3B82F6" strokeWidth="2" />
       <path d="M 40 80 Q 50 40 60 80" fill="none" stroke="#3B82F6" strokeWidth="1" />
    </svg>
    <div className="flex gap-4 z-10 bottom-4 absolute">
       <div className="w-4 h-1 bg-brand-text/80 rounded" />
       <div className="w-4 h-1 bg-white/20 rounded" />
       <div className="w-4 h-1 bg-brand-text/30 rounded" />
    </div>
  </div>
);

const MiniRAGExplorer = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center border-b border-brand-border/30">
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="absolute w-full h-full"><circle cx="50%" cy="50%" r="40" fill="none" stroke="rgba(16,185,129,0.3)" strokeDasharray="2 2" /></svg>
      <div className="w-2 h-2 bg-emerald-500/80 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] absolute z-10" />
      <div className="w-1.5 h-1.5 bg-brand-text/80 rounded-full absolute ml-8 -mt-6" />
      <div className="w-1.5 h-1.5 bg-brand-text/80 rounded-full absolute -ml-6 mt-8" />
      <div className="w-1 h-1 bg-white/20 rounded-full absolute ml-12 mt-4" />
    </div>
  </div>
);

const MiniReActAgent = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex flex-col justify-center p-6 border-b border-brand-border/30 opacity-60">
    <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 flex-shrink-0 bg-brand-text/50 rounded-sm" /><div className="h-1 w-12 bg-white/20 rounded" /></div>
    <div className="flex items-center gap-2 mb-3 ml-4"><div className="w-2 h-2 flex-shrink-0 bg-blue-500/50 rounded-sm" /><div className="h-1 w-16 bg-white/20 rounded" /></div>
    <div className="flex items-center gap-2 mb-3 ml-8"><div className="w-2 h-2 flex-shrink-0 bg-emerald-500/50 rounded-sm" /><div className="h-1 w-10 bg-white/20 rounded" /></div>
    <div className="flex items-center gap-2"><div className="w-2 h-2 flex-shrink-0 bg-brand-text/80 rounded-sm shadow-[0_0_8px_rgba(216,208,196,0.5)]" /><div className="h-1 w-14 bg-white/40 rounded" /></div>
  </div>
);

const MiniCodePreview = ({ snippet }: { snippet?: string }) => {
  const lines = (snippet || '').split('\n').slice(0, 4).join('\n');
  return (
    <div className="w-full h-full overflow-hidden bg-[#0a0a0a] border-b border-brand-border/30">
      <SyntaxHighlighter language="python" style={atomDark} customStyle={{ background: 'transparent', padding: '1rem', margin: 0, fontSize: '9px', lineHeight: '1.6', overflow: 'hidden' }}>
        {lines || '# Lab snippet'}
      </SyntaxHighlighter>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MLLab() {
  const { t } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetId = searchParams.get('id');
  
  const [modules, setModules] = useState<LabData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedModule, setSelectedModule] = useState<LabData | null>(null);
  const [activeHeader, setActiveHeader] = useState<string>('');
  const [activeFolder, setActiveFolder] = useState<string>(t('common.all'));
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract headers for outline
  const headers = useMemo(() => {
    if (!selectedModule) return [];
    const lines = selectedModule.content.split('\n');
    const extracted: Header[] = [];
    let inCodeFence = false;
    lines.forEach(line => {
      if (line.trimStart().startsWith('```')) { inCodeFence = !inCodeFence; return; }
      if (inCodeFence) return;
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        extracted.push({ id, text, level });
      }
    });
    return extracted;
  }, [selectedModule]);

  // Handle scroll to highlight active header
  useEffect(() => {
    if (!selectedModule) return;
    
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
  }, [selectedModule, headers]);

  const scrollToHeader = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    getAllLabs().then(data => {
      setModules(data);
      setLoading(false);
      
      // Handle deep linking from URL
      if (targetId) {
        const module = data.find(m => m.id === targetId);
        if (module) {
          setSelectedModule(module);
        }
      }
    });
  }, [targetId]);

  const folders = useMemo(() => {
    const uniqueFolders = [...new Set(modules.map(m => m.folder))].sort();
    return [t('common.all'), ...uniqueFolders];
  }, [modules, t]);

  const filteredModules = useMemo(() => {
    return modules
      .filter(m => activeFolder === t('common.all') || m.folder === activeFolder)
      .sort((a, b) => {
        if (sortBy === 'date') return b.date.localeCompare(a.date);
        return a.title.localeCompare(b.title);
      });
  }, [modules, activeFolder, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFolder, sortBy]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const paginatedModules = filteredModules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-6 h-6 border-[0.5px] border-brand-text/20 border-t-brand-text animate-spin" />
      </div>
    );
  }

  // ── Detail View ──────────────────────────────────────────────────────────

  if (selectedModule) {
    let InteractiveComponent = null;
    switch (selectedModule.id) {
      case 'decision-boundary': InteractiveComponent = <DecisionBoundaryLab />; break;
      case 'nn-visualizer': InteractiveComponent = <NNVisualizerLab />; break;
      case 'dim-reduction': InteractiveComponent = <DimReductionLab />; break;
      case 'reinforcement-learning': InteractiveComponent = <RLLab />; break;
      case 'gradient-descent': InteractiveComponent = <GradientDescentLab />; break;
      case 'kmeans-clustering': InteractiveComponent = <KMeansLab />; break;
      case 'self-attention': InteractiveComponent = <SelfAttentionLab />; break;
      case 'rag-explorer': InteractiveComponent = <RAGExplorerLab />; break;
      case 'react-agent': InteractiveComponent = <ReActAgentLab />; break;
    }

    return (
      <div className="px-6 max-w-7xl mx-auto pb-32">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Sidebar Outline */}
          <aside className="hidden lg:block w-64 flex-shrink-0 relative">
            <div className="fixed top-24 w-64 flex flex-col h-[calc(100vh-8rem)] z-10 pb-8">
              <button 
                onClick={() => {
                  setSelectedModule(null);
                  setSearchParams({});
                }}
                className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors group w-fit"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                {t('lab.back')}
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
                setSelectedModule(null);
                setSearchParams({}); // Clear query param when going back
              }}
              className="lg:hidden flex items-center gap-2 text-brand-muted hover:text-brand-text mb-12 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              {t('lab.back')}
            </button>

            <header className="mb-16">
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 bg-brand-muted/5 text-brand-muted rounded-full border border-brand-border flex items-center gap-2">
                  <Folder size={10} /> {selectedModule.folder}
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 bg-brand-muted/5 text-brand-muted rounded-full border border-brand-border">
                  {selectedModule.date}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1] text-brand-text/90">
                {selectedModule.title}
              </h1>

              {selectedModule.description && (
                <p className="text-brand-muted text-xl max-w-2xl leading-relaxed font-light mb-8 border-l border-brand-border pl-6">
                  {selectedModule.description}
                </p>
              )}
            </header>

            {InteractiveComponent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-brand-border overflow-hidden h-[600px] bg-neutral-900 mb-16 relative"
              >
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-text/30" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-brand-text/30" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-brand-text/30" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-text/30" />
                {InteractiveComponent}
              </motion.div>
            )}

            <div className="max-w-none">
              <div className="text-brand-text leading-[1.8] text-base">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h1 id={id} className="text-3xl font-bold mt-12 mb-6 text-brand-text border-b border-brand-border/30 pb-3">{children}</h1>;
                    },
                    h2: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h2 id={id} className="text-2xl font-bold mt-10 mb-4 text-brand-text">{children}</h2>;
                    },
                    h3: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h3 id={id} className="text-xl font-semibold mt-8 mb-3 text-brand-text">{children}</h3>;
                    },
                    h4: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h4 id={id} className="text-lg font-semibold mt-6 mb-2 text-brand-text">{children}</h4>;
                    },
                    p: ({ children }) => {
                      const childArr = React.Children.toArray(children).filter(c => !(typeof c === 'string' && (c as string).trim() === ''));
                      const allImgs = childArr.length > 0 && childArr.every(c => React.isValidElement(c) && (c.type === 'img' || (c as any).props?.src));
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
                    code({ node, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const lang = match ? match[1] : '';
                      const codeContent = String(children).replace(/\n$/, '');
                      const isBlock = match || codeContent.includes('\n');
                      if (isBlock) {
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
                              style={atomDark}
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
                  {selectedModule.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main List View (Minimalist Grid) ──────────────────────────────────────

  return (
    <div className="px-6 max-w-7xl mx-auto pb-0 pt-2 flex flex-col">
      {/* Header + Controls — single row */}
      <div className="flex items-end justify-between mb-6 border-b border-brand-border/40 pb-4 flex-shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">{t('lab.title')}</h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Folder */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-brand-muted text-sm font-medium">
              <Folder size={14} /> {t('articles.folder')}:
            </div>
            <select 
              value={activeFolder} 
              onChange={(e) => setActiveFolder(e.target.value)}
              className="bg-brand-card border border-brand-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-text/20 appearance-none cursor-pointer hover:bg-brand-text/5 transition-colors"
            >
              {folders.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-brand-muted text-sm font-medium">
              <SortAsc size={14} /> {t('articles.sort')}:
            </div>
            <div className="flex bg-brand-card border border-brand-border rounded-lg overflow-hidden">
              <button 
                onClick={() => setSortBy('date')}
                className={cn("px-3 py-1.5 text-xs font-bold uppercase transition-colors", sortBy === 'date' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5')}
              >
                {t('articles.sort.date')}
              </button>
              <button 
                onClick={() => setSortBy('title')}
                className={cn("px-3 py-1.5 text-xs font-bold uppercase transition-colors", sortBy === 'title' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5')}
              >
                {t('articles.sort.title')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <AnimatePresence mode="popLayout">
        {filteredModules.length === 0 ? (
          <div className="py-40 border border-brand-border text-center">
            <div className="text-brand-muted text-[10px] font-bold tracking-[0.5em] uppercase">        {t('articles.empty')}</div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-brand-border">
            {paginatedModules.map((module, index) => {
              let miniPreview = null;
              if (module.id === 'decision-boundary') {
                miniPreview = <MiniDecisionBoundary />;
              } else if (module.id === 'nn-visualizer') {
                miniPreview = <MiniNNVisualizer />;
              } else if (module.id === 'dim-reduction') {
                miniPreview = <MiniDimReduction />;
              } else if (module.id === 'reinforcement-learning') {
                miniPreview = <MiniRLLab />;
              } else if (module.id === 'gradient-descent') {
                miniPreview = <MiniGradientDescent />;
              } else if (module.id === 'kmeans-clustering') {
                miniPreview = <MiniKMeans />;
              } else if (module.id === 'self-attention') {
                miniPreview = <MiniSelfAttention />;
              } else if (module.id === 'rag-explorer') {
                miniPreview = <MiniRAGExplorer />;
              } else if (module.id === 'react-agent') {
                miniPreview = <MiniReActAgent />;
              } else {
                miniPreview = <MiniCodePreview snippet={module.snippet} />;
              }

              return (
                <motion.div
                  key={module.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedModule(module)}
                  className={cn(
                    'group relative cursor-pointer border-r border-b border-brand-border bg-brand-bg flex flex-col h-full min-h-[300px] lg:min-h-[380px]',
                    'hover:bg-brand-text/[0.02] transition-colors duration-500'
                  )}
                >
                  <div className="relative overflow-hidden flex-shrink-0 h-[140px] lg:h-[180px] border-b border-brand-border/20">
                    {miniPreview}
                    <div className="absolute top-4 right-4 text-white/0 group-hover:text-white/40 transition-colors duration-500">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  
                  <div className="p-4 lg:p-6 flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[9px] font-bold tracking-widest uppercase text-brand-muted">{module.folder}</span>
                       <span className="text-[9px] font-bold tracking-widest uppercase text-brand-muted/60">{module.date}</span>
                    </div>
                    
                    <h2 className="text-lg lg:text-xl font-black tracking-tight leading-[0.95] uppercase mb-2 transition-transform group-hover:translate-x-1 duration-500">
                      {module.title}
                    </h2>
                    
                    <p className="text-brand-text/70 text-xs leading-relaxed font-normal line-clamp-2 md:line-clamp-1 lg:line-clamp-2 mb-3 lg:mb-4 group-hover:text-brand-text transition-colors">
                      {module.description}
                    </p>
                    
                    <div className="mt-auto pt-3 border-t border-brand-border/30 flex flex-wrap gap-2">
                       {module.tags.slice(0, 2).map(tag => (
                         <span key={tag} className="text-[8px] font-bold tracking-widest uppercase text-brand-muted/90 border border-brand-border/80 px-1.5 py-0.5">
                            {tag}
                         </span>
                       ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && !selectedModule && (
        <div className="flex items-center justify-between mt-0 border-t border-brand-border/40 pt-4">
          <div className="text-[10px] text-brand-muted/60 font-bold uppercase tracking-widest">
            {t('lab.pagination.page')} {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-brand-border rounded text-[10px] font-bold uppercase transition-colors hover:bg-brand-text/5 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              {t('lab.pagination.prev')}
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center border rounded text-[10px] font-bold transition-colors",
                    currentPage === i + 1 ? "border-brand-text bg-brand-text text-brand-bg" : "border-brand-border text-brand-muted hover:bg-brand-text/5"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-brand-border rounded text-[10px] font-bold uppercase transition-colors hover:bg-brand-text/5 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              {t('lab.pagination.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
