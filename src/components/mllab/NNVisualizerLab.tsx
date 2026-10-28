import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, useColorModeValue } from '@chakra-ui/react';

export default function NNVisualizerLab() {
  const { t, lang } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState(0);

  const layers = [
    { id: 'input', nodes: 3, label: 'Input' },
    { id: 'hidden1', nodes: 5, label: 'Hidden 1 (ReLU)' },
    { id: 'hidden2', nodes: 4, label: 'Hidden 2 (ReLU)' },
    { id: 'output', nodes: 2, label: 'Output (Softmax)' }
  ];

  const lineStroke = useColorModeValue('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.25)');
  const pulseFill = useColorModeValue('#319795', '#88ccca');
  const nodeDefaultBorder = useColorModeValue('rgba(0, 0, 0, 0.25)', 'rgba(255, 255, 255, 0.25)');
  const nodeActiveBg = useColorModeValue('rgba(49, 151, 149, 0.2)', 'rgba(136, 204, 202, 0.25)');
  const nodeActiveBorder = useColorModeValue('#319795', '#88ccca');
  const labelColor = useColorModeValue('rgba(0, 0, 0, 0.6)', 'rgba(255, 255, 255, 0.6)');
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  // Auto-pulse
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep(s => s + 1);
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col p-6 sm:p-8 bg-transparent">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-8 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold tracking-wide text-brand-text">
          {t('lab.nn.feedforward')}
        </h3>
        <Button
          size="sm"
          variant="outline"
          borderRadius="lg"
          fontSize="xs"
          leftIcon={isPlaying ? <Pause size={14} /> : <Play size={14} />}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying
            ? (lang === 'zh' ? '暂停模拟' : 'Pause Engine')
            : (lang === 'zh' ? '启动模拟' : 'Resume Engine')}
        </Button>
      </div>

      <div className="flex-grow relative mt-4 min-h-[360px]">
        {/* Draw Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {layers.map((layer, lIdx) => {
            if (lIdx === layers.length - 1) return null;
            const nextLayer = layers[lIdx + 1];
            
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
                      x1={`calc(${startX} + 20px)`} y1={startY}
                      x2={`calc(${endX} - 20px)`} y2={endY}
                      stroke={lineStroke}
                      strokeWidth="1.5"
                    />
                    {isPulsing && (
                      <motion.circle
                        r="3"
                        fill={pulseFill}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          cx: [startX, endX],
                          cy: [startY, endY],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{ transform: 'translateX(20px)' }}
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

                  return (
                    <div 
                      key={i} 
                      className="absolute -translate-y-1/2 left-0 right-0 flex justify-center"
                      style={{ top: posY }}
                    >
                      <div className="relative">
                        <div 
                          className="w-10 h-10 rounded-lg border relative z-10 transition-all duration-300 flex items-center justify-center shadow-sm"
                          style={{ 
                            backgroundColor: isActive ? nodeActiveBg : 'var(--card)',
                            borderColor: isActive ? nodeActiveBorder : nodeDefaultBorder,
                            boxShadow: isActive ? `0 0 12px ${nodeActiveBorder}` : undefined
                          }}
                        />
                        {isActive && (
                          <motion.div 
                            layoutId={`pulse-${lIdx}-${i}`}
                            className="absolute inset-0 rounded-lg border z-0"
                            style={{ borderColor: nodeActiveBorder }}
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.8 }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span 
                    className="text-xs font-medium"
                    style={{ color: labelColor }}
                  >
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
