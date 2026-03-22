import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, MotionValue } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hand } from 'lucide-react';
import { getAllProjects, ProjectData } from '../lib/projects';
import { useApp } from '../context/AppContext';

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Machine Learning': '#D97757', // warm terracotta
  'UI/UX':            '#A07F5B', // warm amber-brown
  'Dev':              '#6B8F71', // muted sage green
};
const defaultColor = '#8A7E72';
const getColor = (c: string) => CATEGORY_COLORS[c] ?? defaultColor;

const MONTH_ABBREV = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getProjectPos = (dateStr: string, maxYear: number) => {
  const [year, month] = dateStr.split('-').map(Number);
  return { x: (maxYear - year) * 1200 + (12 - month) * 100 + 200 };
};

// ─── Parallax Background ────────────────────────────────────────────────────

interface BlobDef {
  w: string; h: string;
  top: string; left: string;
  blur: number; opacity: number;
  color: string;
  paraValue: MotionValue<number>;
}

const Blob = ({ def }: { def: BlobDef }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: def.w, height: def.h,
      top: def.top, left: def.left,
      filter: `blur(${def.blur}px)`,
      opacity: def.opacity,
      backgroundColor: def.color,
      x: def.paraValue,
      willChange: 'transform',
    }}
  />
);

const ParallaxBackground = ({ springX }: { springX: MotionValue<number> }) => {
  const p04 = useTransform(springX, v => v * 0.04);
  const p09 = useTransform(springX, v => v * 0.09);
  const p16 = useTransform(springX, v => v * 0.16);
  const p22 = useTransform(springX, v => v * 0.22);
  const n06 = useTransform(springX, v => v * -0.06);
  const n13 = useTransform(springX, v => v * -0.13);

  const blobs: BlobDef[] = [
    // Neutral warm blobs — visible on both parchment & espresso backgrounds
    { w:'75vw', h:'55vh', top:'-20%', left:'-25%',  blur:150, opacity:0.30, color:'#C8B89A', paraValue:p04 },
    { w:'55vw', h:'50vh', top:'50%',  left:'60%',   blur:130, opacity:0.22, color:'#B8A88A', paraValue:p09 },
    { w:'38vw', h:'35vh', top:'15%',  left:'45%',   blur:100, opacity:0.15, color:'#D0C0A8', paraValue:n06 },
    // Category tints — warm terracotta, amber, sage
    { w:'42vw', h:'38vh', top:'0%',   left:'20%',   blur:110, opacity:0.20, color:'#D97757', paraValue:p16 },
    { w:'35vw', h:'32vh', top:'55%',  left:'-8%',   blur:90,  opacity:0.16, color:'#A07F5B', paraValue:p22 },
    { w:'30vw', h:'28vh', top:'8%',   left:'68%',   blur:90,  opacity:0.14, color:'#6B8F71', paraValue:n13 },
    { w:'24vw', h:'22vh', top:'70%',  left:'48%',   blur:80,  opacity:0.12, color:'#C4956A', paraValue:p09 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {blobs.map((b, i) => <Blob key={i} def={b} />)}
    </div>
  );
};

// ─── Hover Preview Card ──────────────────────────────────────────────────────

const HoverCard = ({ project }: { project: ProjectData }) => {
  const color = getColor(project.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-52 pointer-events-none z-50"
    >
      <div className="rounded-2xl border border-brand-border bg-brand-card/95 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="h-0.5 w-full" style={{ backgroundColor: color }} />
        <div className="p-4 space-y-2">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
            style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}50` }}>
            {project.category}
          </span>
          <h3 className="text-sm font-bold leading-tight">{project.title}</h3>
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
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectData[]>([]);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 20 });

  useEffect(() => { getAllProjects().then(data => setProjectsData(data)); }, []);

  const projectsWithPos = useMemo(() => {
    const sorted = [...projectsData].sort((a, b) => b.date.localeCompare(a.date));
    const maxYear = sorted.length > 0 ? parseInt(sorted[0].date.split('-')[0]) : new Date().getFullYear();
    return sorted.map(p => ({ ...p, ...getProjectPos(p.date, maxYear) }));
  }, [projectsData]);

  const years = useMemo(() => {
    const y = projectsData.map(p => parseInt(p.date.split('-')[0]));
    return [...new Set(y)].sort((a, b) => b - a);
  }, [projectsData]);

  const maxYear = years[0] ?? new Date().getFullYear();
  const minYear = years[years.length - 1] ?? maxYear;

  const maxScrollLeft = useMemo(() => {
    if (projectsWithPos.length === 0) return -2500;
    return -(Math.max(...projectsWithPos.map(p => p.x)) + 500);
  }, [projectsWithPos]);
  const canvasWidth = useMemo(() => Math.max(4000, -maxScrollLeft + 800), [maxScrollLeft]);

  // Ruler marks — placed along the timeline line
  const rulerMarks = useMemo(() => {
    const marks: { x: number; label: string; isMajor: boolean }[] = [];
    for (let year = maxYear; year >= minYear; year--) {
      const yearIdx = maxYear - year;
      for (let m = 12; m >= 1; m--) {
        const xPos = yearIdx * 1200 + (12 - m) * 100 + 200;
        marks.push({ x: xPos, label: m === 12 ? String(year) : MONTH_ABBREV[m - 1], isMajor: m === 12 });
      }
    }
    return marks;
  }, [maxYear, minYear]);

  const connections = projectsWithPos.slice(0, -1).map((p, i) => ({ from: p, to: projectsWithPos[i + 1] }));

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    x.set(Math.min(0, Math.max(maxScrollLeft, x.get() - e.deltaY - e.deltaX)));
  }, [x, maxScrollLeft]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    // Outer page — same pattern as Articles (px-6 max-w-7xl mx-auto)
    // but the canvas breaks out of it to be full-width
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page header — minimalist style ── */}
      <div className="px-6 max-w-7xl mx-auto w-full pt-24 pb-6 shrink-0 border-b border-brand-border">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tighter"
          >
            {t('portfolio.title')}
          </motion.h1>
          
          {/* Legend or other controls could go here, currently empty for max simplicity */}
          <div className="flex items-center gap-6">
            {Object.entries(CATEGORY_COLORS).map(([cat, col]) => (
              <div key={cat} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col }} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted/70">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Full-width timeline canvas ── */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing bg-brand-bg select-none"
      >
        {/* Parallax artistic background */}
        <ParallaxBackground springX={springX} />

        {/* Very subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:36px_36px] text-brand-text" />


        {/* Drag hint */}
        <div className="absolute bottom-8 right-8 z-10 pointer-events-none">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-3 text-brand-muted text-xs font-bold uppercase tracking-widest bg-brand-card/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-brand-border/60"
          >
            <Hand size={13} />
            <span>{t('portfolio.explore')}</span>
            <ArrowRight size={13} />
          </motion.div>
        </div>

        {/* ── Scrolling canvas ── */}
        <motion.div
          drag="x"
          dragConstraints={{ left: maxScrollLeft, right: 0 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
          className="absolute inset-0"
          style={{ width: canvasWidth, x: springX }}
          initial={{ x: 0 }}
        >
          {/* Year backdrop labels */}
          {years.map((year, i) => (
            <div
              key={year}
              className="absolute flex items-end pointer-events-none"
              style={{ left: i * 1200 + 80, bottom: '10%' }}
            >
              <span className="text-[8rem] font-black text-brand-text/[0.04] tracking-tighter leading-none select-none">
                {year}
              </span>
            </div>
          ))}

          {/* ── Timeline center: baseline @ 50% height ── */}
          <div className="absolute left-0 right-0" style={{ top: '50%' }}>
            
            {/* Horizontal baseline line */}
            <div className="absolute left-0 right-0 h-px bg-brand-border/40" />

            {/* ── Ruler ticks — 12px below the line ── */}
            <div className="absolute left-0 right-0" style={{ top: '12px' }}>
              {rulerMarks.map(mark => (
                <div
                  key={`${mark.x}-${mark.label}`}
                  className="absolute flex flex-col items-start"
                  style={{ left: mark.x, top: 0 }}
                >
                  <div className={mark.isMajor
                    ? 'w-px h-4 bg-brand-text/30'
                    : 'w-px h-2 bg-brand-border/60'}
                  />
                  <span className={mark.isMajor
                    ? 'text-[10px] font-black tracking-[0.12em] uppercase text-brand-muted/70 mt-1 pl-1'
                    : 'text-[8px] font-medium text-brand-muted/35 mt-0.5 pl-0.5'}
                  >
                    {mark.label}
                  </span>
                </div>
              ))}
            </div>

            {/* SVG connections — directly on the line */}
            <svg className="absolute pointer-events-none overflow-visible" style={{ top: 0, left: 0, width: '100%', height: 1 }}>
              {connections.map((conn, i) => (
                <motion.line
                  key={i}
                  x1={conn.from.x + 12} y1={0}
                  x2={conn.to.x + 12}   y2={0}
                  stroke="currentColor"
                  className="text-brand-text/15"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: i * 0.08 }}
                />
              ))}
            </svg>

            {/* NOW marker — centered on line */}
            <div className="absolute flex flex-col items-center" style={{ left: 80, top: -4 }}>
              <div className="w-2 h-2 rounded-full bg-brand-text/50 ring-4 ring-brand-text/10" />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-muted/40 mt-2">Now</span>
            </div>

            {/* Project nodes */}
            {projectsWithPos.map((project, idx) => {
              const [year, month] = project.date.split('-');
              const color = getColor(project.category);
              const isHovered = hoveredId === project.id;
              // Alternate labels: even → above line, odd → below ruler
              const above = idx % 2 === 0;

              return (
                <motion.div
                  key={project.id}
                  className="absolute group"
                  style={{ left: project.x, top: 0 }}
                >
                  <AnimatePresence>
                    {isHovered && <HoverCard project={project} />}
                  </AnimatePresence>

                  {/* Node */}
                  <button
                    onClick={() => !isDragging && navigate(`/portfolio/${project.id}`)}
                    onMouseEnter={() => setHoveredId(project.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="relative w-5 h-5 -translate-y-1/2 -translate-x-1/2 rounded-full flex items-center justify-center transition-all duration-400 bg-brand-bg border-2"
                    style={{
                      borderColor: isHovered ? color : 'rgba(138,126,114,0.3)',
                      boxShadow: isHovered ? `0 0 18px ${color}55, 0 0 5px ${color}33` : 'none',
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{ backgroundColor: isHovered ? color : 'rgba(138,126,114,0.5)' }}
                    />
                  </button>

                  {/* Label — alternates above/below */}
                  <div
                    onClick={() => !isDragging && navigate(`/portfolio/${project.id}`)}
                    onMouseEnter={() => setHoveredId(project.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="absolute flex flex-col cursor-pointer transition-all duration-300"
                    style={{
                      left: 10,
                        ...(above
                          ? { bottom: 24 }
                          : { top: 44 }),
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-bold text-brand-muted/55 uppercase tracking-[0.18em] whitespace-nowrap">
                        {MONTH_ABBREV[parseInt(month) - 1]} {year}
                      </span>
                      {project.featured && (
                        <span className="text-[7px] font-bold px-1 py-0.5 rounded-full"
                          style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>★</span>
                      )}
                    </div>
                    <h3
                      className="text-base font-semibold tracking-tight whitespace-nowrap group-hover:translate-x-1 transition-transform duration-300"
                      style={{ color: isHovered ? color : undefined }}
                    >
                      {project.title}
                    </h3>
                    {/* Category dot */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[8px] font-medium text-brand-muted/40 whitespace-nowrap">{project.category}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
