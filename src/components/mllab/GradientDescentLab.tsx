import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, ChevronRight, Settings2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button, useColorMode, useColorModeValue } from '@chakra-ui/react';

// --- Math Utilities ---
const FUNCTIONS = {
  quadratic: (x: number, y: number) => 0.5 * (x * x + y * y),
  saddle: (x: number, y: number) => 0.4 * (x * x - y * y) + 10,
  rosenbrock: (x: number, y: number) => (1 - x)**2 + 100 * (y - x**2)**2 / 100,
  complex: (x: number, y: number) => Math.sin(x) * Math.cos(y) * 5 + 5
};

const GRADIENTS = {
  quadratic: (x: number, y: number) => ({ dx: x, dy: y }),
  saddle: (x: number, y: number) => ({ dx: 0.8 * x, dy: -0.8 * y }),
  rosenbrock: (x: number, y: number) => ({
    dx: -2 * (1 - x) - 400 * x * (y - x**2) / 100,
    dy: 200 * (y - x**2) / 100
  }),
  complex: (x: number, y: number) => ({
    dx: Math.cos(x) * Math.cos(y) * 5,
    dy: -Math.sin(x) * Math.sin(y) * 5
  })
};

type FuncType = keyof typeof FUNCTIONS;

export default function GradientDescentLab() {
  const { t, lang } = useApp();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const [funcType, setFuncType] = useState<FuncType>('quadratic');
  const [lr, setLr] = useState(0.1);
  const [momentum, setMomentum] = useState(0);
  const [currentPos, setCurrentPos] = useState({ x: 2, y: 2 });
  const [velocity, setVelocity] = useState({ dx: 0, dy: 0 });
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [isAutoStepping, setIsAutoStepping] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasBg = useColorModeValue('rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.3)');
  const canvasBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  const activeBtnBg = useColorModeValue('teal.500', 'teal.300');
  const activeBtnText = useColorModeValue('white', 'gray.900');

  // --- Core Step Logic ---
  const step = () => {
    const grad = GRADIENTS[funcType](currentPos.x, currentPos.y);
    
    const newVelocity = {
      dx: momentum * velocity.dx - lr * grad.dx,
      dy: momentum * velocity.dy - lr * grad.dy
    };

    const newPos = {
      x: currentPos.x + newVelocity.dx,
      y: currentPos.y + newVelocity.dy
    };

    setVelocity(newVelocity);
    setCurrentPos(newPos);
    setPath(prev => [...prev, newPos].slice(-50));
  };

  useEffect(() => {
    if (!isAutoStepping) return;
    const interval = setInterval(step, 50);
    return () => clearInterval(interval);
  }, [isAutoStepping, currentPos, funcType, lr, momentum]);

  const reset = () => {
    const startX = (Math.random() - 0.5) * 8;
    const startY = (Math.random() - 0.5) * 8;
    setCurrentPos({ x: startX, y: startY });
    setVelocity({ dx: 0, dy: 0 });
    setPath([{ x: startX, y: startY }]);
    setIsAutoStepping(false);
  };

  // --- Drawing Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 40;
    const centerX = width / 2;
    const centerY = height / 2;

    const toCanvasX = (x: number) => centerX + x * scale;
    const toCanvasY = (y: number) => centerY - y * scale;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Heatmap
    const stepSize = 10;
    const baseColor = isDark ? '136, 204, 202' : '49, 151, 149';
    for (let x = 0; x < width; x += stepSize) {
      for (let y = 0; y < height; y += stepSize) {
        const valX = (x - centerX) / scale;
        const valY = -(y - centerY) / scale;
        const val = FUNCTIONS[funcType](valX, valY);
        const intensity = Math.max(0, Math.min(0.12, 0.12 - (val / 120)));
        ctx.fillStyle = `rgba(${baseColor}, ${intensity})`;
        ctx.fillRect(x, y, stepSize, stepSize);
      }
    }

    // 2. Draw Grid
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    ctx.beginPath();
    for (let x = -10; x <= 10; x++) {
      ctx.moveTo(centerX + x * scale, 0);
      ctx.lineTo(centerX + x * scale, height);
      ctx.moveTo(0, centerY + x * scale);
      ctx.lineTo(width, centerY + x * scale);
    }
    ctx.stroke();

    // 3. Draw Contours
    ctx.lineWidth = 1;
    const levels = [2, 5, 10, 20, 40, 70];
    levels.forEach(level => {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
      
      if (funcType === 'quadratic') {
        const r = Math.sqrt(level * 2) * scale;
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      } else if (funcType === 'saddle') {
        for (let sx = -10; sx <= 10; sx += 0.2) {
          const sy = Math.sqrt(Math.max(0, sx * sx - level / 0.4));
          if (sy >= 0) {
            ctx.lineTo(toCanvasX(sx), toCanvasY(sy));
            ctx.moveTo(toCanvasX(sx), toCanvasY(-sy));
            ctx.lineTo(toCanvasX(sx), toCanvasY(-sy));
          }
        }
      } else {
        ctx.arc(centerX, centerY, Math.sqrt(level) * scale, 0, Math.PI * 2);
      }
      ctx.stroke();
    });

    // 4. Draw Path
    if (path.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(136, 204, 202, 0.85)' : 'rgba(49, 151, 149, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.moveTo(toCanvasX(path[0].x), toCanvasY(path[0].y));
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(toCanvasX(path[i].x), toCanvasY(path[i].y));
      }
      ctx.stroke();
    }

    // 5. Draw Current Point
    ctx.beginPath();
    ctx.fillStyle = isDark ? '#88ccca' : '#319795';
    ctx.shadowBlur = 12;
    ctx.shadowColor = isDark ? 'rgba(136, 204, 202, 0.8)' : 'rgba(49, 151, 149, 0.6)';
    ctx.arc(toCanvasX(currentPos.x), toCanvasY(currentPos.y), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [currentPos, path, isDark, funcType]);

  return (
    <div className="h-full flex flex-col p-6 sm:p-8 bg-transparent">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-brand-text mb-0.5">
            {t('lab.gradient.foundational')}
          </h3>
          <p className="text-xs text-brand-muted">
            {t('lab.gradient.trajectory')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            size="sm"
            colorScheme="teal"
            variant={isAutoStepping ? 'solid' : 'outline'}
            borderRadius="lg"
            fontSize="xs"
            leftIcon={isAutoStepping ? <Pause size={14} /> : <Play size={14} />}
            onClick={() => setIsAutoStepping(!isAutoStepping)}
          >
            {isAutoStepping
              ? (lang === 'zh' ? '暂停' : 'Pause')
              : (lang === 'zh' ? '开始下降' : 'Start Descent')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            borderRadius="lg"
            fontSize="xs"
            onClick={reset}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row gap-6 relative overflow-hidden">
        {/* Canvas Area */}
        <div 
          className="flex-grow relative rounded-xl border overflow-hidden min-h-[340px]"
          style={{ backgroundColor: canvasBg, borderColor: 'var(--border)' }}
        >
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={400} 
            className="w-full h-full object-cover cursor-crosshair"
            onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = (e.clientX - rect.left - rect.width / 2) / 40;
                const y = -(e.clientY - rect.top - rect.height / 2) / 40;
                setCurrentPos({ x, y });
                setPath([{ x, y }]);
                setVelocity({ dx: 0, dy: 0 });
              }
            }}
          />
          <div className="absolute bottom-3 left-3 text-[11px] text-brand-muted font-medium bg-brand-card/60 backdrop-blur px-2.5 py-1 rounded">
            {t('lab.gradient.teleportHint')}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-56 shrink-0 space-y-6">
          {/* Function Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-brand-text">
              <Settings2 size={13} /> {lang === 'zh' ? '目标损失函数' : 'Loss Function'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5">
              {(Object.keys(FUNCTIONS) as FuncType[]).map(f => {
                const active = funcType === f;
                return (
                  <Button
                    key={f}
                    size="sm"
                    variant={active ? 'solid' : 'ghost'}
                    colorScheme="teal"
                    justifyContent="flex-start"
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight={active ? 'bold' : 'normal'}
                    onClick={() => { setFuncType(f); reset(); }}
                  >
                    {f}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-brand-muted">{t('lab.gradient.learningRate')}</span>
                <span className="font-mono font-medium text-brand-text">{lr.toFixed(3)}</span>
              </div>
              <input 
                type="range" min="0.001" max="0.5" step="0.001" value={lr} 
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="w-full accent-teal-500 h-1.5 bg-brand-border/40 rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-brand-muted">{t('lab.gradient.momentum')}</span>
                <span className="font-mono font-medium text-brand-text">{momentum.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="0.99" step="0.01" value={momentum} 
                onChange={(e) => setMomentum(parseFloat(e.target.value))}
                className="w-full accent-teal-500 h-1.5 bg-brand-border/40 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button 
              size="sm"
              w="full"
              variant="outline"
              borderRadius="lg"
              fontSize="xs"
              leftIcon={<ChevronRight size={14} />}
              onClick={step}
              isDisabled={isAutoStepping}
            >
              {lang === 'zh' ? '单步执行 (Step)' : 'Manual Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
