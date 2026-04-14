import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue, AnimatePresence, animate } from 'motion/react';
import { ArrowRight, Hand } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllProjects, ProjectData } from '../lib/projects';

// ─── Constants ──────────────────────────────────────────────────────────────
const MONTH_ABBREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Pac-Man ──────────────────────────────────────────────────────────────────
const PacManPhantom = () => (
  <motion.svg width="40" height="40" viewBox="0 0 40 40" className="text-brand-text overflow-visible block">
    <motion.path
      animate={{ d: [
        "M20,20 L38,9 A20,20 0 1,0 38,31 Z",
        "M20,20 L38,20 A20,20 0 1,0 38,20 Z",
        "M20,20 L38,9 A20,20 0 1,0 38,31 Z",
      ]}}
      transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
      fill="currentColor"
    />
    <circle cx="20" cy="11" r="3" fill="var(--brand-bg, #FAF8F5)" />
  </motion.svg>
);

const LoopingPacMan = ({ springX }: { springX: MotionValue<number> }) => {
  const CYCLE = 500;
  const opacity = useTransform(springX, (v) => {
    const progress = (-v % CYCLE) / CYCLE;
    if (progress < 0.5) return 0.9;
    return 0.9 * (1 - (progress - 0.5) / 0.5);
  });
  return (
    <motion.div
      className="absolute pointer-events-none z-20"
      style={{ left: '50%', top: '50%', translateX: '-50%', translateY: '-50%', opacity }}
    >
      <PacManPhantom />
    </motion.div>

  );
};

