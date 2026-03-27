import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RefreshCw, ChevronRight, MousePointer2, Plus } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  cluster: number;
}

interface Centroid {
  x: number;
  y: number;
  color: string;
}

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // emerald
  '#F59E0B', // amber
  '#6366F1'  // indigo
];

export default function KMeansLab() {
  const [points, setPoints] = useState<Point[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [k, setK] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Initialize ---
  const init = (newK: number = k) => {
    setIsPlaying(false);
    setIteration(0);
    
    // Explicitly set to empty first before populating
    setPoints([]);
    
    setTimeout(() => {
      const newPoints: Point[] = [];
      const clusters = Array.from({ length: 3 }).map(() => ({
        x: Math.random() * 500 + 50,
        y: Math.random() * 300 + 50
      }));

      for (let i = 0; i < 40; i++) {
        const c = clusters[Math.floor(Math.random() * clusters.length)];
        newPoints.push({
          x: c.x + (Math.random() - 0.5) * 100,
          y: c.y + (Math.random() - 0.5) * 100,
          cluster: -1
        });
      }

      const newCentroids = Array.from({ length: newK }).map((_, i) => ({
        x: Math.random() * 600,
        y: Math.random() * 400,
        color: COLORS[i % COLORS.length]
      }));

      setPoints(newPoints);
      setCentroids(newCentroids);
    }, 0);
  };

  const clear = () => {
    setIsPlaying(false);
    setIteration(0);
    setPoints([]);
    setCentroids(Array.from({ length: k }).map((_, i) => ({
      x: Math.random() * 600,
      y: Math.random() * 400,
      color: COLORS[i % COLORS.length]
    })));
  };

  useEffect(() => {
    init();
  }, []);

  // --- Step Logic ---
  const step = () => {
    if (points.length === 0) return;
    
    // 1. Assign points to nearest centroid
    let changed = false;
    const newPoints = points.map(p => {
      let minDist = Infinity;
      let cluster = -1;
      centroids.forEach((c, idx) => {
        const d = (p.x - c.x)**2 + (p.y - c.y)**2;
        if (d < minDist) {
          minDist = d;
          cluster = idx;
        }
      });
      if (p.cluster !== cluster) changed = true;
      return { ...p, cluster };
    });

    // 2. Update centroids
    const newCentroids = centroids.map((c, idx) => {
      const clusterPoints = newPoints.filter(p => p.cluster === idx);
      if (clusterPoints.length === 0) return c;
      
      const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
      const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
      
      return { ...c, x: avgX, y: avgY };
    });

    setPoints(newPoints);
    setCentroids(newCentroids);
    setIteration(curr => curr + 1);
    
    if (!changed && isPlaying) setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(step, 600);
    return () => clearInterval(interval);
  }, [isPlaying, points, centroids]);

  // --- Drawing ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Voronoi-ish Background (Distance Field)
    if (centroids.length > 0) {
      const gridSize = 12;
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          let minDist = Infinity;
          let cluster = 0;
          
          centroids.forEach((c, idx) => {
            const d = (x - c.x)**2 + (y - c.y)**2;
            if (d < minDist) {
              minDist = d;
              cluster = idx;
            }
          });
          
          ctx.fillStyle = `${centroids[cluster]?.color}08`; 
          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }
    }

    // 2. Draw Connection Lines
    ctx.lineWidth = 0.5;
    points.forEach(p => {
      if (p.cluster !== -1 && centroids[p.cluster]) {
        ctx.beginPath();
        ctx.strokeStyle = `${centroids[p.cluster].color}20`;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(centroids[p.cluster].x, centroids[p.cluster].y);
        ctx.stroke();
      }
    });

    // 3. Draw Points
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.cluster === -1 ? '#fff4' : (centroids[p.cluster]?.color || '#fff');
      ctx.fill();
    });

    // 4. Draw Centroids
    centroids.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = c.color;
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`K${i+1}`, c.x, c.y + 20);
    });

  }, [points, centroids]);

  return (
    <div className="h-full flex flex-col p-8 bg-transparent">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 text-white min-h-[64px]">
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase mb-1">Unsupervised Learning</h3>
          <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">K-Means Iteration: {iteration}</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 flex items-center border-r border-white/10 text-[9px] uppercase tracking-widest text-white/40 font-bold">
            Points: <span className="text-white ml-2">{points.length}</span>
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-6 py-2 bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? 'Pause' : 'Auto Cluster'}
          </button>
          <button 
            onClick={() => init()}
            className="p-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            title="Randomize Points"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-grow flex gap-8 relative overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-grow relative bg-black/20 border border-white/5 overflow-hidden group">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={400} 
            className="w-full h-full object-cover cursor-crosshair"
            onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = (e.clientX - rect.left) * (600 / rect.width);
                const y = (e.clientY - rect.top) * (400 / rect.height);
                setPoints(prev => [...prev, { x, y, cluster: -1 }]);
              }
            }}
          />
          <div className="absolute bottom-4 left-4 text-[9px] text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
            <MousePointer2 size={10} /> Click to seed data points
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-56 shrink-0 space-y-8">
          {/* Cluster Count */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-white/60">
              Number of Clusters (K)
            </div>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => { setK(val); init(val); }}
                  className={`flex-grow py-3 text-[10px] font-bold transition-all border border-white/5 ${
                    k === val ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
             <button 
              onClick={step}
              disabled={isPlaying || points.length === 0}
              className="w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              <ChevronRight size={12} /> Step Algorithm
            </button>
            
            <button 
              onClick={clear}
              className="w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              <div className="w-2 h-2 rounded-full border border-white/40" /> Clear Canvas
            </button>

            <p className="text-[8px] text-white/30 uppercase tracking-widest leading-relaxed pt-2">
              The algorithm converges when centroids stop moving. Use "Clear Canvas" to remove all points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
