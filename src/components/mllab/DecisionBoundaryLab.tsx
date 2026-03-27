import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { MousePointer2, RefreshCw } from 'lucide-react';

type Point = { x: number; y: number; cls: 0 | 1 };
type ModelType = 'logistic' | 'svm_rbf' | 'nn';

export default function DecisionBoundaryLab() {
  const { t } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [points, setPoints] = useState<Point[]>([
    { x: 30, y: 30, cls: 0 },
    { x: 40, y: 40, cls: 0 },
    { x: 70, y: 70, cls: 1 },
    { x: 80, y: 60, cls: 1 }
  ]);
  const [activeClass, setActiveClass] = useState<0 | 1>(0);
  const [model, setModel] = useState<ModelType>('logistic');

  // Colors
  const colors = ['#3B82F6', '#EF4444']; // Blue (0), Red (1)
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints(prev => [...prev, { x, y, cls: activeClass }]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Create image data for background prediction
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Simple heuristical math for fast boundaries
    // 1. Logistic: Perpendicular bisector of centroids
    let c0 = {x:0, y:0, count:0};
    let c1 = {x:0, y:0, count:0};
    points.forEach(p => {
      if (p.cls === 0) { c0.x+=p.x; c0.y+=p.y; c0.count++; }
      else { c1.x+=p.x; c1.y+=p.y; c1.count++; }
    });
    if (c0.count>0) { c0.x/=c0.count; c0.y/=c0.count; }
    if (c1.count>0) { c1.x/=c1.count; c1.y/=c1.count; }
    
    // Perpendicular vector
    const wx = c1.x - c0.x;
    const wy = c1.y - c0.y;
    const midX = (c0.x + c1.x)/2;
    const midY = (c0.y + c1.y)/2;
    const bias = -(wx * midX + wy * midY);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = (x / width) * 100;
        const py = (y / height) * 100;
        
        let z = 0;
        
        if (model === 'logistic') {
          // Linear
          if (c0.count > 0 && c1.count > 0) {
            z = wx * px + wy * py + bias;
          } else if (c1.count > 0) z = 1;
          else if (c0.count > 0) z = -1;
        } 
        else if (model === 'svm_rbf') {
          // RBF Kernel sum
          let sum0 = 0, sum1 = 0;
          const gamma = 0.005;
          points.forEach(p => {
            const distSq = (px-p.x)**2 + (py-p.y)**2;
            const w = Math.exp(-distSq * gamma);
            if (p.cls===0) sum0 += w; else sum1 += w;
          });
          z = sum1 - sum0;
        }
        else if (model === 'nn') {
          // Fake Neural Net - a bit of squiggling
          let sum0 = 0, sum1 = 0;
          points.forEach(p => {
            const distSq = (px-p.x)**2 + (py-p.y)**2;
            const activation = Math.max(0, 1 - (distSq / 2000)); // ReLU-like spatial decay
            if (p.cls===0) sum0 += activation; else sum1 += activation;
          });
          z = (sum1 - sum0) * 10;
        }

        // Sigmoid mapping
        const prob = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
        
        const idx = (y * width + x) * 4;
        // Interpolate colors: Blue vs Red
        const r = prob * 239 + (1-prob) * 59;
        const g = prob * 68  + (1-prob) * 130;
        const b = prob * 68  + (1-prob) * 246;
        
        data[idx] = r;
        data[idx+1] = g;
        data[idx+2] = b;
        data[idx+3] = 220; // Alpha
      }
    }
    
    ctx.putImageData(imageData, 0, 0);

  }, [points, model]);

  return (
    <div className="h-full flex flex-col p-6 bg-transparent">
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        
        <div className="flex gap-2 bg-white/5 p-1 border border-white/10">
          {(['logistic', 'svm_rbf', 'nn'] as const).map(m => (
            <button key={m} onClick={() => setModel(m)}
              className={`px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${
                model === m ? 'bg-brand-text text-brand-bg' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}>
              {m === 'logistic' ? 'Logistic' : m === 'svm_rbf' ? 'SVM (RBF)' : 'Neural Net'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[0, 1].map(cls => (
              <button key={cls} onClick={() => setActiveClass(cls as 0|1)}
                className={`w-6 h-6 border transition-transform ${
                  activeClass === cls ? 'scale-110 border-white' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                style={{ backgroundColor: colors[cls] }}
              />
            ))}
          </div>
          <button onClick={() => setPoints([])} className="text-brand-muted hover:text-white transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-grow overflow-hidden border border-white/10 cursor-crosshair bg-black/20">
        <canvas
          ref={canvasRef}
          width={100} 
          height={100}
          onClick={handleCanvasClick}
          className="w-full h-full absolute inset-0 object-cover opacity-85"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Render Points via SVG overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {points.map((p, i) => (
            <rect
              key={i}
              x={p.x - 2}
              y={p.y - 2}
              width={4}
              height={4}
              fill={colors[p.cls]}
              stroke="white"
              strokeWidth={0.5}
            />
          ))}
        </svg>

        {points.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none">
            <MousePointer2 size={24} className="mb-3 opacity-30" />
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-center">Add Data Points</p>
          </div>
        )}
      </div>

    </div>
  );
}
