import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Search, ChevronRight, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const vectorDB = [
  { id: 1, text: "The quick brown fox jumps over the lazy dog.", coords: [20, 30] },
  { id: 2, text: "Quantum computing utilizes superposition for faster calculation.", coords: [80, 20] },
  { id: 3, text: "Machine learning relies on gradient descent optimization.", coords: [70, 70] },
  { id: 4, text: "Photosynthesis is the process by which plants make glucose.", coords: [10, 80] },
  { id: 5, text: "Generative AI creates novel content based on existing patterns.", coords: [60, 85] }
];

export default function RAGExplorerLab() {
  const { t } = useApp();
  const [query, setQuery] = useState("How does neural network optimization work?");
  const [step, setStep] = useState(0); 
  // steps: 0 (idle), 1 (embedding query), 2 (searching space), 3 (retrieving), 4 (augmented prompt)
  
  const [queryCoords, setQueryCoords] = useState<[number, number] | null>(null);
  
  const reset = () => { setStep(0); setQueryCoords(null); };

  const playSimulation = () => {
    reset();
    setTimeout(() => {
      setStep(1); // embedding
      setTimeout(() => {
        setQueryCoords([75, 65]); // hardcoded near machine learning entry
        setStep(2); // mapping
        setTimeout(() => {
          setStep(3); // retrieving top 2
          setTimeout(() => {
            setStep(4); // augmented
          }, 2000);
        }, 2000);
      }, 1500);
    }, 500);
  };

  const topK = [vectorDB[2], vectorDB[4]]; // Machine learning & Generative AI

  return (
    <div className="h-full flex flex-col p-6 bg-transparent relative">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden flex-grow max-w-md">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm px-4 py-2 w-full font-mono"
            disabled={step > 0}
          />
          <button 
            className="px-4 bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            onClick={playSimulation}
            disabled={step > 0}
          >
            {t('lab.rag.run')}
          </button>
        </div>
        <button onClick={reset} className="text-xs text-white/50 uppercase font-bold tracking-widest hover:text-white transition-colors">{t('lab.rag.reset')}</button>
      </div>

      <div className="flex flex-grow gap-6">
        {/* Status Pipeline */}
        <div className="w-1/3 flex flex-col gap-4 border-r border-white/10 pr-6">
          <div className={`p-4 rounded border transition-all duration-500 ${step >= 1 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 opacity-40'}`}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">1. Embedding Model</h3>
            <p className="text-xs font-mono text-white/90">{t('lab.rag.embeddingModel')}</p>
            {step === 1 && (
              <motion.div initial={{width:0}} animate={{width:'100%'}} className="h-0.5 bg-emerald-500 mt-2" transition={{duration: 1.5}}/>
            )}
          </div>

          <div className={`p-4 rounded border transition-all duration-500 ${step >= 2 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 opacity-40'}`}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">2. Vector Database</h3>
            <div className="flex items-center gap-2">
              <Database size={14} className="text-emerald-500"/>
              <span className="text-xs font-mono text-white/90">{t('lab.rag.pgvector')}</span>
            </div>
          </div>

          <AnimatePresence>
            {step >= 3 && (
              <motion.div 
                initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                className="p-4 rounded border border-emerald-500/50 bg-emerald-500/5 mt-auto"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">{t('lab.rag.retrievedContext')}</h3>
                {topK.map(k => (
                  <div key={k.id} className="text-[9px] text-white/80 font-mono mb-1 truncate border-l-2 border-emerald-500/50 pl-2">
                    {k.text}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2D Vector Space Visualizer */}
        <div className="w-2/3 relative rounded bg-black/30 border border-white/5 overflow-hidden">
          {vectorDB.map(v => (
            <div 
               key={v.id} 
               className={`absolute w-3 h-3 rounded-full transition-all duration-1000 -ml-1.5 -mt-1.5 shadow-[0_0_10px_rgba(255,255,255,0.2)] ${step >= 3 && topK.find(t=>t.id===v.id) ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-150' : 'bg-white/20'}`}
               style={{ left: `${v.coords[0]}%`, top: `${v.coords[1]}%` }}
            >
              <span className="absolute left-4 -top-1 w-32 text-[8px] font-mono text-white/60 whitespace-nowrap">{v.text.substring(0, 20)}...</span>
            </div>
          ))}

          {queryCoords && step >= 2 && (
            <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="absolute w-4 h-4 bg-emerald-500/80 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] -ml-2 -mt-2 z-10 flex items-center justify-center"
               style={{ left: `${queryCoords[0]}%`, top: `${queryCoords[1]}%` }}
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
              {step >= 3 && (
                <motion.svg className="absolute inset-0 w-48 h-48 -ml-24 -mt-24 pointer-events-none" initial={{opacity:0}} animate={{opacity:1}}>
                  <circle cx="50%" cy="50%" r="35" fill="none" stroke="rgba(16,185,129,0.5)" strokeDasharray="4 4" />
                  <circle cx="50%" cy="50%" r="65" fill="none" stroke="rgba(16,185,129,0.2)" strokeDasharray="4 4" />
                </motion.svg>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              initial={{opacity: 0}} animate={{opacity: 1}}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm z-20"
            >
              <FileText size={32} className="text-white mb-4" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-white mb-4">{t('lab.rag.promptAugmented')}</h2>
              <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded text-left w-full max-w-lg shadow-2xl">
                <p className="text-[10px] text-white/50 font-mono mb-2">{t('lab.rag.systemPrompt')}</p>
                <p className="text-xs text-white/90 font-mono mb-1">{t('lab.rag.contextLabel')}</p>
                {topK.map(k => <p key={k.id} className="text-xs text-emerald-400 font-mono border-l border-emerald-500/50 pl-2 mb-1">{k.text}</p>)}
                <p className="text-xs text-white/90 font-mono mt-4 mb-1">{t('lab.rag.userQueryLabel')}{query}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
