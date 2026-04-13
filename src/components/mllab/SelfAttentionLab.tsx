import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Search } from 'lucide-react';

const sentence = ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired"];

// Hardcoded attention weights for the word "it" (index 7)
// High attention on "animal" and "tired", self-attention on "it".
const getAttentionWeights = (sourceIndex: number): number[] => {
  const weights = new Array(sentence.length).fill(0.05); // baseline
  weights[sourceIndex] = 0.8; // self
  
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
  
  // Normalize
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / total);
};

export default function SelfAttentionLab() {
  const [activeIndex, setActiveIndex] = useState<number>(7);
  const [weights, setWeights] = useState<number[]>(getAttentionWeights(7));

  useEffect(() => {
    setWeights(getAttentionWeights(activeIndex));
  }, [activeIndex]);

  return (
    <div className="h-full flex flex-col p-6 bg-transparent relative">
      <div className="flex items-center justify-between gap-4 mb-10">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">Select token to view attention weights</div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center gap-12 relative">
        {/* Connection Arcs (SVG) */}
        <div className="absolute inset-0 pointer-events-none">
           <svg className="w-full h-full">
             {sentence.map((_, i) => {
               if (i === activeIndex) return null;
               const opacity = Math.pow(weights[i] * 4, 1.5); // Accentuating diffs
               const distance = Math.abs(i - activeIndex);
               const curveHeight = distance * 15;
               
               return (
                 <path
                   key={i}
                   d={`M ${(activeIndex / (sentence.length-1)) * 90 + 5}% 60% Q ${((activeIndex + i) / 2 / (sentence.length-1)) * 90 + 5}% ${60 - curveHeight}% ${(i / (sentence.length-1)) * 90 + 5}% 60%`}
                   fill="none"
                   stroke="#3B82F6"
                   strokeWidth={weights[i] * 10}
                   opacity={opacity > 0.8 ? 0.8 : opacity < 0.05 ? 0 : opacity}
                   className="transition-all duration-500 ease-out"
                 />
               )
             })}
           </svg>
        </div>

        <div className="flex flex-wrap justify-between w-full px-[5%] z-10 gap-2">
          {sentence.map((word, i) => {
            const isSource = i === activeIndex;
            const weight = weights[i];
            const weightOpacity = Math.min(1, weight * 4); // normalize to vis

            return (
              <motion.div 
                key={i}
                className={`relative flex flex-col items-center cursor-pointer p-4 rounded-lg transition-colors border ${isSource ? 'border-white/50 bg-white/10' : 'border-transparent hover:bg-white/5'}`}
                onClick={() => setActiveIndex(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="absolute inset-0 bg-blue-500 rounded-lg -z-10 transition-opacity duration-500" 
                  style={{ opacity: isSource ? 0 : weightOpacity * 0.5 }} 
                />
                <span className="text-sm font-mono tracking-wider font-bold z-10 text-white">{word}</span>
                <span className="text-[8px] text-white/50 mt-2 uppercase font-mono z-10">
                  {(weight * 100).toFixed(1)}%
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
