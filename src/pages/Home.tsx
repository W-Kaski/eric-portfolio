import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowRight, Brain, Sparkles, Microscope, BookOpen, ChevronDown, Cpu, Zap, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { getAllProjects, ProjectData } from '../lib/projects';
import { getAllArticles, Article } from '../lib/articles';
import { getAllLabs, LabData } from '../lib/mllab';
import { InteractiveParticleCore } from '../components/InteractiveParticleCore';

// --- CosmicCore Sub-component ---
const CosmicCore = ({ icon: Icon, particleCount = 6 }: { icon: any, particleCount?: number }) => {
  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 20 20"
          className="absolute text-brand-text opacity-40"
          style={{
            width: 12 + (i % 3) * 4,
            top: `${20 + Math.sin(i * 1.5) * 35 + 35}%`,
            left: `${20 + Math.cos(i * 1.5) * 35 + 35}%`,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.5 }}
        >
          <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8Z" fill="currentColor" />
        </motion.svg>
      ))}
      <motion.div
        animate={{ rotate: 360, rotateX: 65 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-[240px] h-[240px] md:w-[280px] md:h-[280px] border-[1.5px] border-brand-text/20 rounded-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-text rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)]" />
      </motion.div>
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 w-28 h-28 md:w-32 md:h-32 bg-brand-text rounded-full flex items-center justify-center shadow-2xl shadow-brand-text/10 overflow-hidden">
        <Icon size={40} className="text-brand-bg opacity-90 relative z-10" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
      </motion.div>
      <motion.div animate={{ rotate: -360, rotateY: 45 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute w-40 h-40 md:w-48 md:h-48 border border-brand-text/10 rounded-full" />
    </div>
  );
};

// --- GenerativeProjectVisual Sub-component ---
/**
 * Renders a unique, minimalist geometric SVG pattern based on a seed string.
 */