// ─── Hover Card ───────────────────────────────────────────────────────────────
const HoverCard = ({ project }: { project: ProjectData }) => {
  const color = project.color || '#333333';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-[calc(100%+24px)] left-1/2 -translate-x-1/2 w-52 pointer-events-none z-50 text-brand-text"
    >
      <div className="rounded-2xl border border-brand-border bg-brand-card/95 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="h-0.5 w-full" style={{ backgroundColor: color }} />
        <div className="p-4 space-y-2">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
            style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}50` }}>
            {project.category}
          </span>
          <h3 className="text-sm font-bold leading-tight line-clamp-2">{project.title}</h3>
          {project.tech.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {project.tech.slice(0, 3).map(t => (
                <span key={t} className="text-[8px] text-brand-muted font-mono bg-brand-text/5 px-1.5 py-0.5 rounded">{t}</span>
              ))}
              {project.tech.length > 3 && <span className="text-[8px] text-brand-muted font-mono">+{project.tech.length - 3}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2.5 h-2.5 bg-brand-card/95 border-r border-b border-brand-border rotate-45" />
    </motion.div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const { t } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectData[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const x = useMotionValue(0);

  useEffect(() => { getAllProjects().then(data => setProjectsData(data)); }, []);

  const projectsWithPos = useMemo(() => {
    const sorted = [...projectsData].sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) return [];
    const [latestYear, latestMonth] = sorted[0].date.split('-').map(Number);
    const maxYear = latestYear;
    const offset = (12 - latestMonth) * 100 + 100;
    return sorted.map(p => {
      const [year, month] = p.date.split('-').map(Number);
      const xAbs = (maxYear - year) * 1200 + (12 - month) * 100 + 200;
      return { ...p, x: xAbs - offset };
    });
  }, [projectsData]);

  // Deep linking: scroll to ?id= on load
  useEffect(() => {
    if (projectsWithPos.length === 0) return;
    const id = searchParams.get('id');
    if (!id) return;
    const project = projectsWithPos.find(p => p.id === id);
    if (project) {
      animate(x, -project.x + window.innerWidth / 2, { type: "spring", stiffness: 100, damping: 20 });
    }
  }, [projectsWithPos, searchParams, x]);

  const categories = useMemo(() => {
    const cats = projectsData.map(p => p.category || 'OTHER').filter(Boolean);
    return ['ALL', ...Array.from(new Set(cats))];
  }, [projectsData]);

  const years = useMemo(() => {
    const y = projectsData.map(p => parseInt(p.date.split('-')[0]));
    return [...new Set(y)].sort((a, b) => b - a);
  }, [projectsData]);

  const maxYear = years[0] ?? new Date().getFullYear();
  const minYear = years[years.length - 1] ?? maxYear;

  const maxScrollLeft = useMemo(() => {
    if (projectsWithPos.length === 0) return 0;
    const maxX = Math.max(...projectsWithPos.map(p => p.x));
    return -(maxX + 600);
  }, [projectsWithPos]);

  const canvasWidth = useMemo(() => Math.max(2000, -maxScrollLeft + 1000), [maxScrollLeft]);

  const rulerMarks = useMemo(() => {
    if (projectsData.length === 0) return [];
    const sorted = [...projectsData].sort((a, b) => b.date.localeCompare(a.date));
    const [latestYear, latestMonth] = sorted[0].date.split('-').map(Number);
    const offset = (12 - latestMonth) * 100 + 100;
    const marks: { x: number; label: string; isMajor: boolean }[] = [];
    for (let year = maxYear; year >= minYear; year--) {
      const yearIdx = maxYear - year;
      for (let m = 12; m >= 1; m--) {
        const xPos = (yearIdx * 1200 + (12 - m) * 100 + 200) - offset;
        marks.push({ x: xPos, label: m === 1 ? String(year) : MONTH_ABBREV[m - 1], isMajor: m === 1 });
      }
    }
    return marks;
  }, [maxYear, minYear, projectsData]);

  const connections = projectsWithPos.slice(0, -1).map((p, i) => ({ from: p, to: projectsWithPos[i + 1] }));

  const handleWheel = useCallback((e: WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const currentX = x.get();
    const nextX = Math.min(0, Math.max(maxScrollLeft, currentX - delta));
    animate(x, nextX, { type: "spring", stiffness: 300, damping: 30, mass: 0.5 });
  }, [x, maxScrollLeft]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); handleWheel(e); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [handleWheel]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-brand-bg">
      <div className="px-6 max-w-7xl mx-auto w-full pt-[104px] pb-5 shrink-0 border-b border-brand-border/40 flex items-end justify-between">
        <div className="space-y-1">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black tracking-tighter uppercase leading-none">
            {t('portfolio.title')}
          </motion.h1>
        </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3 justify-end">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full transition-all duration-300 border ${activeCategory === cat ? 'bg-brand-text text-brand-bg border-transparent shadow-md font-bold' : 'bg-transparent border-brand-border text-brand-muted hover:border-brand-text/40 hover:text-brand-text font-medium'}`}
              >
                <span className="text-[11px] sm:text-xs tracking-wider uppercase">
                  {cat}
                </span>
              </button>
            ))}
          </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        <LoopingPacMan springX={x} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:36px_36px] text-brand-text" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-brand-text/10 -translate-y-1/2 pointer-events-none" />

        <motion.div
          style={{ x, width: canvasWidth }}
          className="absolute inset-0 flex items-center"
          drag="x"
          dragConstraints={{ left: maxScrollLeft, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        >
          {rulerMarks.map((mark, i) => (
            <div key={i} className="absolute top-1/2 flex flex-col items-center" style={{ left: mark.x }}>
              <div className={`w-px ${mark.isMajor ? 'h-6 bg-brand-text' : 'h-3 bg-brand-text/60'}`} />
              <span className={`mt-4 text-[9px] font-mono font-bold uppercase tracking-widest ${mark.isMajor ? 'text-brand-text' : 'text-brand-text/70'}`}>
                {mark.label}
              </span>
            </div>
          ))}

          {connections.map((conn, i) => (
            <motion.line key={i} x1={conn.from.x} y1="50%" x2={conn.to.x} y2="50%"
              stroke="currentColor" strokeWidth="0.5" className="text-brand-text/5" />
          ))}

          {projectsWithPos.map((project) => {
            const isMatch = activeCategory === 'ALL' || project.category === activeCategory;
            return (
            <div key={project.id} className="absolute top-1/2 -translate-y-1/2 transition-opacity duration-500" style={{ left: project.x, opacity: isMatch ? 1 : 0.15 }}>
              <div className="relative flex flex-col items-center">
                <AnimatePresence>
                  {hoveredId === project.id && <HoverCard project={project} />}
                </AnimatePresence>

                <div className="absolute bottom-10 whitespace-nowrap text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text/90 transition-colors">
                    {project.title}
                  </span>
                </div>

                <motion.button
                  onMouseEnter={() => !isDragging && setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => !isDragging && navigate(project.customRoute || `/portfolio/${project.id}`)}
                  className="group relative"
                >
                  <motion.div
                    animate={{
                      scale: hoveredId === project.id ? 1.4 : 1,
                      backgroundColor: hoveredId === project.id ? project.color : 'transparent',
                    }}
                    className="w-4 h-4 rounded-full border border-brand-text/40 flex items-center justify-center transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-brand-text/80 rounded-full group-hover:bg-brand-bg transition-colors" />
                  </motion.div>
                </motion.button>
              </div>
            </div>
          )})}
        </motion.div>

        <div className="absolute bottom-8 right-8 z-10 pointer-events-none">
          <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-3 text-brand-muted text-xs font-bold uppercase tracking-widest bg-brand-card/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-brand-border/60">
            <Hand size={13} />
            <span>{t('portfolio.explore')}</span>
            <ArrowRight size={13} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
