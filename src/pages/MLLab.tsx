import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, Calendar, ArrowLeft, Tag, Maximize2, SortAsc, ArrowRight,
  MousePointer2, Network, Box, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { getAllLabs, LabData } from '../lib/mllab';

// Interactive Components
import DecisionBoundaryLab from '../components/mllab/DecisionBoundaryLab';
import NNVisualizerLab from '../components/mllab/NNVisualizerLab';
import DimReductionLab from '../components/mllab/DimReductionLab';
import RLLab from '../components/mllab/RLLab';

// ─── Bento mini-preview components ─────────────────────────────────────────

const MiniDecisionBoundary = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-red-500/20" />
    <svg className="w-full h-full absolute inset-0 opacity-50">
      <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="30%" cy="40%" r="4" fill="#3B82F6" />
      <circle cx="40%" cy="30%" r="4" fill="#3B82F6" />
      <circle cx="60%" cy="70%" r="4" fill="#EF4444" />
      <circle cx="70%" cy="60%" r="4" fill="#EF4444" />
    </svg>
    <MousePointer2 size={16} className="text-white/30" />
  </div>
);

const MiniNNVisualizer = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center">
    <Network size={32} className="text-white/20 absolute" />
    <div className="flex gap-4 opacity-50">
      <div className="flex flex-col gap-2"><div className="w-2 h-2 rounded-full bg-white"/><div className="w-2 h-2 rounded-full bg-white"/></div>
      <div className="flex flex-col gap-2"><div className="w-2 h-2 rounded-full bg-brand-text"/><div className="w-2 h-2 rounded-full bg-brand-text"/><div className="w-2 h-2 rounded-full bg-brand-text"/></div>
      <div className="flex flex-col gap-2 justify-center"><div className="w-2 h-2 rounded-full bg-white"/></div>
    </div>
  </div>
);

const MiniDimReduction = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center">
    <div className="absolute inset-0 flex items-center justify-center">
      <Box size={32} className="text-white/10 absolute scale-150" />
      <div className="w-3 h-3 rounded-full bg-blue-500/80 absolute -ml-6 -mt-4 blur-[2px]" />
      <div className="w-3 h-3 rounded-full bg-red-500/80 absolute ml-6 mt-4 blur-[2px]" />
      <div className="w-3 h-3 rounded-full bg-emerald-500/80 absolute ml-4 -mt-6 blur-[2px]" />
    </div>
  </div>
);

const MiniRLLab = () => (
  <div className="w-full h-full relative overflow-hidden bg-black/40 flex items-center justify-center">
    <div className="grid grid-cols-3 gap-1 opacity-40">
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} className={cn("w-4 h-4 rounded-sm", i===8 ? "bg-emerald-500" : i===4 ? "bg-red-500" : "bg-white/10")}>
          {i===0 && <div className="w-full h-full flex items-center justify-center"><Zap size={10} className="text-brand-text" /></div>}
        </div>
      ))}
    </div>
  </div>
);

