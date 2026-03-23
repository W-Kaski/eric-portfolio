import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Play, Pause, Zap } from 'lucide-react';

const GRID_SIZE = 5;
const GOAL = { x: 4, y: 4 };
const TRAP = { x: 2, y: 2 };

export default function RLLab() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [agentPos, setAgentPos] = useState({ x: 0, y: 0 });
  const [episode, setEpisode] = useState(1);
  const [score, setScore] = useState(0);

  // Q-Table mock logic (simplistic epsilon-greedy random walk bias towards goal)
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setAgentPos(prev => {
        // If reached goal or trap, reset
        if ((prev.x === GOAL.x && prev.y === GOAL.y) || (prev.x === TRAP.x && prev.y === TRAP.y)) {
          setEpisode(e => e + 1);
          if (prev.x === GOAL.x) setScore(s => s + 10);
          else setScore(s => s - 5);
          return { x: 0, y: 0 }; // Reset to start
        }

        // Simplistic policy: 70% go towards goal, 30% random
        const isExploiting = Math.random() > 0.3;
        
        let dx = 0, dy = 0;
        
        if (isExploiting) {
          // Move closer to goal
          if (prev.x < GOAL.x) dx = 1;
          else if (prev.y < GOAL.y) dy = 1;
        } else {
          // Random
          const dir = Math.floor(Math.random() * 4);
          if (dir === 0) dx = 1;
          if (dir === 1) dx = -1;
          if (dir === 2) dy = 1;
          if (dir === 3) dy = -1;
        }

        let newX = Math.max(0, Math.min(GRID_SIZE - 1, prev.x + dx));
        let newY = Math.max(0, Math.min(GRID_SIZE - 1, prev.y + dy));

        // Slightly penalize step
        if (newX !== prev.x || newY !== prev.y) {
          setScore(s => s - 1);
        }

        return { x: newX, y: newY };
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col p-8 rounded-3xl bg-black/40">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-bold tracking-tighter mb-1">Q-Learning Dashboard</h3>
          <div className="flex gap-4 text-xs font-mono text-brand-muted">
            <span>EPISODE: {episode}</span>
            <span className={score < 0 ? 'text-red-400' : 'text-green-400'}>REWARD: {score}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={() => { setAgentPos({ x: 0, y: 0 }); setEpisode(1); setScore(0); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Grid World */}
      <div className="flex-grow flex items-center justify-center">
        <div 
          className="grid gap-2 p-2 bg-brand-bg rounded-2xl border border-white/5" 
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
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl relative flex items-center justify-center transition-colors duration-300"
                style={{
                  backgroundColor: isGoal ? 'rgba(16, 185, 129, 0.2)' : isTrap ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)'
                }}
              >
                {/* Agent Token */}
                {isAgent && (
                  <motion.div 
                    layoutId="agent"
                    className="w-8 h-8 rounded-full bg-brand-text shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10 flex items-center justify-center text-brand-bg"
                  >
                    <Zap size={14} fill="currentColor" />
                  </motion.div>
                )}
                
                {/* Labels */}
                {!isAgent && isGoal && <span className="text-xl">🏆</span>}
                {!isAgent && isTrap && <span className="text-xl">🔥</span>}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
