import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, ChevronRight, MousePointer2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, useColorMode, useColorModeValue } from '@chakra-ui/react';

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
  '#8B5CF6'  // purple
];

export default function KMeansLab() {
  const { t, lang } = useApp();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const [points, setPoints] = useState<Point[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [k, setK] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBg = useColorModeValue('rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.3)');

  // --- Initialize ---
  const init = (newK: number = k) => {
    setIsPlaying(false);
    setIteration(0);
    setPoints([]);
    
    setTimeout(() => {
      const newPoints: Point[] = [];
      const clusters = Array.from({ length: 3 }).map(() => ({
        x: Math.random() * 500 + 50,
        y: Math.random() * 300 + 50
      }));

      for (let i = 0; i < 45; i++) {
        const c = clusters[Math.floor(Math.random() * clusters.length)];
        newPoints.push({
          x: c.x + (Math.random() - 0.5) * 110,
          y: c.y + (Math.random() - 0.5) * 110,
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

    // 1. Draw Voronoi-ish Background
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
          
          ctx.fillStyle = `${centroids[cluster]?.color}${isDark ? '10' : '15'}`; 
          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }
    }

    // 2. Draw Connection Lines
    ctx.lineWidth = 1;
    points.forEach(p => {
      if (p.cluster !== -1 && centroids[p.cluster]) {
        ctx.beginPath();
        ctx.strokeStyle = `${centroids[p.cluster].color}${isDark ? '28' : '35'}`;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(centroids[p.cluster].x, centroids[p.cluster].y);
        ctx.stroke();
      }
    });

    // 3. Draw Points
    const unclusteredColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.cluster === -1 ? unclusteredColor : (centroids[p.cluster]?.color || unclusteredColor);
      ctx.fill();
    });

    // 4. Draw Centroids
    centroids.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = c.color;
      ctx.fill();
      
      ctx.strokeStyle = isDark ? '#ffffff' : '#202023';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = isDark ? '#ffffff' : '#202023';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`K${i+1}`, c.x, c.y + 22);
    });

  }, [points, centroids, isDark]);

  return (
    <div className="h-full flex flex-col p-6 sm:p-8 bg-transparent">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-brand-text mb-0.5">
            {t('lab.kmeans.unsupervised')}
          </h3>
          <p className="text-xs text-brand-muted">
            {lang === 'zh' ? `迭代轮次: ${iteration}` : `K-Means Iteration: ${iteration}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-brand-muted hidden sm:inline">
            {t('lab.kmeans.points')}: <strong className="text-brand-text">{points.length}</strong>
          </span>
          <Button 
            size="sm"
            colorScheme="teal"
            variant={isPlaying ? 'solid' : 'outline'}
            borderRadius="lg"
            fontSize="xs"
            leftIcon={isPlaying ? <Pause size={14} /> : <Play size={14} />}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying 
              ? (lang === 'zh' ? '暂停' : 'Pause') 
              : (lang === 'zh' ? '自动聚类' : 'Auto Cluster')}
          </Button>
          <Button 
            size="sm"
            variant="outline"
            borderRadius="lg"
            fontSize="xs"
            onClick={() => init()}
            title="Randomize Points"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row gap-6 relative overflow-hidden">
        {/* Canvas Area */}
        <div 
          className="flex-grow relative rounded-xl border overflow-hidden min-h-[340px]"
          style={{ backgroundColor: canvasBg, borderColor: 'var(--border)' }}
        >
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
          <div className="absolute bottom-3 left-3 text-[11px] text-brand-muted font-medium bg-brand-card/60 backdrop-blur px-2.5 py-1 rounded flex items-center gap-1.5">
            <MousePointer2 size={12} /> {lang === 'zh' ? '点击画布可直接新增样本点' : 'Click to seed data points'}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-56 shrink-0 space-y-6">
          {/* Cluster Count */}
          <div>
            <div className="mb-3 text-xs font-semibold text-brand-text">
              {t('lab.kmeans.numClusters')} (K)
            </div>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map(val => (
                <Button
                  key={val}
                  size="sm"
                  flexGrow={1}
                  variant={k === val ? 'solid' : 'outline'}
                  colorScheme="teal"
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight={k === val ? 'bold' : 'normal'}
                  onClick={() => { setK(val); init(val); }}
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
            <Button 
              size="sm"
              w="full"
              variant="outline"
              borderRadius="lg"
              fontSize="xs"
              leftIcon={<ChevronRight size={14} />}
              onClick={step}
              isDisabled={isPlaying || points.length === 0}
            >
              {lang === 'zh' ? '单步迭代 (Step)' : 'Step Algorithm'}
            </Button>
            
            <Button 
              size="sm"
              w="full"
              variant="ghost"
              borderRadius="lg"
              fontSize="xs"
              onClick={clear}
            >
              {lang === 'zh' ? '清空样本点' : 'Clear Canvas'}
            </Button>

            <p className="text-[11px] text-brand-muted leading-relaxed pt-1">
              {t('lab.kmeans.convergeHint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
