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

  // Extract headers for outline
  const headers = useMemo(() => {
    if (!selectedModule) return [];
    const lines = selectedModule.content.split('\n');
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
  }, [selectedModule]);

  // Handle scroll to highlight active header
  useEffect(() => {
    if (!selectedModule) return;
    
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
  }, [selectedModule, headers]);

  const scrollToHeader = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
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
    }

    return (
      <div className="px-6 max-w-7xl mx-auto pb-32">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Sidebar Outline */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-fit z-10">
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
              onClick={() => {
                setSelectedModule(null);
                setSearchParams({}); // Clear query param when going back
              }}
              className="flex items-center gap-2 text-brand-muted hover:text-brand-text mb-12 transition-colors group"
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

            <div className="prose dark:prose-invert max-w-none">
              <div className="text-brand-text/80 leading-[2] text-lg font-light prose-headings:text-brand-text prose-p:text-brand-text/80 prose-strong:text-brand-text prose-ul:text-brand-text/80">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h1 id={id}>{children}</h1>;
                    },
                    h2: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h2 id={id}>{children}</h2>;
                    },
                    h3: ({ children }) => {
                      const id = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      return <h3 id={id}>{children}</h3>;
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
    <div className="px-6 max-w-7xl mx-auto pb-32 pt-2">
      {/* Header + Controls — single row */}
      <div className="flex items-end justify-between mb-12 border-b border-brand-border/40 pb-5">
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
            <div className="text-brand-muted text-[10px] font-bold tracking-[0.5em] uppercase">{t('articles.empty')}</div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-brand-border">
            {filteredModules.map((module, index) => {
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
                    'group relative cursor-pointer border-r border-b border-brand-border bg-brand-bg flex flex-col',
                    'hover:bg-brand-text/[0.02] transition-colors duration-500'
                  )}
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    {miniPreview}
                    <div className="absolute top-4 right-4 text-white/0 group-hover:text-white/40 transition-colors duration-500">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[9px] font-bold tracking-widest uppercase text-brand-muted/60">{module.folder}</span>
                       <span className="text-[9px] font-bold tracking-widest uppercase text-brand-muted/30">{module.date}</span>
                    </div>
                    
                    <h2 className="text-2xl font-black tracking-tight leading-[0.95] uppercase mb-4 transition-transform group-hover:translate-x-1 duration-500">
                      {module.title}
                    </h2>
                    
                    <p className="text-brand-muted text-xs leading-relaxed font-light line-clamp-2 mb-6 opacity-60 group-hover:opacity-100 transition-opacity">
                      {module.description}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-brand-border/30 flex flex-wrap gap-2">
                       {module.tags.slice(0, 2).map(tag => (
                         <span key={tag} className="text-[8px] font-bold tracking-widest uppercase text-brand-muted/50 border border-brand-border/50 px-1.5 py-0.5">
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
    </div>
  );
}
