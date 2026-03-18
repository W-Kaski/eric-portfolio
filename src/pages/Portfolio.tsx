import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hand } from 'lucide-react';
import { getAllProjects, ProjectData } from '../lib/projects';
import { useApp } from '../context/AppContext';

// Helper to calculate position based on date
const getProjectPos = (dateStr: string, maxYear: number) => {
  const [year, month] = dateStr.split('-').map(Number);
  // Newer (maxYear) gets smaller X, Older gets larger X
  const x = (maxYear - year) * 1200 + (12 - month) * 100 + 200;
  const y = 0;
  return { x, y };
};

export default function Portfolio() {
  const { t } = useApp();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [projectsData, setProjectsData] = useState<ProjectData[]>([]);
  
  const months = useMemo(() => [
    t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun'), 
    t('Jul'), t('Aug'), t('Sep'), t('Oct'), t('Nov'), t('Dec')
  ], [t]);

  // Motion values for smooth horizontal scrolling
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 20 });

  useEffect(() => {
    getAllProjects().then(data => {
      setProjectsData(data);
    });
  }, []);

  const projectsWithPos = useMemo(() => {
    // Sort projects descending (newest first)
    const sorted = [...projectsData].sort((a, b) => b.date.localeCompare(a.date));
    const maxYear = sorted.length > 0 ? parseInt(sorted[0].date.split('-')[0]) : 2026;
    
    return sorted.map((p) => ({
        ...p,
        ...getProjectPos(p.date, maxYear)
      }));
  }, [projectsData]);

  const years = useMemo(() => {
    const y = projectsData.map(p => parseInt(p.date.split('-')[0]));
    return [...new Set(y)].sort((a, b) => b - a);
  }, [projectsData]);

  const connections = projectsWithPos.slice(0, -1).map((p, i) => ({
    from: p,
    to: projectsWithPos[i + 1]
  }));

  // Handle wheel event to convert vertical scroll to horizontal
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      // Prevent default vertical scroll
      e.preventDefault();
      
      const newX = x.get() - e.deltaY - e.deltaX;
      // Limit bounds
      const clampedX = Math.min(0, Math.max(-2500, newX));
      x.set(clampedX);
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', handleWheelNative);
  }, [x]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-brand-bg select-none flex items-center"
    >
      {/* Background Grid & Year Markers */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Draggable Area */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -2500, right: 0 }}
        style={{ x: springX }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
        className="absolute w-[4000px] h-32 flex items-center"
        initial={{ x: 0 }}
      >
        {/* Year Dividers */}
        {years.map((year, i) => (
          <div 
            key={year} 
            className="absolute top-1/2 -translate-y-1/2 h-[60vh] border-l border-brand-border/20 flex flex-col justify-end pb-10 pl-4 pointer-events-none"
            style={{ left: i * 1200 + 100 }}
          >
            <span className="text-9xl font-black text-brand-text/5 tracking-tighter select-none">
              {year}
            </span>
          </div>
        ))}

        {/* SVG Layer for Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {connections.map((conn, i) => (
            <motion.line
              key={i}
              x1={conn.from.x + 12}
              y1={16} // Centered in the h-32 container (32px / 2 = 16px)
              x2={conn.to.x + 12}
              y2={16}
              stroke="currentColor"
              className="text-brand-text/10"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            />
          ))}
        </svg>

        {/* Project Nodes */}
        {projectsWithPos.map((project) => {
          const [year, month] = project.date.split('-');
          return (
            <motion.div
              key={project.id}
              className="absolute group"
              style={{ left: project.x, top: '50%', translateY: '-50%' }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-6">
                {/* Project Point */}
                <button
                  onClick={() => !isDragging && navigate(`/portfolio/${project.id}`)}
                  className="relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 bg-brand-bg border-2 border-brand-text group-hover:bg-brand-text group-hover:scale-125"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-text group-hover:bg-brand-bg transition-colors" />
                  
                  {/* Glow Effect (Subtle) */}
                  <div className="absolute inset-0 rounded-full blur-md bg-brand-text/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Label */}
                <div className="flex flex-col pointer-events-none">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-0.5">
                    {months[parseInt(month) - 1]} {year}
                  </span>
                  <h3 className="text-lg font-medium tracking-tight text-brand-text group-hover:translate-x-1 transition-transform">
                    {project.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Drag Hint */}
      <div className="absolute bottom-12 right-12 flex items-center gap-3 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-3 text-brand-muted text-xs font-bold uppercase tracking-widest bg-brand-card/30 backdrop-blur-xl px-6 py-3 rounded-full border border-brand-border/50"
        >
          <Hand size={14} />
          <span>{t('portfolio.explore')}</span>
          <ArrowRight size={14} />
        </motion.div>
      </div>

      {/* Header Overlay */}
      <div className="absolute top-12 left-12 pointer-events-none">
        <h1 className="text-5xl font-bold tracking-tighter mb-2">{t('portfolio.title')}</h1>
        <p className="text-brand-muted text-sm font-medium">{t('portfolio.desc')}</p>
      </div>
    </div>
  );
}
