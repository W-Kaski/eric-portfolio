import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RefreshCw, ChevronRight, Settings2 } from 'lucide-react';

// --- Math Utilities ---
const FUNCTIONS = {
  quadratic: (x: number, y: number) => 0.5 * (x * x + y * y),
  saddle: (x: number, y: number) => 0.4 * (x * x - y * y) + 10,
  rosenbrock: (x: number, y: number) => (1 - x)**2 + 100 * (y - x**2)**2 / 100, // Scaled for vis
  complex: (x: number, y: number) => Math.sin(x) * Math.cos(y) * 5 + 5
};

const GRADIENTS = {
  quadratic: (x: number, y: number) => ({ dx: x, dy: y }),
  saddle: (x: number, y: number) => ({ dx: 0.8 * x, dy: -0.8 * y }),
  rosenbrock: (x: number, y: number) => ({
    dx: -2 * (1 - x) - 400 * x * (y - x**2) / 100,
    dy: 200 * (y - x**2) / 100
  }),
  complex: (x: number, y: number) => ({
    dx: Math.cos(x) * Math.cos(y) * 5,
    dy: -Math.sin(x) * Math.sin(y) * 5
  })
};

type FuncType = keyof typeof FUNCTIONS;

export default function GradientDescentLab() {
  const [funcType, setFuncType] = useState<FuncType>('quadratic');
  const [lr, setLr] = useState(0.1);
  const [momentum, setMomentum] = useState(0);
  const [currentPos, setCurrentPos] = useState({ x: 2, y: 2 });
  const [velocity, setVelocity] = useState({ dx: 0, dy: 0 });
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [isAutoStepping, setIsAutoStepping] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Core Step Logic ---
  const step = () => {
    const grad = GRADIENTS[funcType](currentPos.x, currentPos.y);
    
    const newVelocity = {
      dx: momentum * velocity.dx - lr * grad.dx,
      dy: momentum * velocity.dy - lr * grad.dy
    };

    const newPos = {
      x: currentPos.x + newVelocity.dx,
      y: currentPos.y + newVelocity.dy
    };

    setVelocity(newVelocity);
    setCurrentPos(newPos);
    setPath(prev => [...prev, newPos].slice(-50)); // Keep last 50 points
  };

  useEffect(() => {
    if (!isAutoStepping) return;
    const interval = setInterval(step, 50);
    return () => clearInterval(interval);
  }, [isAutoStepping, currentPos, funcType, lr, momentum]);

  const reset = () => {
    const startX = (Math.random() - 0.5) * 8;
    const startY = (Math.random() - 0.5) * 8;
    setCurrentPos({ x: startX, y: startY });
    setVelocity({ dx: 0, dy: 0 });
    setPath([{ x: startX, y: startY }]);
    setIsAutoStepping(false);
  };

  // --- Drawing Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 40; // Pixels per unit
    const centerX = width / 2;
    const centerY = height / 2;

    const toCanvasX = (x: number) => centerX + x * scale;
    const toCanvasY = (y: number) => centerY - y * scale;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background Heatmap (Subtle)
    const stepSize = 10;
    for (let x = 0; x < width; x += stepSize) {
      for (let y = 0; y < height; y += stepSize) {
        const valX = (x - centerX) / scale;
        const valY = -(y - centerY) / scale;
        const val = FUNCTIONS[funcType](valX, valY);
        
        // Normalize val for visualization (roughly 0 to 20 range)
        const intensity = Math.max(0, Math.min(0.15, 0.15 - (val / 100)));
        ctx.fillStyle = `rgba(216, 208, 196, ${intensity})`;
        ctx.fillRect(x, y, stepSize, stepSize);
      }
    }

    // 2. Draw Grid (Higher contrast)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    for (let x = -10; x <= 10; x++) {
      ctx.moveTo(centerX + x * scale, 0);
      ctx.lineTo(centerX + x * scale, height);
      ctx.moveTo(0, centerY + x * scale);
      ctx.lineTo(width, centerY + x * scale);
    }
    ctx.stroke();

    // 3. Draw Contours (Function Aware)
    ctx.lineWidth = 1;
    const levels = [2, 5, 10, 20, 40, 70];
    levels.forEach(level => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(216, 208, 196, 0.15)`;
      
      // Simple contour tracer for specific functions
      if (funcType === 'quadratic') {
        const r = Math.sqrt(level * 2) * scale;
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      } else if (funcType === 'saddle') {
        // Draw hyperbolas for x^2 - y^2 = c
        for (let sx = -10; sx <= 10; sx += 0.2) {
          const sy = Math.sqrt(Math.max(0, sx * sx - level / 0.4));
          if (sy >= 0) {
            ctx.lineTo(toCanvasX(sx), toCanvasY(sy));
            ctx.moveTo(toCanvasX(sx), toCanvasY(-sy));
            ctx.lineTo(toCanvasX(sx), toCanvasY(-sy));
          }
        }
      } else {
        // Fallback for complex: just markers
        ctx.arc(centerX, centerY, Math.sqrt(level) * scale, 0, Math.PI * 2);
      }
      ctx.stroke();
    });

    // 4. Draw Path (Higher contrast)
    if (path.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(216, 208, 196, 0.6)';
      ctx.lineWidth = 2;
      ctx.moveTo(toCanvasX(path[0].x), toCanvasY(path[0].y));
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(toCanvasX(path[i].x), toCanvasY(path[i].y));
      }
      ctx.stroke();
    }

    // Draw Current Point
    ctx.beginPath();
    ctx.fillStyle = '#D8D0C4';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(216, 208, 196, 0.5)';
    ctx.arc(toCanvasX(currentPos.x), toCanvasY(currentPos.y), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [currentPos, path]);

  return (
    <div className="h-full flex flex-col p-8 bg-transparent">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 text-white min-h-[64px]">
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase mb-1">Foundational Optimization</h3>
          <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Gradient Descent Trajectory</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAutoStepping(!isAutoStepping)}
            className="px-6 py-2 bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            {isAutoStepping ? <Pause size={12} /> : <Play size={12} />}
            {isAutoStepping ? 'Pause' : 'Start Descent'}
          </button>
          <button 
            onClick={reset}
            className="p-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-grow flex gap-8 relative overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-grow relative bg-black/20 border border-white/5 overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={400} 
            className="w-full h-full object-cover"
            onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = (e.clientX - rect.left - rect.width / 2) / 40;
                const y = -(e.clientY - rect.top - rect.height / 2) / 40;
                setCurrentPos({ x, y });
                setPath([{ x, y }]);
                setVelocity({ dx: 0, dy: 0 });
              }
            }}
          />
          <div className="absolute bottom-4 left-4 text-[9px] text-white/20 uppercase tracking-[0.2em]">
            Click anywhere to teleport the point
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-56 shrink-0 space-y-8">
          {/* Function Selector */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-white/60">
              <Settings2 size={12} /> Function
            </div>
            <div className="grid grid-cols-1 gap-1">
              {(Object.keys(FUNCTIONS) as FuncType[]).map(f => (
                <button
                  key={f}
                  onClick={() => { setFuncType(f); reset(); }}
                  className={`text-[9px] uppercase tracking-widest py-2 px-3 text-left transition-all ${
                    funcType === f ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[9px] uppercase tracking-widest">
                <span className="text-white/40">Learning Rate</span>
                <span className="text-white">{lr.toFixed(3)}</span>
              </div>
              <input 
                type="range" min="0.001" max="0.5" step="0.001" value={lr} 
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="w-full accent-white h-1 bg-white/10 appearance-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[9px] uppercase tracking-widest">
                <span className="text-white/40">Momentum</span>
                <span className="text-white">{momentum.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="0.99" step="0.01" value={momentum} 
                onChange={(e) => setMomentum(parseFloat(e.target.value))}
                className="w-full accent-white h-1 bg-white/10 appearance-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button 
              onClick={step}
              disabled={isAutoStepping}
              className="w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              <ChevronRight size={12} /> Manual Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
