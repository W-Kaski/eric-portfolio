import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Play, Pause, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const GRID_SIZE = 5;
const GOAL = { x: 4, y: 4 };
const TRAP = { x: 2, y: 2 };

export default function RLLab() {
  const { t } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [agentPos, setAgentPos] = useState({ x: 0, y: 0 });
  const [episode, setEpisode] = useState(1);
  const [score, setScore] = useState(0);

  // Q-Table mock logic
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setAgentPos(prev => {
        if ((prev.x === GOAL.x && prev.y === GOAL.y) || (prev.x === TRAP.x && prev.y === TRAP.y)) {
          setEpisode(e => e + 1);
          if (prev.x === GOAL.x) setScore(s => s + 10);
          else setScore(s => s - 5);
          return { x: 0, y: 0 }; 
        }

        const isExploiting = Math.random() > 0.3;
        let dx = 0, dy = 0;
        
        if (isExploiting) {
          if (prev.x < GOAL.x) dx = 1;
          else if (prev.y < GOAL.y) dy = 1;
        } else {
          const dir = Math.floor(Math.random() * 4);
          if (dir === 0) dx = 1;
          if (dir === 1) dx = -1;
          if (dir === 2) dy = 1;
          if (dir === 3) dy = -1;
        }

        let newX = Math.max(0, Math.min(GRID_SIZE - 1, prev.x + dx));
        let newY = Math.max(0, Math.min(GRID_SIZE - 1, prev.y + dy));

        if (newX !== prev.x || newY !== prev.y) {
          setScore(s => s - 1);
        }

        return { x: newX, y: newY };
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col p-8 bg-transparent">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6 text-white">
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase mb-2">Q-Learning Dashboard</h3>
          <div className="flex gap-6 text-[9px] font-bold tracking-widest uppercase">
            <span className="text-white/60">{t('lab.rl.episode')}<span className="text-white">{episode}</span></span>
            <span className={score < 0 ? 'text-red-400' : 'text-emerald-400 font-black'}>{t('lab.rl.reward')}{score}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 border border-white/10 flex items-center justify-center transition-colors hover:bg-white/5">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => { setAgentPos({ x: 0, y: 0 }); setEpisode(1); setScore(0); }} className="w-10 h-10 border border-white/10 flex items-center justify-center transition-colors hover:bg-white/5">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Grid World */}
      <div className="flex-grow flex items-center justify-center">
        <div 
          className="grid gap-1 p-1 bg-black/20 border border-white/5" 
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isAgent = x === agentPos.x && y === agentPos.y;
            const isGoal = x === GOAL.x && y === GOAL.y;
            const isTrap = x === TRAP.x && y === TRAP.y;

            return (
              <div 
                key={i} 
                className="w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center transition-colors duration-300 border border-white/20"
                style={{
                  backgroundColor: isGoal ? 'rgba(16, 185, 129, 0.4)' : isTrap ? 'rgba(239, 68, 68, 0.4)' : 'transparent'
                }}
              >
                {/* Agent Token */}
                {isAgent && (
                  <motion.div 
                    layoutId="agent"
                    className="w-10 h-10 bg-brand-text shadow-[0_0_20px_rgba(255,255,255,0.3)] z-10 flex items-center justify-center text-brand-bg"
                  >
                    <Zap size={16} fill="currentColor" />
                  </motion.div>
                )}
                
                {/* Labels */}
                {!isAgent && isGoal && <span className="text-xs font-black text-white uppercase tracking-tighter">{t('lab.rl.goal')}</span>}
                {!isAgent && isTrap && <span className="text-xs font-black text-white uppercase tracking-tighter">{t('lab.rl.trap')}</span>}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
