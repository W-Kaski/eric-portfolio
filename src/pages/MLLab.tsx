import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Cpu,
  Layers,
  Activity,
  Code,
  Box,
  Search,
  ArrowRight,
  Maximize2,
  Terminal,
  SortAsc,
  Folder,
  Calendar,
  ArrowLeft,
  Tag,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { useConfig } from '../context/ConfigContext';

// ─── Full interactive components (shown in detail view) ────────────────────

const RAGArchitecture = () => {
  const { t } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 3000);
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h3 className="text-2xl font-bold mb-2">{t('lab.rag.title')}</h3>
          <p className="text-sm text-brand-muted">{t('lab.rag.subtitle')}</p>
        </div>
        <button
          onClick={triggerAnimation}
          disabled={isAnimating}
          className="px-6 py-3 bg-brand-text text-brand-bg rounded-full text-sm font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-xl"
        >
          {isAnimating ? t('lab.processing') : t('lab.runQuery')}
        </button>
      </div>

      <div className="flex-grow flex items-center justify-around relative">
        {[{ icon: Search, label: t('lab.userQuery') }, { icon: Database, label: t('lab.vectorDb') }, { icon: Cpu, label: t('lab.llmEngine') }].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-4 z-10">
            <div className="w-20 h-20 rounded-3xl bg-brand-card border border-brand-border flex items-center justify-center shadow-2xl">
              <Icon size={32} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">{label}</span>
          </div>
        ))}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="25%" y1="50%" x2="45%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="text-brand-border/30" />
          <line x1="55%" y1="50%" x2="75%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="text-brand-border/30" />
          <AnimatePresence>
            {isAnimating && (
              <motion.circle
                initial={{ cx: '25%', cy: '50%', r: 6, opacity: 0 }}
                animate={{ cx: ['25%', '50%', '50%', '75%', '75%'], opacity: [0, 1, 1, 1, 0], r: [6, 8, 8, 8, 6] }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
                fill="currentColor"
                className="text-brand-text"
              />
            )}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
};

const TrainingChart = () => {
  const { t } = useApp();
  const data = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    epoch: i + 1,
    loss: Math.exp(-i / 8) * 0.8 + Math.random() * 0.03,
    accuracy: 0.5 + (0.45 * (1 - Math.exp(-i / 12))) + Math.random() * 0.01,
  })), []);

  return (
    <div className="h-full flex flex-col p-8">
      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-2">{t('lab.metrics.title')}</h3>
        <p className="text-sm text-brand-muted">{t('lab.metrics.subtitle')}</p>
      </div>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="epoch" hide />
            <YAxis hide domain={[0, 1]} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '12px' }}
              itemStyle={{ fontSize: '12px', color: 'var(--text)' }}
              cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            />
            <Line type="monotone" dataKey="loss" stroke="#444" strokeWidth={3} dot={false} animationDuration={2000} />
            <Line type="monotone" dataKey="accuracy" stroke="#fff" strokeWidth={3} dot={false} animationDuration={2000} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const EmbeddingPoints = () => {
  const points = useMemo(() => Array.from({ length: 200 }, () => ({
    position: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12] as [number, number, number],
    color: Math.random() > 0.85 ? '#fff' : '#333',
  })), []);

  return (
    <>
      {points.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.5} />
        </mesh>
      ))}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <Text position={[0, 0, 0]} fontSize={0.6} color="white" maxWidth={10} textAlign="center"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff">
          LATENT SPACE EXPLORER
        </Text>
      </Float>
    </>
  );
};