const MiniCodePreview = ({ snippet }: { snippet?: string }) => {
  const lines = (snippet || '').split('\n').slice(0, 5).join('\n');
  return (
    <div className="w-full h-full overflow-hidden bg-[#0d0d0d] rounded-t-2xl">
      <SyntaxHighlighter language="python" style={atomDark} customStyle={{ background: 'transparent', padding: '1.2rem', margin: 0, fontSize: '10px', lineHeight: '1.7', overflow: 'hidden' }}>
        {lines || '# Select a lab to view'}
      </SyntaxHighlighter>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MLLab() {
  const { t } = useApp();
  const [modules, setModules] = useState<LabData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedModule, setSelectedModule] = useState<LabData | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>(t('common.all'));
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  useEffect(() => {
    getAllLabs().then(data => {
      setModules(data);
      setLoading(false);
    });
  }, []);

  const folders = useMemo(() => [t('common.all'), ...new Set(modules.map(m => m.folder))], [modules, t]);

  const filteredModules = useMemo(() => {
    return modules
      .filter(m => activeFolder === t('common.all') || m.folder === activeFolder)
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return a.title.localeCompare(b.title);
      });
  }, [modules, activeFolder, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
  }

  // ── Detail View ──────────────────────────────────────────────────────────

  if (selectedModule) {
    // Map ID to Interactive Component
    let InteractiveComponent = null;
    switch (selectedModule.id) {
      case 'decision-boundary': InteractiveComponent = <DecisionBoundaryLab />; break;
      case 'nn-visualizer': InteractiveComponent = <NNVisualizerLab />; break;
      case 'dim-reduction': InteractiveComponent = <DimReductionLab />; break;
      case 'reinforcement-learning': InteractiveComponent = <RLLab />; break;
    }

    return (
      <div className="px-6 max-w-4xl mx-auto pb-32">
        <button
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-3 text-brand-muted hover:text-brand-text mb-16 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">{t('articles.back')}</span>
        </button>

        <header className="mb-12">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {selectedModule.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 bg-brand-text/5 text-brand-muted rounded-full border border-brand-border flex items-center gap-1.5">
                <Tag size={9} />{tag}
              </span>
            ))}
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 bg-brand-text/5 text-brand-muted rounded-full border border-brand-border flex items-center gap-1.5">
              <Folder size={9} />{selectedModule.folder}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">{selectedModule.title}</h1>

          {selectedModule.description && (
            <p className="text-brand-muted text-lg max-w-2xl leading-relaxed font-light mb-6">{selectedModule.description}</p>
          )}

          <div className="flex items-center gap-3 text-brand-muted text-xs font-bold tracking-widest uppercase">
            <Calendar size={14} /> {selectedModule.date}
          </div>
        </header>

        {InteractiveComponent && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-brand-border rounded-[3rem] overflow-hidden min-h-[500px] shadow-2xl shadow-black/40 mb-16"
          >
            {InteractiveComponent}
          </motion.div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="markdown-body text-brand-text/85 leading-[1.8] text-lg font-light">
            <ReactMarkdown>{selectedModule.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // ── Bento Grid View ──────────────────────────────────────────────────────

  return (
    <div className="px-6 max-w-7xl mx-auto pb-24">
      {/* Header + Controls */}
      <div className="flex items-center justify-between mb-8 border-b border-brand-border pb-5 pt-2">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold tracking-tighter">
          {t('lab.title')}
        </motion.h1>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-brand-muted text-sm font-medium">
              <Folder size={14} /> {t('articles.folder')}:
            </div>
            <select
              value={activeFolder}
              onChange={e => setActiveFolder(e.target.value)}
              className="bg-brand-card border border-brand-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-text/20 appearance-none cursor-pointer hover:bg-brand-text/5 transition-colors"
            >
              {folders.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-brand-muted text-sm font-medium">
              <SortAsc size={14} /> {t('articles.sort')}:
            </div>
            <div className="flex bg-brand-card border border-brand-border rounded-lg overflow-hidden">
              {(['date', 'title'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold uppercase transition-colors',
                    sortBy === s ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5'
                  )}
                >
                  {s === 'date' ? t('articles.sort.date') : t('articles.sort.title')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <AnimatePresence mode="popLayout">
        {filteredModules.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-brand-border rounded-[3rem]">
            <div className="text-brand-muted text-lg font-light">{t('articles.empty')}</div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-[320px]">
            <AnimatePresence mode="popLayout">
              {filteredModules.map((module, index) => {
                const isFeatured = module.featured && filteredModules.filter(m => m.featured).length > 0;
                
                let miniPreview = null;
                switch(module.id) {
                  case 'decision-boundary': miniPreview = <MiniDecisionBoundary />; break;
                  case 'nn-visualizer': miniPreview = <MiniNNVisualizer />; break;
                  case 'dim-reduction': miniPreview = <MiniDimReduction />; break;
                  case 'reinforcement-learning': miniPreview = <MiniRLLab />; break;
                  default: miniPreview = <MiniCodePreview snippet={module.snippet} />;
                }

                return (
                  <motion.div
                    key={module.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                    onClick={() => setSelectedModule(module)}
                    className={cn(
                      'group relative cursor-pointer rounded-3xl border border-brand-border bg-brand-card overflow-hidden flex flex-col',
                      'hover:border-brand-text/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-black/20',
                      isFeatured ? 'md:col-span-2' : ''
                    )}
                  >
                    <div className="relative flex-1 overflow-hidden bg-black/40">
                      {miniPreview}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-card to-transparent pointer-events-none" />
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-text/0 group-hover:bg-brand-text/10 border border-white/0 group-hover:border-white/20 flex items-center justify-center transition-all duration-400">
                        <Maximize2 size={12} className="text-white/0 group-hover:text-white/70 transition-colors duration-400" />
                      </div>
                      {isFeatured && (
                        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-brand-text/10 border border-brand-text/20 backdrop-blur-sm text-[9px] font-bold tracking-[0.2em] uppercase text-brand-text/70">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-3 shrink-0">
                      <div className="flex flex-wrap gap-1.5">
                        {module.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full bg-brand-text/5 text-brand-muted border border-brand-border/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className={cn('font-bold tracking-tighter leading-tight text-brand-text/90 group-hover:translate-x-1 transition-transform duration-400', isFeatured ? 'text-2xl' : 'text-xl')}>
                        {module.title}
                      </h2>
                      {(isFeatured || module.description) && (
                        <p className="text-brand-muted text-xs leading-relaxed line-clamp-2 font-light">
                          {module.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <div className="flex items-center gap-3 text-[9px] font-bold tracking-[0.15em] uppercase text-brand-muted/50">
                          <span className="flex items-center gap-1"><Folder size={9} />{module.folder}</span>
                          <span className="w-0.5 h-0.5 bg-brand-border rounded-full" />
                          <span className="flex items-center gap-1"><Calendar size={9} />{module.date}</span>
                        </div>
                        <ArrowRight size={14} className="text-brand-muted/30 group-hover:text-brand-muted group-hover:translate-x-1 transition-all duration-400" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
