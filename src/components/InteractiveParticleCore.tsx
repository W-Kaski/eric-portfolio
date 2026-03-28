import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  nx: number; // normalized x
  ny: number;
  nz: number;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  noise: number; // Random perturbation for organic feel
}

export const InteractiveParticleCore = ({ className = "" }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isHovering: false });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx2 = canvas.getContext('2d', { alpha: true });
    if (!ctx2) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // Support Retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx2.scale(dpr, dpr);

    let textColor = getComputedStyle(canvas).color || '#000000';

    // Geometry Generation (Fibonacci Sphere)
    const NUM_PARTICLES = 3500;
    const PARTICLES: Particle[] = [];

    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const y = 1 - (i / (NUM_PARTICLES - 1)) * 2; // y goes from 1 to -1
        const radius = Math.sqrt(1 - y * y); // radius at y
        const theta = phi * i;

        PARTICLES.push({
            nx: Math.cos(theta) * radius,
            ny: y,
            nz: Math.sin(theta) * radius,
            cx: width / 2 + (Math.random() - 0.5) * 1000, // Start scattered
            cy: height / 2 + (Math.random() - 0.5) * 1000,
            vx: 0,
            vy: 0,
            noise: (Math.random() - 0.5) * 0.15
        });
    }

    // Animation state
    let rx = 0;
    let ry = 0;
    const FOCAL_LENGTH = 1000;
    const SPRING = 0.04;
    const FRICTION = 0.82;
    const REPEL_RADIUS = 180;
    const REPEL_STRENGTH = 4;

    let frameId: number;

    const render = () => {
        // Subtle auto-rotation
        rx += 0.002;
        ry += 0.003;

        const cosX = Math.cos(rx);
        const sinX = Math.sin(rx);
        const cosY = Math.cos(ry);
        const sinY = Math.sin(ry);

        const centerX = width / 2;
        const centerY = height / 2;
        const currentRadius = Math.min(width, height) * 0.35;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;

        ctx2.clearRect(0, 0, width, height);
        
        ctx2.fillStyle = textColor; 
        ctx2.globalAlpha = 0.6; // Opacity applied globally

        for (let i = 0; i < NUM_PARTICLES; i++) {
            const p = PARTICLES[i];

            const ox = p.nx * currentRadius * (1 + p.noise);
            const oy = p.ny * currentRadius * (1 + p.noise);
            const oz = p.nz * currentRadius * (1 + p.noise);

            // 1. Rotate in 3D
            // Rotate around x
            const y1 = oy * cosX - oz * sinX;
            const z1 = oy * sinX + oz * cosX;
            // Rotate around y
            const x2 = ox * cosY + z1 * sinY;
            const z2 = -ox * sinY + z1 * cosY;

            // 2. Project to 2D
            const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z2);
            const targetX = centerX + x2 * scale;
            const targetY = centerY + y1 * scale;

            // 3. Mouse Repulsion
            let ax = (targetX - p.cx) * SPRING;
            let ay = (targetY - p.cy) * SPRING;

            const dx = p.cx - mx;
            const dy = p.cy - my;
            const distSq = dx * dx + dy * dy;

            if (distSq < REPEL_RADIUS * REPEL_RADIUS && mouseRef.current.isHovering) {
                const dist = Math.sqrt(distSq);
                const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
                const angle = Math.atan2(dy, dx);
                ax += Math.cos(angle) * force * REPEL_STRENGTH;
                ay += Math.sin(angle) * force * REPEL_STRENGTH;
            }

            // 4. Update Physics
            p.vx = (p.vx + ax) * FRICTION;
            p.vy = (p.vy + ay) * FRICTION;
            p.cx += p.vx;
            p.cy += p.vy;

            // 5. Draw
            const size = Math.max(0.5, scale * 1.5 + p.noise);
            
            ctx2.fillRect(p.cx, p.cy, size, size);
        }

        frameId = requestAnimationFrame(render);
    };

    // Trigger explosive intro after small delay
    setTimeout(() => {
        setIsLoaded(true);
        render();
    }, 100);

    let observer: MutationObserver;
    const handleResize = () => {
        if (!containerRef.current) return;
        width = containerRef.current.clientWidth;
        height = containerRef.current.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx2.scale(dpr, dpr);
        textColor = getComputedStyle(canvas).color || '#000000';
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    observer = new MutationObserver(() => {
        textColor = getComputedStyle(canvas).color || '#000000';
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return () => {
        resizeObserver.disconnect();
        observer.disconnect();
        cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full transition-opacity duration-1000 ${className}`}
      style={{ opacity: isLoaded ? 1 : 0 }}
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
        mouseRef.current.isHovering = true;
      }}
      onMouseLeave={() => {
        mouseRef.current.isHovering = false;
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ touchAction: 'none' }} />
    </div>
  );
};
