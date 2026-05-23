import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Search, Terminal, FileCode2, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const steps = [
  { id: 1, type: "thought", text: "User wants weather in Tokyo and its Fahrenheit equivalent. I need to get the current weather first." },
  { id: 2, type: "action", tool: "WebSearch", args: '{"query": "weather in Tokyo celsius"}' },
  { id: 3, type: "observation", text: "Current weather in Tokyo is 15°C." },
  { id: 4, type: "thought", text: "I have the Celsius temperature. Now I need to calculate the Fahrenheit equivalent using the formula: (C * 9/5) + 32." },
  { id: 5, type: "action", tool: "PythonInterpreter", args: '{"code": "c = 15\\nf = (c * 9/5) + 32\\nprint(f)"}' },
  { id: 6, type: "observation", text: "59.0" },
  { id: 7, type: "thought", text: "I have both temperatures. I can construct the final answer now." },
  { id: 8, type: "finish", text: "The current weather in Tokyo is 15°C, which is exactly 59.0°F." }
];

export default function ReActAgentLab() {
  const { t } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (playing && currentStepIndex < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, currentStepIndex === -1 ? 500 : 1800); // 1.8s per step
      return () => clearTimeout(timer);
    } else if (playing && currentStepIndex >= steps.length) {
      setPlaying(false);
    }
  }, [playing, currentStepIndex]);

  const startReAct = () => {
    setCurrentStepIndex(-1);
    setPlaying(true);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-transparent relative">
      <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase mb-1">{t('lab.react.userPrompt')}</span>
          <span className="text-sm font-mono text-white/90">{t('lab.react.defaultPrompt')}</span>
        </div>
        <button 
          onClick={startReAct}
          disabled={playing}
          className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-white/80 transition-colors disabled:opacity-50"
        >
          {currentStepIndex >= steps.length ? 'Restart Agent' : (playing ? 'Processing...' : 'Start Execution')}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto scrollbar-hide flex flex-col gap-4 pr-4">
        {steps.map((step, idx) => {
          if (idx > currentStepIndex) return null;
          
          let Icon = Bot;
          let colorClass = "border-white/20 text-white/80";
          let bgClass = "bg-white/5";
          let label = "THOUGHT";

          if (step.type === 'action') {
            Icon = step.tool === 'WebSearch' ? Search : Terminal;
            colorClass = "border-blue-500/50 text-blue-400";
            bgClass = "bg-blue-500/10";
            label = `ACTION: ${step.tool}`;
          } else if (step.type === 'observation') {
            Icon = FileCode2;
            colorClass = "border-emerald-500/50 text-emerald-400";
            bgClass = "bg-emerald-500/10";
            label = "OBSERVATION";
          } else if (step.type === 'finish') {
            Icon = Check;
            colorClass = "border-white/80 text-white";
            bgClass = "bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]";
            label = "FINAL ANSWER";
          }

          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 border rounded-lg flex items-start gap-4 ${colorClass} ${bgClass}`}
            >
              <div className="mt-1 flex-shrink-0">
                <Icon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</span>
                {step.type === 'action' ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap">{step.args}</pre>
                ) : (
                  <p className="text-sm font-mono leading-relaxed">{step.text}</p>
                )}
              </div>
            </motion.div>
          )
        })}
        {playing && currentStepIndex < steps.length - 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 text-white/50"
          >
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{t('lab.react.processing')}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