const EmbeddingExplorer = () => {
  const { t } = useApp();
  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-black">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h3 className="text-2xl font-bold mb-2">{t('lab.embedding.title')}</h3>
        <p className="text-sm text-brand-muted">{t('lab.embedding.subtitle')}</p>
      </div>
      <div className="flex-grow">
        <Canvas camera={{ position: [0, 0, 10] }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} />
          <EmbeddingPoints />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        </Canvas>
      </div>
      <div className="absolute bottom-8 right-8 z-10">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-mono text-brand-muted tracking-widest">
          <Box size={14} />
          <span>ENGINE_V2_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

const CodeSnippet = ({ snippet }: { snippet?: string }) => {
  const { t } = useApp();
  const code = snippet || `# Default snippet\ndef hello_world():\n    print("Welcome to ML Lab")`;

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <Terminal size={16} className="text-brand-muted" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">{t('lab.code.title')}</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <SyntaxHighlighter language="python" style={atomDark}
          customStyle={{ background: 'transparent', padding: '2rem', margin: 0, fontSize: '13px', lineHeight: '1.8' }}>
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// ─── Bento mini-preview components (shown inside grid cards) ───────────────

/** Compact SVG node-link diagram for RAG */
const MiniRAGPreview = () => {
  const [ping, setPing] = useState(0);

  // Subtle auto-pulse every 3s
  React.useEffect(() => {
    const id = setInterval(() => setPing(p => p + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const nodes = [
    { cx: '20%', label: 'Q' },
    { cx: '50%', label: 'DB' },
    { cx: '80%', label: 'LLM' },
  ];

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet">
        {/* Connector lines */}
        <line x1="75" y1="50" x2="135" y2="50" stroke="white" strokeWidth="0.8" strokeDasharray="6 4" opacity="0.15" />
        <line x1="165" y1="50" x2="225" y2="50" stroke="white" strokeWidth="0.8" strokeDasharray="6 4" opacity="0.15" />

        {/* Animated travel dot */}
        <circle r="4" fill="white" opacity="0.9">
          <animateMotion
            key={ping}
            dur="2s"
            begin="0s"
            fill="freeze"
            path="M60,50 L150,50 L240,50"
          />
          <animate attributeName="opacity" values="0;1;1;0" dur="2s" begin="0s" fill="freeze" />
        </circle>

        {/* Nodes */}
        {[60, 150, 240].map((cx, i) => (
          <g key={cx}>
            <rect x={cx - 24} y={32} width={48} height={36} rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x={cx} y={54} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11" fontWeight="600" fontFamily="monospace">
              {nodes[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

/** Tiny sparkline for training metrics */
const MiniChartPreview = () => {
  const data = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    i,
    loss: Math.exp(-i / 6) * 0.9 + Math.random() * 0.04,
    acc: 0.45 + 0.5 * (1 - Math.exp(-i / 8)) + Math.random() * 0.01,
  })), []);

  return (
    <div className="w-full h-full flex items-end px-2 pb-2 gap-0.5 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 4 }}>
          <Line type="monotone" dataKey="loss" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="acc" stroke="rgba(255,255,255,0.85)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/** CSS scattered dot cloud — zero Three.js cost */
const MiniEmbeddingPreview = () => {
  const dots = useMemo(() => Array.from({ length: 55 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 92 + 4}%`,
    top: `${Math.random() * 84 + 8}%`,
    size: Math.random() > 0.8 ? 3 : Math.random() > 0.5 ? 2 : 1.5,
    opacity: Math.random() > 0.8 ? 0.9 : Math.random() * 0.3 + 0.1,
  })), []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {dots.map(d => (
        <div
          key={d.id}
          className="absolute rounded-full bg-white"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size, opacity: d.opacity }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-white/20 uppercase">Latent Space</span>
      </div>
    </div>
  );
};

/** Truncated code preview */
const MiniCodePreview = ({ snippet }: { snippet?: string }) => {
  const lines = (snippet || '').split('\n').slice(0, 5).join('\n');
  return (
    <div className="w-full h-full overflow-hidden bg-[#0d0d0d] rounded-t-2xl">
      <SyntaxHighlighter
        language="python"
        style={atomDark}
        customStyle={{ background: 'transparent', padding: '1.2rem', margin: 0, fontSize: '10px', lineHeight: '1.7', overflow: 'hidden' }}
      >
        {lines || '# snippet preview'}
      </SyntaxHighlighter>
    </div>
  );
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface LabModule {
  id: string;
  featured: boolean;
  title: string;
  description: string;
  tags: string[];
  category: string;
  folder: string;
  date: string;
  image: string;
  snippet?: string;
  component: React.ReactNode;
  miniPreview: React.ReactNode;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MLLab() {
  const { t } = useApp();
  const { mllabConfig, loading } = useConfig();
  const [selectedModule, setSelectedModule] = useState<LabModule | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>(t('common.all'));
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  const idToTitle = (id: string) => {
    switch (id) {
      case 'rag-arch': return t('lab.rag.title');
      case 'latent-space': return t('lab.embedding.title');
      case 'training-metrics': return t('lab.metrics.title');
      case 'core-logic': return t('lab.code.title');
      default: return id;
    }
  };

  const modules: LabModule[] = useMemo(() => {
    if (!mllabConfig) return [];
    return mllabConfig.modules.map(cfg => {
      let component: React.ReactNode = null;
      let miniPreview: React.ReactNode = null;

      switch (cfg.id) {
        case 'rag-arch':
          component = <RAGArchitecture />;
          miniPreview = <MiniRAGPreview />;
          break;
        case 'latent-space':
          component = <EmbeddingExplorer />;
          miniPreview = <MiniEmbeddingPreview />;
          break;
        case 'training-metrics':
          component = <TrainingChart />;
          miniPreview = <MiniChartPreview />;
          break;
        case 'core-logic':
          component = <CodeSnippet snippet={cfg.snippet} />;
          miniPreview = <MiniCodePreview snippet={cfg.snippet} />;
          break;
      }

      return {
        ...cfg,
        featured: cfg.featured ?? false,
        title: cfg.title || idToTitle(cfg.id),
        description: cfg.description || '',
        tags: cfg.tags || [],
        component,
        miniPreview,
      };
    });
  }, [mllabConfig, t]);

  const folders = useMemo(() => [t('common.all'), ...new Set(modules.map(m => m.folder))], [modules, t]);

  const filteredModules = useMemo(() => {
    return modules
      .filter(m => activeFolder === t('common.all') || m.folder === activeFolder)
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return a.title.localeCompare(b.title);
      });
  }, [modules, activeFolder, sortBy]);

  if (loading || !mllabConfig) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-text/20 border-t-brand-text rounded-full animate-spin" />
      </div>
    );
  }

  // ── Detail View ──────────────────────────────────────────────────────────

  if (selectedModule) {
    return (
      <div className="px-6 max-w-7xl mx-auto pb-32">
        <button
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-3 text-brand-muted hover:text-brand-text mb-16 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">{t('articles.back')}</span>
        </button>

        <header className="mb-16">
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

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-card border border-brand-border rounded-[3rem] overflow-hidden min-h-[700px] shadow-2xl shadow-black/40"
        >
          {selectedModule.component}
        </motion.div>
      </div>
    );
  }

  // ── Bento Grid View ──────────────────────────────────────────────────────

  return (
    <div className="px-6 max-w-7xl mx-auto pb-24">
      {/* Header + Controls — single row */}
      <div className="flex items-center justify-between mb-8 border-b border-brand-border pb-5 pt-2">
        {/* Title — smaller, inline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tighter"
        >
          {t('lab.title')}
        </motion.h1>

        {/* Toolbar — right side */}
        <div className="flex items-center gap-6">
          {/* Folder */}
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

          {/* Sort */}
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
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-[320px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredModules.map((module, index) => {
                const isFeatured = module.featured && filteredModules.filter(m => m.featured).length > 0;
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
                    {/* ── Mini-preview area (top ~55%) ── */}
                    <div className="relative flex-1 overflow-hidden bg-black/40">
                      {module.miniPreview}

                      {/* Gradient overlay at bottom of preview */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-card to-transparent pointer-events-none" />

                      {/* Launch icon on hover */}
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-text/0 group-hover:bg-brand-text/10 border border-white/0 group-hover:border-white/20 flex items-center justify-center transition-all duration-400">
                        <Maximize2 size={12} className="text-white/0 group-hover:text-white/70 transition-colors duration-400" />
                      </div>

                      {/* Featured badge */}
                      {isFeatured && (
                        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-brand-text/10 border border-brand-text/20 backdrop-blur-sm text-[9px] font-bold tracking-[0.2em] uppercase text-brand-text/70">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* ── Card info (bottom ~45%) ── */}
                    <div className="px-6 py-5 flex flex-col gap-3 shrink-0">
                      {/* Tags row */}
                      <div className="flex flex-wrap gap-1.5">
                        {module.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full bg-brand-text/5 text-brand-muted border border-brand-border/60">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h2 className={cn(
                        'font-bold tracking-tighter leading-tight text-brand-text/90 group-hover:translate-x-1 transition-transform duration-400',
                        isFeatured ? 'text-2xl' : 'text-xl'
                      )}>
                        {module.title}
                      </h2>

                      {/* Description — only show on featured or if space */}
                      {(isFeatured || module.description) && (
                        <p className="text-brand-muted text-xs leading-relaxed line-clamp-2 font-light">
                          {module.description}
                        </p>
                      )}

                      {/* Footer meta */}
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
