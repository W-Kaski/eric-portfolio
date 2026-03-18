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
  Filter,
  SortAsc,
  Folder,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text } from '@react-three/drei';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { useConfig } from '../context/ConfigContext';

// --- Components ---

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
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-20 h-20 rounded-3xl bg-brand-card border border-brand-border flex items-center justify-center shadow-2xl">
            <Search size={32} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">{t('lab.userQuery')}</span>
        </div>

        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-20 h-20 rounded-3xl bg-brand-card border border-brand-border flex items-center justify-center shadow-2xl">
            <Database size={32} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">{t('lab.vectorDb')}</span>
        </div>

        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-20 h-20 rounded-3xl bg-brand-card border border-brand-border flex items-center justify-center shadow-2xl">
            <Cpu size={32} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">{t('lab.llmEngine')}</span>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="25%" y1="50%" x2="45%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="text-brand-border/30" />
          <line x1="55%" y1="50%" x2="75%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="text-brand-border/30" />
          
          <AnimatePresence>
            {isAnimating && (
              <motion.circle
                initial={{ cx: '25%', cy: '50%', r: 6, opacity: 0 }}
                animate={{ 
                  cx: ['25%', '50%', '50%', '75%', '75%'],
                  opacity: [0, 1, 1, 1, 0],
                  r: [6, 8, 8, 8, 6]
                }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                fill="currentColor"
                className="text-brand-text shadow-[0_0_20px_rgba(255,255,255,0.5)]"
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
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                border: '1px solid var(--border)', 
                borderRadius: '16px', 
                padding: '12px' 
              }}
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
  const points = useMemo(() => {
    return Array.from({ length: 200 }, () => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      ] as [number, number, number],
      color: Math.random() > 0.85 ? '#fff' : '#333'
    }));
  }, []);

  return (
    <>
      {points.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.5} />
        </mesh>
      ))}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.6}
          color="white"
          maxWidth={10}
          textAlign="center"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        >
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
  const code = snippet || `
# Default snippet
def hello_world():
    print("Welcome to ML Lab")
  `.trim();

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
        <SyntaxHighlighter 
          language="python" 
          style={atomDark}
          customStyle={{ 
            background: 'transparent', 
            padding: '2rem',
            margin: 0,
            fontSize: '13px',
            lineHeight: '1.8'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// --- Main Page ---

interface LabModule {
  id: string;
  title: string;
  category: string;
  folder: string;
  date: string;
  image: string;
  component: React.ReactNode;
}

export default function MLLab() {
  const { t } = useApp();
  const { mllabConfig, loading } = useConfig();
  const [selectedModule, setSelectedModule] = useState<LabModule | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>(t('common.all'));
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  const modules: LabModule[] = useMemo(() => {
    if (!mllabConfig) return [];
    // We map over the config and match the static components
    return mllabConfig.modules.map(cfg => {
      let component: React.ReactNode = null;
      switch (cfg.id) {
        case 'rag-arch': component = <RAGArchitecture />; break;
        case 'latent-space': component = <EmbeddingExplorer />; break;
        case 'training-metrics': component = <TrainingChart />; break;
        case 'core-logic': component = <CodeSnippet snippet={cfg.snippet} />; break;
      }
      return {
        ...cfg,
        title: cfg.id === 'rag-arch' ? t('lab.rag.title') :
               cfg.id === 'latent-space' ? t('lab.embedding.title') :
               cfg.id === 'training-metrics' ? t('lab.metrics.title') :
               t('lab.code.title'),
        component
      };
    });
  }, [mllabConfig, t]);

  const folders = useMemo(() => [t('common.all'), ...new Set(modules.map(m => m.folder))], [modules, t]);

  const filteredAndSortedModules = useMemo(() => {
    return modules
      .filter(m => (activeFolder === t('common.all') || m.folder === activeFolder))
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
          <div className="flex flex-wrap gap-4 mb-10">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase px-4 py-2 bg-brand-text/5 text-brand-muted rounded-full border border-brand-border flex items-center gap-2">
              <Folder size={12} /> {selectedModule.folder}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">{selectedModule.title}</h1>
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

  return (
    <div className="px-6 max-w-7xl mx-auto pb-24">
      <header className="mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tighter mb-4"
        >
          {t('lab.title')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-brand-muted text-base max-w-xl leading-relaxed font-light"
        >
          {t('lab.subtitle')}
        </motion.p>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center justify-between border-y border-brand-border py-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-brand-muted text-sm font-medium">
            <Folder size={16} /> {t('articles.folder')}:
          </div>
          <select 
            value={activeFolder} 
            onChange={(e) => setActiveFolder(e.target.value)}
            className="bg-brand-card border border-brand-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-text/20 appearance-none cursor-pointer hover:bg-brand-text/5 transition-colors"
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
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase transition-colors", 
                sortBy === 'date' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5'
              )}
            >
              {t('articles.sort.date')}
            </button>
            <button 
              onClick={() => setSortBy('title')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase transition-colors", 
                sortBy === 'title' ? 'bg-brand-text text-brand-bg' : 'text-brand-muted hover:bg-brand-text/5'
              )}
            >
              {t('articles.sort.title')}
            </button>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedModules.map((module, index) => (
            <motion.div
              key={module.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
              onClick={() => setSelectedModule(module)}
              className="group cursor-pointer border-b border-brand-border pb-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-4 overflow-hidden rounded-xl border border-brand-border bg-brand-card aspect-[21/9] relative shadow-md group-hover:border-brand-text/20 transition-colors duration-500">
                  <img 
                    src={module.image} 
                    alt={module.title}
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <div className="flex items-center gap-2 text-white font-bold text-[9px] tracking-widest uppercase">
                      Launch <Maximize2 size={10} />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-3 mb-1.5 text-[8px] font-bold tracking-[0.2em] uppercase text-brand-muted/50">
                    <span className="flex items-center gap-1.5"><Folder size={10} /> {module.folder}</span>
                    <span className="w-1 h-1 bg-brand-border rounded-full" />
                    <span className="flex items-center gap-1.5"><Calendar size={10} /> {module.date}</span>
                  </div>
                  <h2 className="text-lg md:text-2xl font-bold mb-2 tracking-tighter leading-tight group-hover:translate-x-1.5 transition-transform duration-500 ease-out text-brand-text/90">
                    {module.title}
                  </h2>
                  <div className="h-px w-4 bg-brand-border group-hover:w-12 transition-all duration-500 ease-out" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredAndSortedModules.length === 0 && (
          <div className="text-center py-32 border border-dashed border-brand-border rounded-[3rem]">
            <div className="text-brand-muted text-lg font-light">{t('articles.empty')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