const GenerativeProjectVisual = ({ seed, active = false, index }: { seed: string, active?: boolean, index?: number }) => {
  const hash = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
    return Math.abs(h);
  }, [seed]);

  const shapeType = index !== undefined ? (index % 3) : (hash % 3); // 0: Circle, 1: Triangle, 2: Square

  const getPolygonPoints = (sides: number, radius: number) => {
    const points = [];
    const offset = sides === 4 ? Math.PI / 4 : (sides === 3 ? -Math.PI / 2 : 0);
    for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides + offset;
        points.push(`${Math.cos(angle) * radius},${Math.sin(angle) * radius}`);
    }
    return points.join(' ');
  };

  const rings = useMemo(() => {
    const r = [];
    const count = 3 + (hash % 3);
    for (let i = 0; i < count; i++) {
       r.push({
         radius: 12 + i * 12 + (hash % 5),
         dash: (hash % 3) === i ? '1, 4' : (hash % 2 === 0 && i === 1) ? '4, 4' : 'none',
         speed: 15 + (hash % 20) + i * 5,
         reverse: (hash + i) % 2 === 0,
         opacity: 0.15 + (i * 0.1)
       });
    }
    return r;
  }, [hash]);

  const nodes = useMemo(() => {
    const n = [];
    const count = 3 + (hash % 5);
    const outerRadius = rings[rings.length - 1].radius;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (hash % 10);
        n.push({
            x: Math.cos(angle) * outerRadius,
            y: Math.sin(angle) * outerRadius,
            size: 1 + (hash % 2),
        });
    }
    return n;
  }, [hash, rings]);

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full text-brand-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0.6 }}
    >
      <defs>
        <pattern id={`grid-${hash}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.1" strokeOpacity="0.1" />
        </pattern>
        <radialGradient id={`glow-${hash}`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <rect width="100" height="100" fill={`url(#grid-${hash})`} />
      <circle cx="50" cy="50" r="40" fill={`url(#glow-${hash})`} />

      <g transform="translate(50, 50)">
         {nodes.map((node, i) => (
            <motion.line 
              key={`line-${i}`}
              x1="0" y1="0" x2={node.x} y2={node.y}
              stroke="currentColor" strokeWidth="0.2" strokeOpacity="0.3"
              animate={active ? { opacity: [0.1, 0.4, 0.1] } : { opacity: 0.1 }}
              transition={{ duration: 3 + (i % 2), repeat: Infinity }}
            />
         ))}
         {rings.map((r, i) => {
            const props = {
              fill: "none", 
              stroke: "currentColor", 
              strokeWidth: "0.3", 
              strokeOpacity: r.opacity,
              strokeDasharray: r.dash !== 'none' ? r.dash : undefined,
              animate: active ? { rotate: r.reverse ? -360 : 360 } : { rotate: 0 },
              transition: { duration: r.speed, repeat: Infinity, ease: "linear" as const }
            };
            if (shapeType === 0) {
              return <motion.circle key={`ring-${i}`} cx="0" cy="0" r={r.radius} {...props} />;
            } else {
              return <motion.polygon key={`ring-${i}`} points={getPolygonPoints(shapeType === 1 ? 3 : 4, r.radius)} {...props} />;
            }
         })}
         {nodes.map((node, i) => (
            <motion.circle 
              key={`node-${i}`}
              cx={node.x} cy={node.y} r={node.size} fill="currentColor" fillOpacity="0.6"
              animate={active ? { scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] } : {}}
              transition={{ duration: 2 + i, repeat: Infinity }}
            />
         ))}
         <motion.circle cx="0" cy="0" r={3} fill="currentColor" fillOpacity="0.9" />
         
         {shapeType === 0 ? (
           <motion.circle 
              cx="0" cy="0" r={6} fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5"
              animate={active ? { scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           />
         ) : (
           <motion.polygon 
              points={getPolygonPoints(shapeType === 1 ? 3 : 4, 6)} fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5"
              animate={active ? { scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           />
         )}
      </g>
    </motion.svg>
  );
};

// --- ProjectStack Sub-component ---
/**
 * A geometric, interactive project stack with 3D layered offsets.
 */
const ProjectStack = ({ projects, hoveredId, onHover }: { projects: ProjectData[], hoveredId: string | null, onHover: (id: string | null) => void }) => {
  const navigate = useNavigate();
  return (
    <div className="relative w-full aspect-square flex items-center justify-center translate-y-[-5%] scale-95 perspective-[1000px]">
      <AnimatePresence>
        {projects.map((project, i) => {
          const isHovered = hoveredId === project.id;
          const index = projects.findIndex(p => p.id === project.id);
          const stackIndex = isHovered ? projects.length : index;
          const zIndex = stackIndex * 10;
          
          return (
            <motion.div
              key={project.id}
              onClick={() => navigate(`/portfolio/${project.id}`)}
              onMouseEnter={() => onHover(project.id)}
              onMouseLeave={() => onHover(null)}
              initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
              animate={{ 
                opacity: hoveredId ? (isHovered ? 1 : 0.3) : (1 - (projects.length - 1 - index) * 0.1),
                scale: isHovered ? 1.05 : 0.95 - (projects.length - 1 - index) * 0.04,
                x: isHovered ? 0 : (index - (projects.length - 1) / 2) * 40,
                y: isHovered ? -30 : (index - (projects.length - 1) / 2) * 40,
                rotateX: isHovered ? 0 : 5,
                rotateY: isHovered ? 0 : -5,
                zIndex
              }}
              transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.8 }}
              className="absolute w-[80%] aspect-[1.1] rounded-sm overflow-hidden border border-brand-text/[0.08] shadow-[20px_20px_60px_rgba(0,0,0,0.15)] bg-brand-card/20 backdrop-blur-3xl group cursor-pointer"
            >
              <div className="absolute inset-0 p-12 transition-all duration-1000 ease-out">
                <GenerativeProjectVisual seed={project.id} active={isHovered} index={i} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent opacity-90" />
              </div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="space-y-4 border-l border-brand-text/10 pl-5">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[7px] font-mono font-bold uppercase tracking-widest text-brand-muted/70 bg-brand-text/5 px-2 py-0.5 border border-brand-text/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-brand-muted/50 uppercase tracking-[0.3em]">Project.v{i+1}</span>
                    <h4 className="text-xl font-bold tracking-tight text-brand-text uppercase leading-none">{project.title}</h4>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border border-white/5 pointer-events-none" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  const { siteConfig } = useConfig();
  const { t } = useApp();
  const [featuredProjects, setFeaturedProjects] = useState<ProjectData[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [featuredLabs, setFeaturedLabs] = useState<LabData[]>([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 25 });
  const layer1X = useTransform(smoothX, [-500, 500], [-10, 10]);
  const layer1Y = useTransform(smoothY, [-500, 500], [-10, 10]);
  const layer2X = useTransform(smoothX, [-500, 500], [-30, 30]);
  const layer2Y = useTransform(smoothY, [-500, 500], [-30, 30]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX - window.innerWidth / 2);
    mouseY.set(e.clientY - window.innerHeight / 2);
  };

const scenes = [
  {
    id: "PERCEPTION",
    title: "Input",
    tag: "01 / CAPTURE",
    pronunciation: "/ ˈɪnpʊt /",
    definition: "Intelligence starts with clean data. It is the ability to see and record the world exactly as it is through digital sensors.",
    details: ["Data Acquisition", "Signal Filtering", "Environment Mapping"],
    icon: Cpu,
    stars: 4
  },
  {
    id: "ABSTRACTION",
    title: "Logic",
    tag: "02 / REASON",
    pronunciation: "/ ˈlɒdʒɪk /",
    definition: "Turning noise into order. We build models that find the rules behind the data, creating a clear map of how things work.",
    details: ["Pattern Sorting", "Neural Mapping", "Model Inference"],
    icon: Brain,
    stars: 8
  },
  {
    id: "AGENCY",
    title: "Action",
    tag: "03 / EXECUTE",
    pronunciation: "/ ˈækʃ(ə)n /",
    definition: "The goal of intelligence. A system that doesn't just react, but learns and acts on its own to solve complex problems.",
    details: ["Self-Learning", "Task Execution", "Autonomous Response"],
    icon: Zap,
    stars: 12
  }
];

  const current = scenes[currentScene];
  const tokens = current.definition.split(' ');

  const nextScene = () => setCurrentScene(prev => (prev < scenes.length - 1 ? prev + 1 : 0));
  const prevScene = () => setCurrentScene(prev => (prev > 0 ? prev - 1 : scenes.length - 1));

  useEffect(() => {
    getAllProjects().then(data => setFeaturedProjects(data.slice(0, 3)));
    getAllArticles().then(data => setLatestArticles(data.slice(0, 3)));
    getAllLabs().then(data => setFeaturedLabs(data.slice(0, 3)));
  }, []);

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide">
      <section 
        onMouseMove={handleMouseMove}
        className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden bg-brand-bg transition-colors duration-1000"
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center px-6 md:px-12 z-10">
          <div className="w-full md:w-1/2 space-y-12 py-12 md:py-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.4em] text-brand-muted uppercase">
                    <div className="w-8 h-px bg-brand-muted/30" />
                    <span>{current.tag}</span>
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-brand-text leading-[0.95] uppercase">
                      {current.title}
                    </h1>
                    <p className="text-sm font-mono text-brand-muted pl-1">
                      {current.pronunciation}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xl md:text-2xl text-brand-text font-medium leading-[1.4] max-w-md min-h-[6em]">
                  {tokens.map((token, idx) => (
                    <motion.span
                      key={`${currentScene}-${idx}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + idx * 0.12, ease: "easeOut" }}
                    >
                      {token}
                    </motion.span>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 pt-8 border-t border-brand-border max-w-xs">
                  {current.details.map((detail, idx) => (
                    <motion.div key={detail} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 + idx * 0.2 }} className="flex items-center gap-4 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-text/20 group-hover:bg-brand-text transition-colors" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted group-hover:text-brand-text transition-colors">{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-8 pt-8 md:pt-12">
              <div className="flex items-center gap-4">
                <button onClick={prevScene} className="p-3 rounded-full border border-brand-border hover:bg-brand-text hover:text-brand-bg transition-all active:scale-95"><ChevronLeft size={18} /></button>
                <button onClick={nextScene} className="p-3 rounded-full border border-brand-border hover:bg-brand-text hover:text-brand-bg transition-all active:scale-95"><ChevronRight size={18} /></button>
              </div>
              <div className="h-4 w-px bg-brand-border/40" />
              
            </div>
          </div>

          <div className="hidden md:flex w-1/2 h-full items-center justify-center relative cursor-crosshair group" onClick={nextScene}>
            <AnimatePresence mode="wait">
              <motion.div key={currentScene} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="relative p-12">
                <motion.div style={{ x: layer1X, y: layer1Y }} className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                   <div className="w-[500px] h-[500px] border border-brand-text rounded-full" />
                </motion.div>
                <motion.div style={{ x: layer2X, y: layer2Y }} className="relative z-10 flex flex-col items-center gap-8 text-center">
                  <CosmicCore icon={current.icon} particleCount={current.stars} />
                  <div className="flex items-center justify-center gap-4">
                    {scenes.map((_, i) => (
                      <div key={i} className={`h-0.5 transition-all duration-700 ${i === currentScene ? 'w-12 bg-brand-text' : 'w-4 bg-brand-border'}`} />
                    ))}
                  </div>
                </motion.div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-full bg-brand-text text-brand-bg px-3 py-1.5 rounded-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">Click · Explore</span>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-brand-text rotate-45" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 origin-left pl-12 pointer-events-none">
          <span className="text-[140px] font-bold text-brand-text/[0.012] tracking-tighter uppercase whitespace-nowrap">{current.id}.MODEO1</span>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-brand-muted opacity-40 flex flex-col items-center gap-2">
          <span className="text-[8px] font-bold tracking-widest uppercase mb-1">Scroll to Explore</span>
          <ChevronDown size={24} />
        </motion.div>
      </section>

      <section className="h-screen w-full snap-start bg-brand-card relative flex items-center px-12 md:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-5xl font-bold tracking-tight uppercase">{t('home.works.title')}</h2>
              <p className="text-brand-muted max-w-md">{t('home.works.desc')}</p>
            </div>
            <div className="space-y-4">
              {featuredProjects.map((project, i) => (
                <Link key={project.id} to={`/portfolio/${project.id}`} onMouseEnter={() => setHoveredProjectId(project.id)} onMouseLeave={() => setHoveredProjectId(null)}>
                  <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="group flex items-center justify-between p-6 rounded-sm border border-brand-border hover:bg-brand-bg transition-all overflow-hidden relative">
                    <div className="flex items-center gap-4 relative z-10">
                      <span className="text-xs font-mono text-brand-muted">0{i + 1}</span>
                      <h3 className="text-xl font-bold transition-all duration-300 group-hover:pl-2 uppercase">{project.title}</h3>
                    </div>
                    <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all h-5 w-5" />
                    <div className="absolute inset-0 bg-brand-text/[0.02] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  </motion.div>
                </Link>
              ))}
            </div>
            <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-muted transition-colors">{t('home.works.all')} <ArrowRight size={16} /></Link>
          </div>

          <div className="hidden md:block relative w-full h-full flex items-center justify-center">
            <ProjectStack projects={featuredProjects} hoveredId={hoveredProjectId} onHover={setHoveredProjectId} />
          </div>
        </div>
      </section>

      {/* Other sections remain unchanged for brevity but properly included in the final file */}
      {/* SECTION 3: ML Lab (Unified Grid Layout) */}
      <section className="h-screen w-full snap-start bg-brand-bg relative flex items-center px-12 md:px-24">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:36px_36px] text-brand-text" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto relative z-10">
          
          {/* Left: Info & MLLab List */}
          <div className="space-y-8 order-2 md:order-1">
            <div className="space-y-2">
              <h2 className="text-5xl font-bold tracking-tight uppercase">{t('home.lab.title')}</h2>
              <p className="text-brand-muted max-w-md">{t('home.lab.desc')}</p>
            </div>
            
            <div className="space-y-4">
              {featuredLabs.map((lab, i) => (
                <Link key={lab.id} to={`/ml-lab?id=${lab.id}`} className="group flex items-center justify-between p-6 rounded-sm border border-brand-border hover:bg-brand-card transition-all overflow-hidden relative">
                  <div className="flex items-center gap-4 relative z-10">
                    <span className="text-xs font-mono text-brand-muted">0{i + 1}</span>
                    <h3 className="text-xl font-bold transition-all duration-300 group-hover:pl-2 uppercase">{lab.title}</h3>
                  </div>
                  <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all h-5 w-5" />
                  <div className="absolute inset-0 bg-brand-text/[0.02] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                </Link>
              ))}
            </div>

            {/* In a real scenario, you can add an 'All Labs' link if needed, or keep it perfectly aligned with 'Explore Work' */}
            <Link to="/ml-lab" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-muted transition-colors">
              Enter Laboratory <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: Interactive Particle Sphere */}
          <div className="hidden md:flex relative w-full h-[60vh] min-h-[400px] flex-col items-center justify-center order-1 md:order-2">
            <InteractiveParticleCore className="w-full h-full scale-[1.1] opacity-90" />
          </div>
          
        </div>
      </section>

      {/* SECTION 4: Articles & Connect (The Registry Finale) */}
      <section className="min-h-screen w-full snap-start bg-brand-bg relative flex items-center overflow-hidden py-24">
        {/* Background Decorative Layer */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-border/40 to-transparent" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:32px_32px] text-brand-text" />


        <div className="max-w-7xl mx-auto w-full px-12 md:px-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative z-10">
          {/* Left: Archive Library (Articles Index) - 60% approx */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-2">
              <h2 className="text-5xl font-bold tracking-tight uppercase">{t('home.articles.title')}</h2>
              <p className="text-brand-muted max-w-md">{t('home.articles.desc')}</p>
            </div>
            
            <div className="space-y-0 border-t border-brand-border/40">
              {latestArticles.length > 0 ? latestArticles.map((article, i) => (
                <Link key={article.id} to={`/articles?id=${article.id}`} className="group block border-b border-brand-border/40 py-6 hover:bg-brand-text/[0.02] transition-colors relative">
                  <div className="flex items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-mono text-brand-muted opacity-40">0{i + 1}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-muted/60">{article.category}</span>
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-tight group-hover:text-brand-text transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="hidden md:inline-block text-[8px] font-mono text-brand-muted/30 opacity-0 group-hover:opacity-100 transition-opacity">
                         ID: ARTICLE_REC_{article.id.substring(0, 4).toUpperCase()}
                       </span>
                       <BookOpen size={18} className="text-brand-muted group-hover:text-brand-text transition-colors" />
                    </div>
                  </div>
                </Link>
              )) : [1, 2, 3].map((_, i) => (
                 <div key={i} className="py-8 border-b border-brand-border/40 animate-pulse">
                    <div className="h-4 w-3/4 bg-brand-border/20 rounded mb-2" />
                    <div className="h-2 w-1/4 bg-brand-border/10 rounded" />
                 </div>
              ))}
            </div>
            
            <Link to="/articles" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-muted hover:text-brand-text transition-colors pt-4">
              {t('home.articles.all')} <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          {/* Right: Connection Node (Contact) - 40% approx */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-brand-card/40 backdrop-blur-3xl border border-brand-border/30 rounded-2xl p-10 md:p-14 shadow-2xl space-y-12 relative overflow-hidden group">
               {/* Decorative corner element */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-brand-text/[0.03] rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />
               
               <div className="space-y-4 relative">
                  <div className="w-8 h-px bg-brand-text/30 mb-6" />
                  <h2 className="text-4xl font-bold tracking-tighter uppercase">{t('home.connect.title')}</h2>
                  <p className="text-brand-muted text-sm leading-relaxed max-w-xs">{t('home.connect.desc')}</p>
               </div>

               <div className="space-y-8 relative">
                  <a href={`mailto:${siteConfig?.email}`} className="group/email block">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-muted/60 mb-2 block">Direct Access</span>
                    <span className="block text-base md:text-xl font-bold hover:text-brand-muted transition-all duration-500 truncate decoration-brand-border underline underline-offset-8">
                       {siteConfig?.email}
                    </span>
                  </a>

                  <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4">
                    {siteConfig?.socials?.github && (
                      <a href={siteConfig.socials.github} className="text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors border-b border-transparent hover:border-brand-text">{t('home.connect.github')}</a>
                    )}
                    {siteConfig?.socials?.linkedin && (
                      <a href={siteConfig.socials.linkedin} className="text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors border-b border-transparent hover:border-brand-text">{t('home.connect.linkedin')}</a>
                    )}
                  </div>
               </div>

               <div className="pt-10 border-t border-brand-border/20 flex items-center justify-start opacity-40">
                  <span className="text-[8px] font-mono uppercase tracking-widest">© {siteConfig?.copyrightYear} {siteConfig?.author}</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
