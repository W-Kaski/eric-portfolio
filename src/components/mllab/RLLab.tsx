import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Play, Pause, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, useColorModeValue } from '@chakra-ui/react';

const GRID_SIZE = 5;
const GOAL = { x: 4, y: 4 };
const TRAP = { x: 2, y: 2 };

export default function RLLab() {
  const { t, lang } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [agentPos, setAgentPos] = useState({ x: 0, y: 0 });
  const [episode, setEpisode] = useState(1);
  const [score, setScore] = useState(0);

  const gridBg = useColorModeValue('rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.25)');
  const cellBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const agentBg = useColorModeValue('teal.600', 'teal.300');
  const agentIconColor = useColorModeValue('white', 'gray.900');

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
    <div className="h-full flex flex-col p-6 sm:p-8 bg-transparent">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-brand-text mb-1">
            {lang === 'zh' ? 'Q-Learning 强化学习控制面板' : 'Q-Learning Dashboard'}
          </h3>
          <div className="flex gap-4 text-xs font-medium">
            <span className="text-brand-muted">
              {t('lab.rl.episode')}: <strong className="text-brand-text font-mono">{episode}</strong>
            </span>
            <span className={score < 0 ? 'text-red-500 font-mono font-bold' : 'text-emerald-500 font-mono font-bold'}>
              {t('lab.rl.reward')}: {score}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            borderRadius="lg"
            fontSize="xs"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            borderRadius="lg"
            fontSize="xs"
            onClick={() => { setAgentPos({ x: 0, y: 0 }); setEpisode(1); setScore(0); }}
            title="Reset"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Grid World */}
      <div className="flex-grow flex items-center justify-center min-h-[320px]">
        <div 
          className="grid gap-1.5 p-2 rounded-2xl border shadow-sm"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            backgroundColor: gridBg,
            borderColor: 'var(--border)'
          }}
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
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl relative flex items-center justify-center transition-colors duration-300 border"
                style={{
                  borderColor: cellBorder,
                  backgroundColor: isGoal 
                    ? 'rgba(16, 185, 129, 0.25)' 
                    : isTrap 
                    ? 'rgba(239, 68, 68, 0.25)' 
                    : 'var(--card)'
                }}
              >
                {/* Agent Token */}
                {isAgent && (
                  <motion.div 
                    layoutId="agent"
                    className="w-9 h-9 md:w-11 md:h-11 rounded-lg z-10 flex items-center justify-center shadow-md"
                    style={{ backgroundColor: agentBg, color: agentIconColor }}
                  >
                    <Zap size={16} fill="currentColor" />
                  </motion.div>
                )}
                
                {/* Labels */}
                {!isAgent && isGoal && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                    {t('lab.rl.goal')}
                  </span>
                )}
                {!isAgent && isTrap && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-300">
                    {t('lab.rl.trap')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
