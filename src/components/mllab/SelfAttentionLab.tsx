import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useColorModeValue } from '@chakra-ui/react';

const sentence = ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired"];

// Hardcoded attention weights for common reference words
const getAttentionWeights = (sourceIndex: number): number[] => {
  const weights = new Array(sentence.length).fill(0.05);
  weights[sourceIndex] = 0.8;
  
  if (sourceIndex === 7) { // "it"
    weights[1] = 0.9; // "animal"
    weights[10] = 0.6; // "tired"
  } else if (sourceIndex === 1) { // "animal"
    weights[5] = 0.7; // "street"
    weights[7] = 0.5; // "it"
  } else if (sourceIndex === 5) { // "street"
    weights[1] = 0.4; // "animal"
    weights[3] = 0.6; // "cross"
  }
  
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / total);
};

export default function SelfAttentionLab() {
  const { t, lang } = useApp();
  const [activeIndex, setActiveIndex] = useState<number>(7);
  const [weights, setWeights] = useState<number[]>(getAttentionWeights(7));

  const arcStroke = useColorModeValue('#319795', '#88ccca');
  const cardBorder = useColorModeValue('blackAlpha.300', 'whiteAlpha.300');
  const activeBg = useColorModeValue('rgba(49, 151, 149, 0.15)', 'rgba(136, 204, 202, 0.2)');
  const weightBadgeColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    setWeights(getAttentionWeights(activeIndex));
  }, [activeIndex]);

  return (
    <div className="h-full flex flex-col p-6 sm:p-8 bg-transparent relative">
      <div className="flex items-center justify-between gap-4 mb-8 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold tracking-wide text-brand-text">
          {t('lab.attention.selectToken')}
        </h3>
        <span className="text-xs text-brand-muted">
          {lang === 'zh' ? '点击单词观察自注意力权重分布' : 'Click a token to observe self-attention weights'}
        </span>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center gap-12 relative min-h-[320px]">
        {/* Connection Arcs (SVG) */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            {sentence.map((_, i) => {
              if (i === activeIndex) return null;
              const opacity = Math.pow(weights[i] * 4, 1.4);
              const distance = Math.abs(i - activeIndex);
              const curveHeight = distance * 16;
              
              return (
                <path
                  key={i}
                  d={`M ${(activeIndex / (sentence.length - 1)) * 90 + 5}% 60% Q ${((activeIndex + i) / 2 / (sentence.length - 1)) * 90 + 5}% ${60 - curveHeight}% ${(i / (sentence.length - 1)) * 90 + 5}% 60%`}
                  fill="none"
                  stroke={arcStroke}
                  strokeWidth={weights[i] * 12}
                  opacity={opacity > 0.85 ? 0.85 : opacity < 0.05 ? 0 : opacity}
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </svg>
        </div>

        {/* Word Chips */}
        <div className="flex flex-wrap justify-between w-full px-[4%] z-10 gap-2">
          {sentence.map((word, i) => {
            const isSource = i === activeIndex;
            const weight = weights[i];
            const weightOpacity = Math.min(1, weight * 3.5);

            return (
              <motion.div 
                key={i}
                className={`relative flex flex-col items-center cursor-pointer px-3.5 py-3 rounded-xl transition-all border ${
                  isSource ? 'shadow-md scale-105' : 'hover:bg-brand-card/60'
                }`}
                style={{
                  borderColor: isSource ? arcStroke : 'var(--border)',
                  backgroundColor: isSource ? activeBg : 'var(--card)'
                }}
                onClick={() => setActiveIndex(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="absolute inset-0 rounded-xl -z-10 transition-opacity duration-500" 
                  style={{ 
                    backgroundColor: arcStroke,
                    opacity: isSource ? 0 : weightOpacity * 0.25 
                  }} 
                />
                <span className="text-sm font-mono font-bold z-10 text-brand-text">
                  {word}
                </span>
                <span 
                  className="text-[10px] mt-1.5 font-mono z-10 font-medium"
                  style={{ color: weightBadgeColor }}
                >
                  {(weight * 100).toFixed(1)}%
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
