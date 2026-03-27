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
    <div className="h-full flex flex-col p-8 bg-transparent">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6 text-white">
        <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase">Feedforward Network</h3>
        <div className="flex gap-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-6 py-2 bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em]">
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? 'Stop Engine' : 'Resume Engine'}
          </button>
        </div>
      </div>

      <div className="flex-grow relative mt-4">
        
        {/* Draw Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {layers.map((layer, lIdx) => {
            if (lIdx === layers.length - 1) return null;
            const nextLayer = layers[lIdx + 1];
            
            // X positions: 15% to 85%
            const startX = `${15 + (lIdx * (70 / (layers.length - 1)))}%`;
            const endX = `${15 + ((lIdx + 1) * (70 / (layers.length - 1)))}%`;

            return Array.from({ length: layer.nodes }).map((_, i) => (
              Array.from({ length: nextLayer.nodes }).map((_, j) => {
                const startY = `${(i + 1) * (100 / (layer.nodes + 1))}%`;
                const endY = `${(j + 1) * (100 / (nextLayer.nodes + 1))}%`;
                
                const isPulsing = (step % layers.length === lIdx + 1);

                return (
                  <g key={`L${lIdx}-N${i}-N${j}`}>
                    <line
                      x1={`calc(${startX} + 24px)`} y1={startY}
                      x2={`calc(${endX} - 24px)`} y2={endY}
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1"
                    />
                    {isPulsing && (
                      <motion.circle
                        r="2"
                        fill="rgba(216,208,196,0.6)"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          cx: [startX, endX],
                          cy: [startY, endY],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{ transform: 'translateX(24px)' }} // Approx offset
                      />
                    )}
                  </g>
                );
              })
            ));
          })}
        </svg>

        {/* Nodes Grid */}
        <div className="absolute inset-0">
          {layers.map((layer, lIdx) => {
            const posX = `${15 + (lIdx * (70 / (layers.length - 1)))}%`;
            return (
              <div 
                key={layer.id} 
                className="absolute top-0 bottom-0 w-12 -translate-x-1/2"
                style={{ left: posX }}
              >
                {Array.from({ length: layer.nodes }).map((_, i) => {
                  const posY = `${(i + 1) * (100 / (layer.nodes + 1))}%`;
                  const isActive = (step % layers.length === lIdx);
                  const intensity = isActive ? 0.8 : 0.05;

                  return (
                    <div 
                      key={i} 
                      className="absolute -translate-y-1/2 left-0 right-0 flex justify-center"
                      style={{ top: posY }}
                    >
                      <div className="relative">
                        <div 
                          className="w-12 h-12 border border-white/50 bg-brand-bg relative z-10 transition-all duration-400"
                          style={{ 
                            backgroundColor: isActive ? `rgba(216,208,196,${0.4})` : 'transparent',
                            borderColor: isActive ? `rgba(216,208,196,0.9)` : 'rgba(255,255,255,0.5)'
                          }}
                        />
                        {isActive && (
                          <motion.div 
                            layoutId={`pulse-${lIdx}-${i}`}
                            className="absolute inset-0 border border-brand-text/40 z-0"
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 1.6, opacity: 0 }}
                            transition={{ duration: 0.8 }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">
                    {layer.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
