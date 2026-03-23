import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NNVisualizerLab() {
  const { t } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState(0);

  const layers = [
    { id: 'input', nodes: 3, label: 'Input' },
    { id: 'hidden1', nodes: 5, label: 'Hidden 1 (ReLU)' },
    { id: 'hidden2', nodes: 4, label: 'Hidden 2 (ReLU)' },
    { id: 'output', nodes: 2, label: 'Output (Softmax)' }
  ];

  // Auto-pulse
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep(s => s + 1);
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col p-8 rounded-3xl bg-black/40">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold tracking-tighter">Feedforward Network</h3>
        <div className="flex gap-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-brand-text/10 border border-brand-border text-brand-text rounded-full hover:bg-brand-text/20 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>

      <div className="flex-grow flex justify-between items-center relative px-10">
        
        {/* Draw Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {layers.map((layer, lIdx) => {
            if (lIdx === layers.length - 1) return null;
            const nextLayer = layers[lIdx + 1];
            
            // X positions are distributed equally (0%, 33%, 66%, 100%)
            const startX = `${25 + (lIdx * (50 / (layers.length - 1)))}%`;
            const endX = `${25 + ((lIdx + 1) * (50 / (layers.length - 1)))}%`;

            return Array.from({ length: layer.nodes }).map((_, i) => (
              Array.from({ length: nextLayer.nodes }).map((_, j) => {
                const startY = `${10 + ((i + 1) * 80) / (layer.nodes + 1)}%`;
                const endY = `${10 + ((j + 1) * 80) / (nextLayer.nodes + 1)}%`;
                
                const isPulsing = (step % layers.length === lIdx + 1);

                return (
                  <g key={`L${lIdx}-N${i}-N${j}`}>
                    <line
                      x1={`calc(${startX} + 20px)`} y1={startY}
                      x2={`calc(${endX} - 20px)`} y2={endY}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1.5"
                    />
                    {isPulsing && (
                      <circle r="3" fill="#fff" className="opacity-80">
                        <animateMotion
                          dur="0.8s"
                          path={`M 0,0 L ${Number(endX.replace('%','')) - Number(startX.replace('%',''))}vw, ${Number(endY.replace('%','')) - Number(startY.replace('%',''))}vh`}
                          fill="freeze"
                        />
                        <animate attributeName="opacity" values="0;1;0" dur="0.8s" />
                      </circle>
                    )}
                  </g>
                );
              })
            ));
          })}
        </svg>

        {/* Nodes */}
        {layers.map((layer, lIdx) => (
          <div key={layer.id} className="flex flex-col justify-center gap-6 h-full z-10 w-12 items-center">
            {Array.from({ length: layer.nodes }).map((_, i) => {
              const isActive = (step % layers.length === lIdx);
              // Calculate activation intensity based on step and math random
              const intensity = isActive ? Math.random() * 0.5 + 0.5 : 0.1;

              return (
                <div key={i} className="relative">
                  <div 
                    className="w-10 h-10 rounded-full border border-white/20 bg-brand-bg relative z-10 transition-all duration-300"
                    style={{ 
                      boxShadow: isActive ? `0 0 20px rgba(255,255,255,${intensity})` : 'none',
                      backgroundColor: isActive ? `rgba(255,255,255,${intensity * 0.2})` : 'var(--bg)'
                    }}
                  />
                  {isActive && (
                    <motion.div 
                      layoutId="pulse"
                      className="absolute inset-0 rounded-full border-2 border-brand-text/50 z-0"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </div>
              );
            })}
            <div className="absolute top-[90%] w-32 text-center text-[10px] font-bold tracking-widest uppercase text-brand-muted mt-4">
              {layer.label}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
